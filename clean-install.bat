@echo off
echo Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist package-lock.json del /f package-lock.json

echo Installing dependencies...
npm install --legacy-peer-deps --ignore-optional

echo Done! You can now deploy with: vercel 