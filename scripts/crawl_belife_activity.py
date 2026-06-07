#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
belife.org '활동소식' 게시판 크롤러 → PostgreSQL INSERT SQL 생성기

대상: http://www.belife.org/belife/bbs/board.php?bo_table=dzzz  (그누보드 활동소식)
출력: migrations/seed_activity_posts.sql  (posts 테이블, category='activity')

표준 라이브러리만 사용 (urllib, html, re). 외부 패키지 불필요.

사용법:
    python3 scripts/crawl_belife_activity.py                 # 전체 페이지 크롤링
    python3 scripts/crawl_belife_activity.py --pages 3       # 앞 3페이지만
    python3 scripts/crawl_belife_activity.py --out out.sql   # 출력 파일 지정
    python3 scripts/crawl_belife_activity.py --limit 20      # 최대 20개 글만
"""
import argparse
import html
import os
import re
import sys
import time
import urllib.request
from urllib.parse import urljoin

BASE = "http://www.belife.org/belife/"
LIST_URL = BASE + "bbs/board.php?bo_table=dzzz&page={page}"
VIEW_URL = BASE + "bbs/board.php?bo_table=dzzz&wr_id={wr_id}"
UA = "Mozilla/5.0 (compatible; belife-archiver/1.0)"
TIMEOUT = 30
DELAY = 0.4  # 서버 부하 방지용 요청 간 지연(초)


def fetch(url, retries=3):
    """URL을 가져와 UTF-8 문자열로 반환. 게시판 페이지는 UTF-8."""
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                raw = r.read()
            return raw.decode("utf-8", errors="replace")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1 + i)
    raise RuntimeError(f"fetch 실패: {url} ({last})")


# ── 목록 파싱 ────────────────────────────────────────────────────────────────
# 한 행에서 분류(sca), wr_id, 제목, 글쓴이, 날짜, 조회를 추출한다.
ROW_RE = re.compile(
    r"<tr[^>]*height=\"33\"[^>]*>(.*?)</tr>", re.S | re.I
)
WRID_RE = re.compile(r"wr_id=(\d+)")
SCA_RE = re.compile(r"sca=([^\"&]+)\"")
TITLE_RE = re.compile(r"wr_id=\d+'><span[^>]*>(.*?)</span>", re.S)
AUTHOR_RE = re.compile(r"class='member'>(.*?)</span>", re.S)
DATE_RE = re.compile(r"class=\"text8\" align=\"center\">([\d\-]{6,10})</td>")


def parse_list(htmlstr):
    """목록 HTML → [{wr_id, category, title, author, list_date}] (페이지 내 순서)."""
    out = []
    for block in ROW_RE.findall(htmlstr):
        m = WRID_RE.search(block)
        if not m:
            continue
        wr_id = int(m.group(1))
        sca = SCA_RE.search(block)
        category = ""
        if sca:
            from urllib.parse import unquote
            category = unquote(sca.group(1))
        t = TITLE_RE.search(block)
        title = html.unescape(t.group(1).strip()) if t else ""
        a = AUTHOR_RE.search(block)
        author = html.unescape(a.group(1).strip()) if a else "belife"
        d = DATE_RE.search(block)
        list_date = d.group(1) if d else ""
        out.append(
            {
                "wr_id": wr_id,
                "category": category,
                "title": title,
                "author": author,
                "list_date": list_date,
            }
        )
    return out


# ── 본문 파싱 ────────────────────────────────────────────────────────────────
VIEW_TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S | re.I)
VIEW_DATE_RE = re.compile(r"작성일</span>\s*:\s*<span[^>]*>(\d{4}-\d{2}-\d{2})")
VIEW_VIEWS_RE = re.compile(r"조회</span>\s*:\s*(\d+)")
CONTENT_RE = re.compile(
    r'id="writeContents">(.*?)</span>\s*<!-- 테러 태그 방지용', re.S
)
IMG_SRC_RE = re.compile(r"<img[^>]+src=[\"'](http[^\"']+)[\"']", re.I)
TAG_RE = re.compile(r"<[^>]+>")


def parse_view(htmlstr):
    """보기 HTML → {title, published_at, views, body_html, thumbnail, excerpt}."""
    title = ""
    mt = VIEW_TITLE_RE.search(htmlstr)
    if mt:
        # "게시판 > 활동소식 > 실제제목" → 마지막 조각
        title = html.unescape(mt.group(1).split(">")[-1].strip())

    md = VIEW_DATE_RE.search(htmlstr)
    published_at = md.group(1) if md else ""

    mv = VIEW_VIEWS_RE.search(htmlstr)
    views = int(mv.group(1)) if mv else 0

    body_html = ""
    mc = CONTENT_RE.search(htmlstr)
    if mc:
        body_html = mc.group(1).strip()

    mi = IMG_SRC_RE.search(body_html)
    thumbnail = mi.group(1) if mi else ""

    text = html.unescape(TAG_RE.sub(" ", body_html))
    text = re.sub(r"\s+", " ", text).strip()
    excerpt = text[:160]

    return {
        "title": title,
        "published_at": published_at,
        "views": views,
        "body_html": body_html,
        "thumbnail": thumbnail,
        "excerpt": excerpt,
    }


# ── SQL 생성 ─────────────────────────────────────────────────────────────────
def sql_str(v):
    """PostgreSQL 문자열 리터럴(작은따옴표 이스케이프). None/빈값 처리."""
    if v is None or v == "":
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def sql_tags(tag):
    """분류 태그 → PostgreSQL TEXT[] 리터럴. 빈 값이면 빈 배열."""
    if not tag:
        return "'{}'"
    return "ARRAY[" + ("'" + str(tag).replace("'", "''") + "'") + "]::text[]"


def to_sql(rows):
    lines = [
        "-- belife.org 활동소식(bo_table=dzzz) 크롤링 결과",
        "-- 대상 테이블: posts (migrations/001_init.sql), category='activity'",
        "-- slug = activity-<wr_id> 로 고유성 보장, 재실행 안전(ON CONFLICT).",
        "",
        "-- 분류 태그(가정방문/어린이 등) 보존용 컬럼 보장",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';",
        "",
        "BEGIN;",
        "",
    ]
    for r in rows:
        slug = f"activity-{r['wr_id']}"
        published_at = r["published_at"] or r["list_date_full"] or "2000-01-01"
        lines.append(
            "INSERT INTO posts (slug, title, category, published_at, thumbnail, excerpt, body, tags)\n"
            "VALUES (\n"
            f"  {sql_str(slug)},\n"
            f"  {sql_str(r['title'])},\n"
            f"  'activity',\n"
            f"  {sql_str(published_at)},\n"
            f"  {sql_str(r['thumbnail'])},\n"
            f"  {sql_str(r['excerpt'])},\n"
            f"  {sql_str(r['body_html'])},\n"
            f"  {sql_tags(r['category'])}\n"
            ")\nON CONFLICT (slug) DO NOTHING;"
        )
        lines.append("")
    lines.append("COMMIT;")
    return "\n".join(lines)


def to_tags_sql(items):
    """목록에서 수집한 (wr_id, category) → 기존 posts 행의 tags UPDATE SQL."""
    lines = [
        "-- belife.org 활동소식 분류 태그 보정 (이미 적재된 posts 행 대상)",
        "-- migrations/004_post_tags.sql 적용 후 실행하거나, 아래 ALTER로 컬럼을 보장한다.",
        "",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';",
        "",
        "BEGIN;",
        "",
    ]
    n = 0
    for it in items:
        if not it.get("category"):
            continue
        slug = f"activity-{it['wr_id']}"
        lines.append(
            f"UPDATE posts SET tags = {sql_tags(it['category'])} WHERE slug = {sql_str(slug)};"
        )
        n += 1
    lines.append("")
    lines.append("COMMIT;")
    lines.append(f"-- 태그 보정 대상: {n}건")
    return "\n".join(lines)


def normalize_list_date(yymmdd):
    """'26-05-22' → '2026-05-22'. 빈 값이면 ''."""
    m = re.match(r"(\d{2})-(\d{2})-(\d{2})", yymmdd or "")
    if not m:
        return ""
    yy, mm, dd = m.groups()
    yyyy = ("20" if int(yy) < 70 else "19") + yy
    return f"{yyyy}-{mm}-{dd}"


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="belife.org 활동소식 크롤러 → SQL")
    ap.add_argument("--pages", type=int, default=0, help="크롤링할 페이지 수(0=전체)")
    ap.add_argument("--limit", type=int, default=0, help="최대 글 수(0=무제한)")
    ap.add_argument(
        "--tags-only",
        action="store_true",
        help="목록만 순회해 분류 태그 UPDATE SQL 생성(본문 미수집, 빠름)",
    )
    ap.add_argument(
        "--out",
        default=os.path.join(
            os.path.dirname(__file__), "..", "migrations", "seed_activity_posts.sql"
        ),
        help="출력 SQL 경로",
    )
    args = ap.parse_args()

    collected = []
    seen = set()
    page = 1
    while True:
        if args.pages and page > args.pages:
            break
        url = LIST_URL.format(page=page)
        print(f"[목록] page {page} 가져오는 중...", file=sys.stderr)
        listhtml = fetch(url)
        items = parse_list(listhtml)
        if not items:
            print(f"[목록] page {page}: 글 없음 → 종료", file=sys.stderr)
            break
        new_items = [it for it in items if it["wr_id"] not in seen]
        if not new_items:
            # 마지막 페이지를 넘어 같은 내용이 반복되면 중단
            print(f"[목록] page {page}: 새 글 없음 → 종료", file=sys.stderr)
            break
        for it in new_items:
            seen.add(it["wr_id"])
            collected.append(it)
        page += 1
        if args.limit and len(collected) >= args.limit:
            collected = collected[: args.limit]
            break
        time.sleep(DELAY)

    if args.tags_only:
        out_path = os.path.abspath(
            args.out
            if args.out != ap.get_default("out")
            else os.path.join(
                os.path.dirname(__file__), "..", "migrations", "seed_activity_tags.sql"
            )
        )
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(to_tags_sql(collected))
        tagged = sum(1 for it in collected if it.get("category"))
        print(
            f"[완료] 태그 보정 {tagged}/{len(collected)}건 → {out_path}",
            file=sys.stderr,
        )
        return

    print(f"[목록] 총 {len(collected)}개 글 수집. 본문 가져오는 중...", file=sys.stderr)

    rows = []
    for i, it in enumerate(collected, 1):
        vurl = VIEW_URL.format(wr_id=it["wr_id"])
        try:
            vhtml = fetch(vurl)
            v = parse_view(vhtml)
        except Exception as e:  # noqa: BLE001
            print(f"  ! wr_id={it['wr_id']} 본문 실패: {e}", file=sys.stderr)
            v = {
                "title": it["title"],
                "published_at": "",
                "views": 0,
                "body_html": "",
                "thumbnail": "",
                "excerpt": "",
            }
        row = {
            "wr_id": it["wr_id"],
            "category": it["category"],
            "title": v["title"] or it["title"],
            "author": it["author"],
            "published_at": v["published_at"],
            "list_date_full": normalize_list_date(it["list_date"]),
            "views": v["views"],
            "thumbnail": v["thumbnail"],
            "excerpt": v["excerpt"],
            "body_html": v["body_html"],
        }
        rows.append(row)
        if i % 20 == 0:
            print(f"  ... {i}/{len(collected)}", file=sys.stderr)
        time.sleep(DELAY)

    out_path = os.path.abspath(args.out)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(to_sql(rows))
    print(f"[완료] {len(rows)}개 → {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
