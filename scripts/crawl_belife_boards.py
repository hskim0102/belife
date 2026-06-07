#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
belife.org 게시판(그누보드) 범용 크롤러 → PostgreSQL INSERT SQL 생성기

활동소식 전용 crawl_belife_activity.py 를 일반화한 버전.
대상 게시판(bo_table)과 저장 category 를 인자로 받아 posts 테이블용 SQL 을 만든다.

belife.org 게시판 매핑(2026-06 확인):
    cazz=공지사항(notice)   cbzz=사진게시판(photo)   cdaz=웹진(webzine)
    cdbz=동영상(video)      cdcz=소개자료(intro)     cddz=보도자료(press)
    cdez=표창(award)        cdfz=달력(calendar)      dzzz=활동소식(activity, 별도 스크립트)

핵심 차이:
  - 목록 스킨이 게시판마다 다르다(일반/자료실/갤러리). 그래서 목록에서는
    "bo_table=<code>...wr_id=N" 본문 링크의 wr_id 만 등장 순서대로 수집한다.
  - 본문(view) 페이지는 모든 게시판이 동일하게 id="writeContents" / "작성일" 패턴을
    쓰므로 활동소식 크롤러의 본문 파서를 그대로 재사용한다.

표준 라이브러리만 사용(urllib, html, re). 외부 패키지 불필요.

사용법:
    python3 scripts/crawl_belife_boards.py --bo-table cazz --category notice
    python3 scripts/crawl_belife_boards.py --bo-table cbzz --category photo --pages 3
    python3 scripts/crawl_belife_boards.py --bo-table cdez --category award --out x.sql
