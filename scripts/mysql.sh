#!/usr/bin/env bash
# ER RAMMACH — local MariaDB helper (.db/data, TCP 127.0.0.1:3308)
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN=/Applications/XAMPP/xamppfiles/sbin/mysqld
CLI=/Applications/XAMPP/xamppfiles/bin/mariadb
DATA="$ROOT/.db/data"
SOCK="$ROOT/.db/mysql.sock"
PID_FILE="$ROOT/.db/mysql.pid"
LOG="$ROOT/.db/mysql.log"

case "${1:-status}" in
  start)
    if [ -S "$SOCK" ] && "$CLI" --no-defaults -u root -h 127.0.0.1 -P 3308 -e "SELECT 1" >/dev/null 2>&1; then
      echo "MariaDB déjà démarré (port 3308)."
    else
      [ -d "$DATA" ] || { echo "Aucune donnée dans $DATA — exécutez d'abord: npm run db:seed && node server/database/migrate.js"; exit 1; }
      nohup "$BIN" --no-defaults --basedir=/Applications/XAMPP/xamppfiles \
        --datadir="$DATA" --port=3308 --bind-address=127.0.0.1 --socket="$SOCK" \
        --pid-file="$PID_FILE" --log-error="$LOG" >/dev/null 2>&1 &
      for _ in 1 2 3 4 5 6 7 8 9 10; do
        "$CLI" --no-defaults -u root -h 127.0.0.1 -P 3308 -e "SELECT 1" >/dev/null 2>&1 && break
        sleep 1
      done
      echo "MariaDB démarré (port 3308)."
    fi
    ;;
  stop)
    if [ -f "$PID_FILE" ]; then kill "$(cat "$PID_FILE")" 2>/dev/null && echo "MariaDB arrêté."; fi
    ;;
  status)
    if "$CLI" --no-defaults -u root -h 127.0.0.1 -P 3308 -e "SELECT 1" >/dev/null 2>&1; then
      echo "MariaDB : démarré (port 3308)."
    else
      echo "MariaDB : arrêté."
    fi
    ;;
  *) echo "Usage: $0 {start|stop|status}"; exit 2;;
esac