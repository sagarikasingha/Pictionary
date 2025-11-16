@echo off
echo Starting Pictionary Test Suite...
echo.

REM Start server in background
start /B node src/server.js

REM Wait for server to start
timeout /t 3 /nobreak > nul

echo Server started on port 3000
echo Running tests...
echo.

REM Run tests
call npx cucumber-js tests/features --require tests/steps --require tests/support --format progress --format html:tests/reports/cucumber-report.html

REM Kill server
taskkill /F /IM node.exe > nul 2>&1

echo.
echo Tests completed!
echo View report: tests\reports\cucumber-report.html
