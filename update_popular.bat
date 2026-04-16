@echo off
cd /d "G:\マイドライブ\Claudcode\3.Delicious Alcohol Search System"
echo [%date% %time%] popular.js 更新開始 >> update_log.txt
node gen_popular.js >> update_log.txt 2>&1
echo [%date% %time%] 完了 >> update_log.txt
