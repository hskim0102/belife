#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
belife.org 게시판의 '분류(sca)'를 수집해 posts.tags 를 채우는 UPDATE SQL 생성기.

crawl_belife_boards.py 는 글 본문만 가져오고 분류는 담지 않는다.
자료실(cczz)처럼 분류가 있는 게시판은 목록을 sca 별로 다시 훑어
wr_id ↔ 분류 매핑을 만든 뒤 posts.tags 에 넣는다.

  slug = <category>-<wr_id> 규칙은 crawl_belife_boards.py 와 동일하다.

사용법:
    python3 scripts/crawl_belife_board_tags.py --bo-table cczz --category archive
    # 로그인이 필요한 게시판(사무국 등)
    BELIFE_ID=... BELIFE_PW=... python3 scripts/crawl_belife_board_tags.py \
        --bo-table cezz --category office --login

출력: migrations/seed_<category>_tags.sql  (재실행 안전한 UPDATE 문)
"""
import argparse
import os
import re
import sys
import time
import urllib.parse

# 크롤러의 세션/요청 유틸을 그대로 재사용한다.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crawl_belife_boards import fetch, list_wr_ids, login, sql_str, DELAY  # noqa: E402

BASE = "http://www.belife.org/belife/"
LIST_URL = BASE + "bbs/board.php?bo_table={bo}&page={page}"
SCA_URL = BASE + "bbs/board.php?bo_table={bo}&sca={sca}&page={page}"


def discover_scas(bo):
    """목록 페이지의 분류 링크에서 sca 값을 등장 순서대로 수집."""
    htmlstr = fetch(LIST_URL.format(bo=bo, page=1))
    out = []
    for m in re.finditer(r"bo_table=" + re.escape(bo) + r"(?:&amp;|&)sca=([^\"'&]+)", htmlstr):
        sca = urllib.parse.unquote(m.group(1))
        if sca and sca not in out:
            out.append(sca)
    return out


def wr_ids_for_sca(bo, sca, max_pages=0):
    """한 분류에 속한 wr_id 전부."""
    ids = []
    seen = set()
    page = 1
    while True:
        if max_pages and page > max_pages:
            break
        url = SCA_URL.format(bo=bo, sca=urllib.parse.quote(sca), page=page)
        htmlstr = fetch(url)
        found = [w for w in list_wr_ids(htmlstr, bo) if w not in seen]
        if not found:
            break
        for w in found:
            seen.add(w)
            ids.append(w)
        page += 1
        time.sleep(DELAY)
    return ids


def main():
    ap = argparse.ArgumentParser(description="belife.org 게시판 분류(sca) → posts.tags UPDATE SQL")
    ap.add_argument("--bo-table", required=True)
    ap.add_argument("--category", required=True, help="posts.category (slug 접두사이기도 하다)")
    ap.add_argument("--pages", type=int, default=0, help="분류별 최대 페이지 수(0=전체)")
    ap.add_argument("--out", default="")
    ap.add_argument("--login", action="store_true", help="로그인 필요 게시판(BELIFE_ID/BELIFE_PW)")
    args = ap.parse_args()

    if args.login:
        mb_id, mb_pw = os.environ.get("BELIFE_ID", ""), os.environ.get("BELIFE_PW", "")
        if not mb_id or not mb_pw:
            print("환경변수 BELIFE_ID / BELIFE_PW 를 설정해 주세요.", file=sys.stderr)
            sys.exit(2)
        login(mb_id, mb_pw)
        print("[로그인] 세션 확보", file=sys.stderr)

    bo, category = args.bo_table, args.category
    scas = discover_scas(bo)
    if not scas:
        print(f"[{bo}] 분류(sca) 링크를 찾지 못했습니다.", file=sys.stderr)
        sys.exit(1)
    print(f"[{bo}] 분류 {len(scas)}개: {', '.join(scas)}", file=sys.stderr)

    # wr_id → 분류. 한 글이 여러 분류에 잡히는 일은 없지만, 먼저 잡힌 분류를 쓴다.
    mapping = {}
    for sca in scas:
        ids = wr_ids_for_sca(bo, sca, args.pages)
        new = 0
        for w in ids:
            if w not in mapping:
                mapping[w] = sca
                new += 1
        print(f"  - {sca}: {len(ids)}건 (신규 {new})", file=sys.stderr)

    out_path = args.out or os.path.join(
        os.path.dirname(__file__), "..", "migrations", f"seed_{category}_tags.sql"
    )
    out_path = os.path.abspath(out_path)

    lines = [
        f"-- belife.org {category}(bo_table={bo}) 분류(sca) → posts.tags",
        "-- crawl_belife_board_tags.py 생성. 재실행 안전(같은 값으로 덮어씀).",
        "",
        "BEGIN;",
        "",
    ]
    for wr_id, sca in sorted(mapping.items()):
        lines.append(
            f"UPDATE posts SET tags = ARRAY[{sql_str(sca)}] "
            f"WHERE slug = {sql_str(f'{category}-{wr_id}')} AND category = {sql_str(category)};"
        )
    lines += ["", "COMMIT;", f"-- 대상: {len(mapping)}건"]

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"[완료] {len(mapping)}건 → {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
