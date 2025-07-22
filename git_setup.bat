@echo off
echo Inicializando repositorio Git para AntEmpire...

REM Inicializar repositorio
git init

REM Añadir archivos al staging
git add .

REM Crear primer commit
git commit -m "Versión inicial de AntEmpire v0.2.0 con mejoras de UI/UX"

echo.
echo Para subir a GitHub, ejecuta los siguientes comandos:
echo git remote add origin https://github.com/TU_USUARIO/AntEmpire.git
echo git push -u origin master
echo.
echo Nota: Reemplaza "TU_USUARIO" con tu nombre de usuario de GitHub
echo y asegúrate de haber creado el repositorio en GitHub primero.
echo.
pause