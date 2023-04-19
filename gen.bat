@echo off
set arg1=%1
set arg2=%2
shift
shift
npm run gen:%arg1% %arg2%