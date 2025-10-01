@echo off
echo Testando funcao flight-validation com voo LATAM LA3359
echo.

REM Substitua YOUR_ANON_KEY pela sua chave anônima do Supabase
set ANON_KEY=YOUR_ANON_KEY

if "%ANON_KEY%"=="YOUR_ANON_KEY" (
    echo ERRO: Configure sua chave anonima do Supabase
    echo 1. Va para o dashboard do Supabase
    echo 2. Settings ^> API
    echo 3. Copie a "anon public" key
    echo 4. Substitua YOUR_ANON_KEY neste arquivo
    pause
    exit /b 1
)

echo Fazendo requisicao para validar voo LA3359...
echo.

curl -X POST "https://chvfqtutihudfnxpvfzt.supabase.co/functions/v1/flight-validation" ^
  -H "Authorization: Bearer %ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"flight_number\": \"LA3359\", \"date\": \"2024-12-20\", \"time\": \"14:00\", \"booking_type\": \"dropoff\"}"

echo.
echo.
echo Teste concluido!
pause
