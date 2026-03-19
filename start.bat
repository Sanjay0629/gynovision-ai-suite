@echo off
echo Starting GynoVision AI Suite with Docker...
docker compose up -d --build

echo.
echo Waiting a few seconds for the services to initialise...
timeout /t 5 /nobreak >nul

echo Opening frontend in your default browser...
start http://localhost
echo Done!
