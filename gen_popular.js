// 売上データから商品人気度マップを生成するスクリプト
// 使い方: node gen_popular.js

const XLSX = require('C:/Users/yoshi/AppData/Local/Temp/xlreader/node_modules/xlsx');
const fs   = require('fs');
const path = require('path');

// ── 文字列正規化（半角カナ→全角、スペース除去、小文字化）──
function normalize(str) {
  return String(str)
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// ── 1. 売上Excelを読み込み、商品名→合計数量 を集計 ──
const SALES_FILE = 'G:/マイドライブ/Claudcode/250301-260328_得意先別商品売上.xlsx';
const salesWb   = XLSX.readFile(SALES_FILE);
const salesWs   = salesWb.Sheets[salesWb.SheetNames[0]];
const salesRows = XLSX.utils.sheet_to_json(salesWs, { header: 1, defval: '' }).slice(1);

const salesMap = {};   // normalized name → total qty
salesRows.forEach(r => {
  const name = normalize(r[3] || '');
  const qty  = Number(r[6]) || 0;
  if (!name || qty <= 0) return;
  salesMap[name] = (salesMap[name] || 0) + qty;
});
console.log(`売上データ: ${salesRows.length}行 → ユニーク商品数 ${Object.keys(salesMap).length}件`);

// ── 2. products.js から商品配列を取得 ──
const productsCode = fs.readFileSync(path.join(__dirname, 'products.js'), 'utf8');
// "const PRODUCTS = [...];\n" → JSON部分だけ抽出
const jsonStr = productsCode.replace(/^\/\/[^\n]*\n/, '').replace(/^const PRODUCTS = /, '').replace(/;\s*$/, '');
const products = JSON.parse(jsonStr);
console.log(`商品マスタ: ${products.length}件`);

// ── 3. 商品名でマッチングして人気度を付与 ──
const popularity = {};
let matched = 0;
let unmatched = [];

products.forEach(p => {
  // products.js は32文字で切っているので「…」を除去したベース名
  const pName = normalize(p.name.replace('…', ''));

  // ① 完全一致
  if (salesMap[pName] !== undefined) {
    popularity[p.id] = salesMap[pName];
    matched++;
    return;
  }

  // ② 前方一致（どちらかが相手の先頭に含まれる）
  for (const [sName, qty] of Object.entries(salesMap)) {
    if (sName.startsWith(pName) || pName.startsWith(sName.substring(0, 28))) {
      popularity[p.id] = qty;
      matched++;
      return;
    }
  }

  // マッチなし → 0
  popularity[p.id] = 0;
  unmatched.push(p.name);
});

console.log(`\nマッチ成功: ${matched}件 / ${products.length}件`);
console.log(`マッチ率: ${Math.round(matched / products.length * 100)}%`);

// 人気上位20件を表示（確認用）
const top20 = products
  .filter(p => popularity[p.id] > 0)
  .sort((a, b) => (popularity[b.id] || 0) - (popularity[a.id] || 0))
  .slice(0, 20);
console.log('\n--- 人気上位20商品 ---');
top20.forEach((p, i) => {
  console.log(`${i+1}. [${p.type}] ${p.name} → ${popularity[p.id]}個`);
});

// ── 4. popular.js を出力 ──
const output = `// 商品別販売数量マップ（売上データより自動生成）
// 生成日時: ${new Date().toLocaleString('ja-JP')}
// 対象期間: 250301-260328
const PRODUCT_POPULARITY = ${JSON.stringify(popularity)};
`;
const outPath = path.join(__dirname, 'popular.js');
fs.writeFileSync(outPath, output, 'utf8');
const sizeKB = Math.round(Buffer.byteLength(output, 'utf8') / 1024);
console.log(`\npopular.js 出力完了 (${sizeKB} KB)`);
