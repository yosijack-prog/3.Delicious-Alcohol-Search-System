// お酒検索システム 自動バックアップスクリプト
const fs   = require('fs');
const path = require('path');

const projectDir = path.dirname(require.main.filename);
const backupRoot  = path.join(projectDir, 'backups');
const now = new Date();
const ts  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
const backupDir = path.join(backupRoot, ts);

const targets = ['index.html', 'products.js', 'gen_products.js'];

// バックアップフォルダ作成
fs.mkdirSync(backupDir, { recursive: true });

// ファイルコピー
let copied = 0;
for (const f of targets) {
  const src = path.join(projectDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(backupDir, f));
    copied++;
  }
}

// 古いバックアップを削除（直近30世代を保持）
const allBackups = fs.readdirSync(backupRoot)
  .filter(d => fs.statSync(path.join(backupRoot, d)).isDirectory())
  .sort()
  .reverse();

if (allBackups.length > 30) {
  for (const old of allBackups.slice(30)) {
    fs.rmSync(path.join(backupRoot, old), { recursive: true, force: true });
  }
}

const kept = Math.min(allBackups.length, 30);
console.log(`[${ts}] バックアップ完了: ${copied} ファイル`);
console.log(`保存先: ${backupDir}`);
console.log(`保存済み世代: ${kept} / 30`);
