@echo off
echo [%date% %time%] 在庫データ更新開始 >> update_log.txt
node C:\AlcoholServer\gen_instock.js >> update_log.txt 2>&1
echo [%date% %time%] 在庫データ更新完了 >> update_log.txt
