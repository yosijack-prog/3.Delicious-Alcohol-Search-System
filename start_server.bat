@echo off
cd /d "G:\マイドライブ\Claudcode\ashizuka\3.Delicious Alcohol Search System"
echo [%date% %time%] サーバー起動 >> server_log.txt
http-server -p 5175 -c-1 --cors >> server_log.txt 2>&1
