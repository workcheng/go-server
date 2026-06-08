@echo off
setlocal

windres app.rc -O coff -o app.syso
if errorlevel 1 exit /b %errorlevel%

go build -o go-server.exe .
exit /b %errorlevel%
