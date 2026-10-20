@echo off
title RuralBiz AI Server
echo ========================================================
echo        Starting RuralBiz AI (SIH PS 26091)
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Checking Python packages...
pip install -q fastapi uvicorn httpx pydantic

echo [2/2] Launching RuralBiz AI at http://127.0.0.1:8000/ ...
start http://127.0.0.1:8000/
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
