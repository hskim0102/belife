#!/usr/bin/env bash
# belife.org 사무국 게시판(bo_table=cezz) 이전 일괄 실행.
#
# 사무국은 레거시에서 로그인한 회원만 볼 수 있는 게시판이라 크롤링에 계정이 필요하다.
# 자격 증명은 이 파일에 적지 말고 환경변수로만 넘긴다(셸 히스토리에 남기지 않으려면
# 명령 앞에 공백 한 칸을 두거나 read 로 입력받는다).
#
#   BELIFE_ID='아이디' BELIFE_PW='비밀번호' bash scripts/import-office-board.sh
#
# 수행 순서:
#   1) 크롤링       → migrations/seed_office_posts.sql
#   2) 이미지 이전  → Vercel Blob + seed_office_posts.blob.sql
#   3) 첨부파일 이전 → Vercel Blob + blob.sql 갱신
#   4) DB 적재      → posts (category='office')
set -euo pipefail

: "${BELIFE_ID:?BELIFE_ID 환경변수를 설정해 주세요}"
: "${BELIFE_PW:?BELIFE_PW 환경변수를 설정해 주세요}"

cd "$(dirname "$0")/.."

echo "▶ 1/4 사무국 게시판 크롤링 (로그인)"
python3 scripts/crawl_belife_boards.py --bo-table cezz --category office --attachments --login

echo "▶ 2/4 본문 이미지 → Vercel Blob"
node scripts/migrate-board-images.mjs office

echo "▶ 3/4 첨부파일 → Vercel Blob"
node scripts/migrate-board-files.mjs office

echo "▶ 4/4 DB 적재"
node scripts/load-board-posts.mjs office

echo "✔ 완료 — http://localhost:3000/board/office (열람 비밀번호 필요)"
