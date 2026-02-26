#!/bin/bash
# Удаление секретов из git-истории.
# ВНИМАНИЕ: перезаписывает историю — после пуша нужен force push.
# Перед запуском: закоммитьте текущие изменения (удаление секретов из кода).
#
# Требуется: pip install git-filter-repo
#
# После выполнения:
# 1. Сгенерируйте новые ключи (старые скомпрометированы)
# 2. Обновите .env локально и на сервере
# 3. git push --force-with-lease (если работаете с удалённым репо)
# 4. Уведомите коллег — им нужно переклонировать репозиторий

set -e
cd "$(dirname "$0")/.."

if ! command -v git-filter-repo &>/dev/null; then
  echo "Установите git-filter-repo: pip install git-filter-repo"
  exit 1
fi

echo "Удаление секретов из истории..."
git filter-repo --replace-text scripts/purge-secrets-from-history.txt --force

echo ""
echo "Готово. git-filter-repo удалил remote (для безопасности). Дальше:"
echo "  1. git remote add origin <URL>   # если remote нужен"
echo "  2. Сгенерируйте новые ключи: openssl rand -base64 32"
echo "  3. Обновите .env (локально и на сервере)"
echo "  4. git push --force-with-lease origin main"
