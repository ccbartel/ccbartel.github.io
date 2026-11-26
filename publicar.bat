@echo off
rem Publica o site bartelgames.com.br: build + git push (clique duas vezes)
cd /d "%~dp0"
echo === 1/3 Build ===
"C:\Users\crisb\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\python_embeded\python.exe" build.py
if errorlevel 1 (echo ERRO no build. Nada foi publicado. & pause & exit /b 1)
echo === 2/3 Commit ===
git add -A
set MSG=%*
if "%MSG%"=="" set MSG=Atualiza site
git commit -m "%MSG%"
echo === 3/3 Publicando (git push) ===
git push
if errorlevel 1 (echo ERRO no push. Veja a mensagem acima. & pause & exit /b 1)
echo.
echo PRONTO: site publicado. Leva 1-2 minutos para aparecer em bartelgames.com.br
pause
