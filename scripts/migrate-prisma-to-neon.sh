#!/usr/bin/env bash
# Prisma Postgres → Neon 전체 이전 (스키마 + 데이터)
#
# 배경: Prisma Postgres 무료 한도 초과로 쿼리가 막혀, 24시간 임시 복구 동안 Neon 으로 옮긴다.
# pg_dump/pg_restore 는 Docker 의 postgres:18 이미지로 실행한다(로컬 설치 불필요).
#
# 접속 정보는 .env.local 에서 읽는다.
#   DATABASE_URL       : 원본(Prisma)
#   NEON_DATABASE_URL  : 대상(Neon). pooler 주소면 복원용으로 직접 접속 주소로 바꿔 쓴다.
#
# 결과물 (backup/db/, git 제외):
#   prisma-<시각>.dump   : 전체 덤프(custom 포맷, 롤백용 보관)
#   schema-<시각>.sql    : 스키마만(사람이 읽는 SQL)
#
# 사용법:
#   bash scripts/migrate-prisma-to-neon.sh dump      # 덤프만
#   bash scripts/migrate-prisma-to-neon.sh restore   # 가장 최근 덤프를 Neon 에 복원
set -euo pipefail
export MSYS_NO_PATHCONV=1

ROOT="$(cd "$(dirname "$0")/.." && (pwd -W 2>/dev/null || pwd))"
OUT="$ROOT/backup/db"
mkdir -p "$OUT"

getenv() { node -e "
const fs=require('fs');for(const l of fs.readFileSync('$ROOT/.env.local','utf-8').split('\n')){
const m=l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*\"?([^\"\n]*)\"?\s*$/);if(m&&m[1]==='$1'){process.stdout.write(m[2]);break}}"; }

SRC="$(getenv DATABASE_URL)"
DST="$(getenv NEON_DATABASE_URL | sed 's/-pooler\./\./')"
[ -n "$SRC" ] && [ -n "$DST" ] || { echo "DATABASE_URL / NEON_DATABASE_URL 이 필요합니다."; exit 1; }

# Windows 경로를 Docker 볼륨 표기로 (D:/Project/... 형태)
VOL="$(cd "$OUT" && pwd -W 2>/dev/null || pwd)"
PG() { docker run --rm -e SRC="$SRC" -e DST="$DST" -v "$VOL:/out" postgres:18 sh -c "$1"; }

case "${1:-}" in
  dump)
    TS="$(date +%Y%m%d-%H%M%S)"
    echo "덤프 중… (public 스키마)"
    PG "pg_dump \"\$SRC\" -n public --no-owner --no-privileges -Fc -f /out/prisma-$TS.dump"
    PG "pg_dump \"\$SRC\" -n public --no-owner --no-privileges --schema-only -f /out/schema-$TS.sql"
    ls -la "$OUT" | grep "$TS"
    ;;
  restore)
    LATEST="$(ls -t "$OUT"/prisma-*.dump | head -1)"
    echo "복원: $(basename "$LATEST") → Neon"
    # -n public 덤프에는 CREATE SCHEMA public 이 들어 있는데 Neon 에는 이미 있으므로 목록에서 뺀다.
    PG "pg_restore -l /out/$(basename "$LATEST") | grep -v ' SCHEMA - public ' > /tmp/toc && pg_restore --no-owner --no-privileges --exit-on-error --single-transaction -L /tmp/toc -d \"\$DST\" /out/$(basename "$LATEST")"
    echo "복원 완료"
    ;;
  *)
    echo "사용법: $0 dump | restore"; exit 2 ;;
esac