"""
import argparse
import html
import os
import re
import sys
import time
import urllib.request

BASE = "http://www.belife.org/belife/"
LIST_URL = BASE + "bbs/board.php?bo_table={bo}&page={page}"
VIEW_URL = BASE + "bbs/board.php?bo_table={bo}&wr_id={wr_id}"
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
# 스킨에 무관하게: 본문 링크(bo_table=<code> 와 wr_id 가 같은 a 태그)에서 wr_id 만
# 등장 순서대로 수집한다. &amp; 인코딩과 인자 순서(둘 다) 모두 대응.
def list_wr_ids(htmlstr, bo):
    """목록 HTML → 본문글 wr_id 리스트(페이지 내 등장 순서, 중복 제거)."""
    pats = [
        re.compile(r"bo_table=" + re.escape(bo) + r"(?:&amp;|&)wr_id=(\d+)"),
        re.compile(r"wr_id=(\d+)(?:&amp;|&)bo_table=" + re.escape(bo)),
    ]
    seen = set()
    out = []
    for m in re.finditer(r"href=[\"']([^\"']*board\.php[^\"']*)[\"']", htmlstr, re.I):
        href = m.group(1)
        if ("bo_table=" + bo) not in href:
            continue
        wid = None
        for p in pats:
            mm = p.search(href)
            if mm:
                wid = int(mm.group(1))
                break
        if wid is None:
            continue
        if wid in seen:
            continue
        seen.add(wid)
        out.append(wid)
    return out


# ── 본문 파싱 (활동소식 크롤러와 동일) ────────────────────────────────────────
VIEW_TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S | re.I)
VIEW_DATE_RE = re.compile(r"작성일</span>\s*:\s*<span[^>]*>(\d{4}-\d{2}-\d{2})")
VIEW_VIEWS_RE = re.compile(r"조회</span>\s*:\s*(\d+)")
CONTENT_RE = re.compile(
    r'id="writeContents">(.*?)</span>\s*<!-- 테러 태그 방지용', re.S
)
# 본문 마커가 안 잡히는 스킨 대비 폴백: writeContents 이후 끝까지(보수적으로 컷)
CONTENT_FALLBACK_RE = re.compile(r'id="writeContents">(.*?)(?:</td>|<!--)', re.S)
IMG_SRC_RE = re.compile(r"<img[^>]+src=[\"'](http[^\"']+)[\"']", re.I)
TAG_RE = re.compile(r"<[^>]+>")


def collect_attachments(htmlstr, bo):
    """그누보드 첨부 이미지(data/file/<bo>/ 비-thumb)를 절대 URL 리스트로 수집.

    사진게시판/보도자료처럼 본문(writeContents) 밖 첨부 영역에 사진이 있는
    갤러리형 게시판을 위해 필요. 목록 썸네일(thumb/)은 제외한다.
    """
    pat = re.compile(
        r"(?:\.\./)?data/file/" + re.escape(bo) + r"/(?!thumb/)([^\"'<> )]+\.(?:jpe?g|png|gif))",
        re.I,
    )
    seen = set()
    out = []
    for m in pat.finditer(htmlstr):
        fn = m.group(1)
        url = f"{BASE}data/file/{bo}/{fn}"
        if url in seen:
            continue
        seen.add(url)
        out.append(url)
    return out


def parse_view(htmlstr, bo):
    """보기 HTML → {title, published_at, views, body_html, thumbnail, excerpt}."""
    title = ""
    mt = VIEW_TITLE_RE.search(htmlstr)
    if mt:
        # "게시판 > 공지사항 > 실제제목" → 마지막 조각
        title = html.unescape(mt.group(1).split(">")[-1].strip())

    md = VIEW_DATE_RE.search(htmlstr)
    published_at = md.group(1) if md else ""

    mv = VIEW_VIEWS_RE.search(htmlstr)
    views = int(mv.group(1)) if mv else 0

    body_html = ""
    mc = CONTENT_RE.search(htmlstr)
    if mc:
        body_html = mc.group(1).strip()
    else:
        mc2 = CONTENT_FALLBACK_RE.search(htmlstr)
        if mc2:
            body_html = mc2.group(1).strip()

    # 첨부 이미지(갤러리형 게시판): 본문에 인라인 이미지가 없으면 본문 상단에 삽입.
    attachments = collect_attachments(htmlstr, bo)
    has_inline_img = bool(IMG_SRC_RE.search(body_html))
    if attachments and not has_inline_img:
        imgs_html = "".join(
            f'<div style="text-align:center"><img src="{u}" alt="" /></div>\n'
            for u in attachments
        )
        body_html = imgs_html + body_html

    mi = IMG_SRC_RE.search(body_html)
    thumbnail = mi.group(1) if mi else (attachments[0] if attachments else "")

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


def to_sql(rows, bo, category):
    lines = [
        f"-- belife.org {category}(bo_table={bo}) 크롤링 결과",
        "-- 대상 테이블: posts (migrations/001_init.sql + 005_board_categories.sql)",
        f"-- slug = {category}-<wr_id> 로 고유성 보장, 재실행 안전(ON CONFLICT).",
        "",
        "BEGIN;",
        "",
    ]
    for r in rows:
        slug = f"{category}-{r['wr_id']}"
        published_at = r["published_at"] or "2000-01-01"
        lines.append(
            "INSERT INTO posts (slug, title, category, published_at, thumbnail, excerpt, body)\n"
            "VALUES (\n"
            f"  {sql_str(slug)},\n"
            f"  {sql_str(r['title'])},\n"
            f"  {sql_str(category)},\n"
            f"  {sql_str(published_at)},\n"
            f"  {sql_str(r['thumbnail'])},\n"
            f"  {sql_str(r['excerpt'])},\n"
            f"  {sql_str(r['body_html'])}\n"
            ")\nON CONFLICT (slug) DO NOTHING;"
        )
        lines.append("")
    lines.append("COMMIT;")
    lines.append(f"-- 적재 대상: {len(rows)}건")
    return "\n".join(lines)


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="belife.org 게시판 범용 크롤러 → SQL")
    ap.add_argument("--bo-table", required=True, help="그누보드 bo_table (예: cazz)")
    ap.add_argument(
        "--category",
        required=True,
        help="posts.category 값이자 slug 접두사 (예: notice/photo/webzine/...)",
    )
    ap.add_argument("--pages", type=int, default=0, help="크롤링할 페이지 수(0=전체)")
    ap.add_argument("--limit", type=int, default=0, help="최대 글 수(0=무제한)")
    ap.add_argument(
        "--out",
        default="",
        help="출력 SQL 경로(기본: migrations/seed_<category>_posts.sql)",
    )
    args = ap.parse_args()

    bo = args.bo_table
    category = args.category
    out_path = args.out or os.path.join(
        os.path.dirname(__file__),
        "..",
        "migrations",
        f"seed_{category}_posts.sql",
    )
    out_path = os.path.abspath(out_path)

    collected = []
    seen = set()
    page = 1
    while True:
        if args.pages and page > args.pages:
            break
        url = LIST_URL.format(bo=bo, page=page)
        print(f"[목록][{bo}] page {page} 가져오는 중...", file=sys.stderr)
        listhtml = fetch(url)
        ids = list_wr_ids(listhtml, bo)
        if not ids:
            print(f"[목록][{bo}] page {page}: 글 없음 → 종료", file=sys.stderr)
            break
        new_ids = [w for w in ids if w not in seen]
        if not new_ids:
            print(f"[목록][{bo}] page {page}: 새 글 없음 → 종료", file=sys.stderr)
            break
        for w in new_ids:
            seen.add(w)
            collected.append(w)
        page += 1
        if args.limit and len(collected) >= args.limit:
            collected = collected[: args.limit]
            break
        time.sleep(DELAY)

    print(f"[목록][{bo}] 총 {len(collected)}개 글 수집. 본문 가져오는 중...", file=sys.stderr)

    rows = []
    for i, wr_id in enumerate(collected, 1):
        vurl = VIEW_URL.format(bo=bo, wr_id=wr_id)
        try:
            vhtml = fetch(vurl)
            v = parse_view(vhtml, bo)
        except Exception as e:  # noqa: BLE001
            print(f"  ! wr_id={wr_id} 본문 실패: {e}", file=sys.stderr)
            v = {
                "title": "",
                "published_at": "",
                "views": 0,
                "body_html": "",
                "thumbnail": "",
                "excerpt": "",
            }
        rows.append(
            {
                "wr_id": wr_id,
                "title": v["title"] or f"({category} {wr_id})",
                "published_at": v["published_at"],
                "views": v["views"],
                "thumbnail": v["thumbnail"],
                "excerpt": v["excerpt"],
                "body_html": v["body_html"],
            }
        )
        if i % 25 == 0:
            print(f"  ... {i}/{len(collected)}", file=sys.stderr)
        time.sleep(DELAY)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(to_sql(rows, bo, category))
    print(f"[완료][{bo}] {len(rows)}개 → {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
