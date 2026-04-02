const XLSX = require('C:/Users/yoshi/AppData/Local/Temp/xlreader/node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('G:/マイドライブ/Claudcode/商品一覧表税額込-2_完成版.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
const rows = data.slice(1);

const excludeCats = new Set([
  '飲料水','雑貨','たばこ','珍味','一般食品','空容器','什器･備品',
  '柑橘類','核果類など','ジュース','南国系ﾌﾙｰﾂ','菓子','お茶',
  '化粧品','容器販売・保証金','ウィズ事業','ビール券','値引き8％','値引き10％',
  'ナッツ･種子核類','ベリー類','ギフト商品','その他','みりん'
]);

const catIcons = {
  '純米大吟醸':'🍶','大吟醸':'🍶','純米吟醸':'🍶','吟醸':'🍶','特別純米':'🍶',
  '純米':'🍶','本醸造':'🍶','特別本醸造':'🍶','清酒':'🍶','普通酒':'🍶',
  '合成清酒':'🍶','焼酎乙類いも':'🫙','焼酎乙類むぎ':'🫙','焼酎乙類こめ':'🫙',
  '焼酎乙類泡盛':'🫙','焼酎乙類黒糖':'🫙','焼酎乙類その他':'🫙','焼酎乙類そば':'🫙',
  '焼酎甲類':'🫙','国産ｳｲｽｷｰ':'🥃','ｽｺｯﾁ･ｳｲｽｷｰ':'🥃','ｱﾒﾘｶﾝ･ｳｲｽｷｰ':'🥃',
  'ｱｲﾘｯｼｭ･ｳｲｽｷｰ':'🥃','ｶﾅﾃﾞｨｱﾝ･ｳｲｽｷｰ':'🥃','その他のｳｲｽｷｰ':'🥃',
  'フランスワイン':'🍷','イタリアワイン':'🍷','スペインワイン':'🍷','国産ワイン':'🍷',
  'チリワイン':'🍷','ドイツワイン':'🍷','アメリカワイン':'🍷','ｵｰｽﾄﾗﾘｱ':'🍷',
  'ポルトガル':'🍷','舶来ワイン':'🍷','アルゼンチン':'🍷','南アフリカ':'🍷',
  'ルーマニア':'🍷','ジン':'🍸','テキーラ':'🍸','ラム':'🍸',
  'その他のｽﾋﾟﾘｯﾂ':'🍸','国産ﾌﾞﾗﾝﾃﾞｰ':'🥃','その他のﾌﾞﾗﾝﾃﾞｰ':'🥃',
  'コニャック':'🥃','ﾌﾙｰﾂ･ﾌﾞﾗﾝﾃﾞｰ':'🥃','その他のﾘｷｭｰﾙ':'🍹',
  '甘味果実酒':'🍑','果実酒':'🍑','薬草･ﾊｰﾌﾞ花':'🌿',
  'アサヒ':'🍺','キリン':'🍺','サントリー':'🍺','サッポロ':'🍺',
  'その他ビール':'🍺','ノンアルコールビール':'🍺','発泡酒':'🍺',
  'その他　8％':'🫧','その他の醸造酒':'🍶','紹興酒 黄酒':'🍶',
};

const catProfiles = {
  '純米大吟醸':{sweet:3,bitter:1,acid:2,body:2,strong:2,fruity:4},
  '大吟醸':{sweet:3,bitter:1,acid:2,body:2,strong:2,fruity:4},
  '純米吟醸':{sweet:3,bitter:1,acid:2,body:2,strong:2,fruity:3},
  '吟醸':{sweet:3,bitter:1,acid:2,body:2,strong:2,fruity:3},
  '特別純米':{sweet:2,bitter:2,acid:2,body:3,strong:2,fruity:2},
  '純米':{sweet:2,bitter:2,acid:2,body:3,strong:2,fruity:2},
  '本醸造':{sweet:2,bitter:2,acid:2,body:2,strong:2,fruity:2},
  '特別本醸造':{sweet:2,bitter:2,acid:2,body:2,strong:2,fruity:2},
  '清酒':{sweet:2,bitter:2,acid:2,body:2,strong:2,fruity:2},
  '普通酒':{sweet:2,bitter:2,acid:2,body:2,strong:2,fruity:1},
  '合成清酒':{sweet:2,bitter:2,acid:1,body:2,strong:2,fruity:1},
  '焼酎乙類いも':{sweet:2,bitter:2,acid:1,body:4,strong:4,fruity:2},
  '焼酎乙類むぎ':{sweet:2,bitter:1,acid:1,body:2,strong:3,fruity:1},
  '焼酎乙類こめ':{sweet:2,bitter:1,acid:1,body:2,strong:3,fruity:1},
  '焼酎乙類泡盛':{sweet:2,bitter:2,acid:1,body:3,strong:4,fruity:1},
  '焼酎乙類黒糖':{sweet:3,bitter:1,acid:1,body:3,strong:4,fruity:2},
  '焼酎乙類その他':{sweet:2,bitter:2,acid:1,body:3,strong:4,fruity:2},
  '焼酎乙類そば':{sweet:2,bitter:1,acid:1,body:2,strong:3,fruity:1},
  '焼酎甲類':{sweet:1,bitter:1,acid:1,body:1,strong:3,fruity:1},
  '国産ｳｲｽｷｰ':{sweet:3,bitter:2,acid:1,body:3,strong:4,fruity:3},
  'ｽｺｯﾁ･ｳｲｽｷｰ':{sweet:2,bitter:3,acid:1,body:4,strong:4,fruity:2},
  'ｱﾒﾘｶﾝ･ｳｲｽｷｰ':{sweet:3,bitter:2,acid:1,body:3,strong:4,fruity:2},
  'ｱｲﾘｯｼｭ･ｳｲｽｷｰ':{sweet:3,bitter:2,acid:1,body:3,strong:3,fruity:3},
  'ｶﾅﾃﾞｨｱﾝ･ｳｲｽｷｰ':{sweet:3,bitter:2,acid:1,body:3,strong:3,fruity:2},
  'その他のｳｲｽｷｰ':{sweet:2,bitter:2,acid:1,body:3,strong:4,fruity:2},
  'フランスワイン':{sweet:2,bitter:3,acid:3,body:3,strong:2,fruity:3},
  'イタリアワイン':{sweet:2,bitter:3,acid:3,body:3,strong:2,fruity:3},
  'スペインワイン':{sweet:2,bitter:3,acid:2,body:4,strong:2,fruity:3},
  '国産ワイン':{sweet:3,bitter:2,acid:3,body:2,strong:2,fruity:3},
  'チリワイン':{sweet:2,bitter:3,acid:3,body:3,strong:2,fruity:3},
  'ドイツワイン':{sweet:4,bitter:1,acid:3,body:2,strong:2,fruity:4},
  'アメリカワイン':{sweet:3,bitter:3,acid:2,body:4,strong:3,fruity:3},
  'ｵｰｽﾄﾗﾘｱ':{sweet:3,bitter:2,acid:2,body:3,strong:2,fruity:3},
  'ポルトガル':{sweet:3,bitter:3,acid:3,body:3,strong:2,fruity:3},
  '舶来ワイン':{sweet:2,bitter:2,acid:3,body:3,strong:2,fruity:3},
  'アルゼンチン':{sweet:2,bitter:3,acid:2,body:4,strong:3,fruity:3},
  '南アフリカ':{sweet:2,bitter:3,acid:2,body:3,strong:3,fruity:3},
  'ルーマニア':{sweet:3,bitter:2,acid:3,body:2,strong:2,fruity:3},
  'ジン':{sweet:1,bitter:3,acid:2,body:2,strong:4,fruity:2},
  'テキーラ':{sweet:1,bitter:2,acid:2,body:2,strong:4,fruity:1},
  'ラム':{sweet:3,bitter:1,acid:1,body:2,strong:4,fruity:2},
  'その他のｽﾋﾟﾘｯﾂ':{sweet:2,bitter:2,acid:2,body:2,strong:4,fruity:2},
  '国産ﾌﾞﾗﾝﾃﾞｰ':{sweet:3,bitter:2,acid:1,body:3,strong:4,fruity:3},
  'その他のﾌﾞﾗﾝﾃﾞｰ':{sweet:2,bitter:2,acid:1,body:3,strong:4,fruity:2},
  'コニャック':{sweet:3,bitter:2,acid:1,body:4,strong:4,fruity:3},
  'ﾌﾙｰﾂ･ﾌﾞﾗﾝﾃﾞｰ':{sweet:3,bitter:1,acid:2,body:2,strong:4,fruity:4},
  'その他のﾘｷｭｰﾙ':{sweet:4,bitter:1,acid:2,body:2,strong:2,fruity:4},
  '甘味果実酒':{sweet:5,bitter:1,acid:3,body:2,strong:2,fruity:5},
  '果実酒':{sweet:5,bitter:1,acid:3,body:2,strong:2,fruity:5},
  '薬草･ﾊｰﾌﾞ花':{sweet:2,bitter:3,acid:2,body:2,strong:3,fruity:2},
  'アサヒ':{sweet:2,bitter:3,acid:1,body:2,strong:1,fruity:1},
  'キリン':{sweet:2,bitter:3,acid:1,body:2,strong:1,fruity:1},
  'サントリー':{sweet:2,bitter:3,acid:1,body:2,strong:1,fruity:1},
  'サッポロ':{sweet:2,bitter:3,acid:1,body:2,strong:1,fruity:1},
  'その他ビール':{sweet:2,bitter:3,acid:1,body:2,strong:1,fruity:1},
  'ノンアルコールビール':{sweet:2,bitter:2,acid:1,body:1,strong:1,fruity:1},
  '発泡酒':{sweet:2,bitter:2,acid:1,body:1,strong:1,fruity:1},
  'その他　8％':{sweet:3,bitter:1,acid:2,body:1,strong:2,fruity:3},
  'その他の醸造酒':{sweet:3,bitter:2,acid:2,body:3,strong:2,fruity:2},
  '紹興酒 黄酒':{sweet:3,bitter:2,acid:2,body:4,strong:3,fruity:1},
};

function adjustFromTags(base, tags) {
  var p = Object.assign({}, base);
  var t = (tags || '').toLowerCase();
  if (t.includes('甘口') && !t.includes('やや甘口')) p.sweet = Math.min(5, p.sweet+2);
  else if (t.includes('やや甘口')) p.sweet = Math.min(5, p.sweet+1);
  if (t.includes('淡麗辛口')) { p.sweet = Math.max(1,p.sweet-2); p.bitter=Math.min(5,p.bitter+1); }
  else if (t.includes('辛口') && !t.includes('やや辛口')) p.sweet = Math.max(1,p.sweet-1);
  else if (t.includes('やや辛口')) p.sweet = Math.max(1,p.sweet-1);
  var fruits = ['フルーティ','りんご','いちご','もも','梅','みかん','ぶどう','パイナップル','ライチ','マンゴー'];
  if (fruits.some(function(f){return t.includes(f);})) { p.fruity=Math.min(5,p.fruity+1); p.sweet=Math.min(5,p.sweet+1); }
  if (t.includes('濃醇')||t.includes('濃厚')||t.includes('コク')) p.body=Math.min(5,p.body+1);
  if (t.includes('すっきり')||t.includes('淡麗')||t.includes('軽快')||t.includes('爽快')) p.body=Math.max(1,p.body-1);
  if (t.includes('酸味')) p.acid=Math.min(5,p.acid+1);
  if (t.includes('爽やか')||t.includes('爽酒')) p.acid=Math.min(5,p.acid+1);
  if (t.includes('苦み')||t.includes('苦味')||t.includes('渋み')||t.includes('タンニン')) p.bitter=Math.min(5,p.bitter+1);
  for (var k in p) p[k] = Math.max(1, Math.min(5, p[k]));
  return p;
}

var products = [];
rows.forEach(function(r, idx) {
  var cat = (r[0]||'').trim();
  var name = (r[2]||'').trim();
  var desc = (r[14]||'').trim();
  var tagsRaw = (r[15]||'').trim();
  var imagePath = (r[16]||'').trim();
  var price = r[6]||r[4]||0;

  if (!cat || !name || excludeCats.has(cat)) return;
  if (!catProfiles[cat]) return;
  if (!desc) return;

  var base = catProfiles[cat];
  var profile = adjustFromTags(base, tagsRaw);

  var tagList = tagsRaw.split(',')
    .map(function(t){return t.trim();})
    .filter(function(t){return t && ['日本酒','ワイン','ウイスキー','焼酎','リキュール','スピリッツ'].indexOf(t)<0;})
    .slice(2, 6);

  products.push({
    id: idx+1,
    type: cat,
    icon: catIcons[cat]||'🍶',
    name: name.length > 32 ? name.substring(0,32)+'…' : name,
    desc: desc,
    tags: tagList.slice(0,4),
    price: price,
    image: imagePath || null,
    profile: profile
  });
});

console.log('生成商品数: ' + products.length);
var catCount = {};
products.forEach(function(p){catCount[p.type]=(catCount[p.type]||0)+1;});
Object.entries(catCount).sort(function(a,b){return b[1]-a[1];}).slice(0,15).forEach(function(e){console.log(e[1], e[0]);});

var output = '// 店舗実商品データベース（自動生成）\nconst PRODUCTS = ' + JSON.stringify(products) + ';\n';
var outPath = path.join(__dirname, 'products.js');
fs.writeFileSync(outPath, output, 'utf8');
console.log('\nproducts.js 出力先: ' + outPath);
var sizeKB = Math.round(Buffer.byteLength(output,'utf8')/1024);
console.log('ファイルサイズ: ' + sizeKB + ' KB');
