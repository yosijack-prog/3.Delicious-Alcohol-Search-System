@echo off
cd /d "G:\マイドライブ\Claudcode\3.Delicious Alcohol Search System"
echo [%date% %time%] サーバー起動 >> server_log.txt
http-server -p 3000 -c-1 --cors >> server_log.txt 2>&1
