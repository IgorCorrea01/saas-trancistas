@echo off
title Trancas - Sistema de Orçamentos e Agendamentos
echo ========================================================
echo   Iniciando Backend (.NET 9) e Frontend (Next.js 15)
echo ========================================================
echo.

set PATH=C:\Program Files\nodejs;%PATH%

echo [1/2] Iniciando Backend API em http://localhost:5242 ...
start "Trancas Backend API (.NET 9)" cmd /k "cd /d "%~dp0src\Api" && dotnet run"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend em http://localhost:3000 ...
start "Trancas Frontend (Next.js 15)" cmd /k "set PATH=C:\Program Files\nodejs;%%PATH%% && cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo Abrindo o navegador em http://localhost:3000 ...
start http://localhost:3000

echo.
echo Pronto! Ambos os serviços estão em execução.
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5242
echo - Swagger / Scalar Docs: http://localhost:5242/scalar/v1
echo.
pause
