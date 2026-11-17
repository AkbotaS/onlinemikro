@echo off
setlocal
chcp 65001 >nul
set "PROJECT_DIR=%~1"
if not defined PROJECT_DIR set "PROJECT_DIR=C:\Users\user0\Documents\Codex\2026-11-15\https-github-com-akbotas-onlinemikro-https\work\onlinemikro"
where node >nul 2>nul
if errorlevel 1 (
  echo Установите Node.js 20.19+ или 22.12+ и повторите запуск.
  pause
  exit /b 1
)
node "%~dp0sync-and-build.mjs" "%PROJECT_DIR%"
if errorlevel 1 (
  echo Обновление или сборка остановлены. Прочитайте причину выше.
  pause
  exit /b 1
)
echo Готово. Папка обновлена из main, production-сборка находится в dist.
pause
