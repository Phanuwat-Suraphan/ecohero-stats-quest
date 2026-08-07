/* ============================= ACT 2: FRONTIER REGIONS =============================
   Same "swap the active scene graph" pattern as regions.js. Act 2 is gated
   behind a friendship milestone (see act2Unlocked below) so travelling out
   here has to be earned, per the EVERBLOOM design doc's Act unlock table. */
function act2Unlocked(){
  return NPC_DEFS.some(def =>
    ['harbor','forest','hollow'].includes(def.region) &&
    tierIndex(tierForPoints(getNpcFriend(def.id).points).id) >= tierIndex('friend')
  );
}

function makeCrystalCluster(x,z,hue,scale){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:hue, emissive:hue, emissiveIntensity:0.35, roughness:0.25, metalness:0.15});
  for(let i=0;i<4;i++){
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.18+Math.random()*0.12, 0.7+Math.random()*0.6, 5), mat);
    shard.position.set((Math.random()-0.5)*0.5, 0.35, (Math.random()-0.5)*0.5);
    shard.rotation.z = (Math.random()-0.5)*0.4;
    g.add(shard);
  }
  g.position.set(x,0,z); g.scale.setScalar(scale);
  return g;
}
function makeTorch(x,z){
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,1.2,6), new THREE.MeshStandardMaterial({color:0x6e4529, roughness:0.9}));
  post.position.y = 0.6;
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16,0.4,8), new THREE.MeshStandardMaterial({color:0xffab52, emissive:0xff8a2c, emissiveIntensity:0.8}));
  flame.position.y = 1.35;
  const glow = new THREE.PointLight(0xffab52, 0.8, 4);
  glow.position.y = 1.35;
  g.add(post, flame, glow);
  g.position.set(x,0,z);
  return g;
}
function makePalm(x,z,scale){
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,2.4,7), new THREE.MeshStandardMaterial({color:0xb98a55, roughness:0.85}));
  trunk.position.y = 1.2; trunk.rotation.z = 0.08;
  const leafMat = new THREE.MeshStandardMaterial({color:0x6fce6a, roughness:0.75});
  for(let i=0;i<5;i++){
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.22,1.5,4), leafMat);
    const a = (i/5)*Math.PI*2;
    frond.position.set(Math.cos(a)*0.4, 2.5, Math.sin(a)*0.4);
    frond.rotation.z = Math.PI/2 + Math.cos(a)*0.6;
    frond.rotation.x = Math.sin(a)*0.6;
    g.add(frond);
  }
  g.add(trunk);
  g.position.set(x,0,z); g.scale.setScalar(scale);
  return g;
}
function makeDuneMound(x,z,scale){
  const g = new THREE.Mesh(new THREE.SphereGeometry(1,10,8), new THREE.MeshStandardMaterial({color:0xf0c778, roughness:0.9}));
  g.scale.set(scale, scale*0.35, scale);
  g.position.set(x, scale*0.1, z);
  return g;
}
function makeTent(x,z,hue,rotY){
  const g = new THREE.Group();
  const cloth = new THREE.Mesh(new THREE.ConeGeometry(1.3,1.6,4), new THREE.MeshStandardMaterial({color:hue, roughness:0.75}));
  cloth.rotation.y = Math.PI/4; cloth.position.y = 0.8;
  g.add(cloth);
  g.position.set(x,0,z); g.rotation.y = rotY;
  return g;
}
function makeGoatPen(){
  const g = new THREE.Group();
  g.add(makeFenceRun(-1.4,-1.4,0,4));
  g.add(makeFenceRun(-1.4,-1.4,Math.PI/2,4));
  const shed = new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,1.8), new THREE.MeshStandardMaterial({color:0xd9c090, roughness:0.85}));
  shed.position.set(0.6,0.8,0.6);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7,0.9,4), new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.8}));
  roof.rotation.y = Math.PI/4; roof.position.set(0.6,1.9,0.6);
  g.add(shed, roof);
  addCuteFace(g, 0.6, 1.15, 1.52, 1.0, 0.32);
  return g;
}
function makeBoardwalkTile(x,z,rotY){
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.6,0.12,1.4), new THREE.MeshStandardMaterial({color:0x9a7a52, roughness:0.9}));
  t.position.set(x,0.4,z); t.rotation.y = rotY;
  return t;
}
function makeFirefly(x,z,hue){
  const g = new THREE.Group();
  const glow = new THREE.PointLight(hue, 0.7, 3);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6), new THREE.MeshStandardMaterial({color:hue, emissive:hue, emissiveIntensity:0.9}));
  g.add(glow, core);
  g.position.set(x,1.1,z);
  g.userData.bobPhase = Math.random()*Math.PI*2;
  return g;
}

/* ---------------- Amberfall Falls ---------------- */
const fallsGroup = new THREE.Group();
fallsGroup.add(makeIslandBase(0x7ac9a0, 26));
const fallsPool = new THREE.Mesh(new THREE.CylinderGeometry(9,9,0.3,26), new THREE.MeshStandardMaterial({color:0x6fd6ff, transparent:true, opacity:0.82, roughness:0.15}));
fallsPool.position.set(-6, 0.4, 10);
fallsGroup.add(fallsPool);
const fallsSheet = new THREE.Mesh(new THREE.PlaneGeometry(6,16), new THREE.MeshStandardMaterial({color:0xfff2c0, transparent:true, opacity:0.55, roughness:0.2, side:THREE.DoubleSide}));
fallsSheet.position.set(-6, 6, 4); fallsSheet.rotation.x = 0.12;
fallsGroup.add(fallsSheet);
for(let i=0;i<6;i++){
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2+Math.random()*0.8,0), new THREE.MeshStandardMaterial({color:0xc79a5a, roughness:0.9, flatShading:true}));
  rock.position.set(-9+Math.random()*3, 0.6, 6+Math.random()*8);
  fallsGroup.add(rock);
}
for(let i=0;i<4;i++){
  const angle = Math.random()*Math.PI*2, radius = 8 + Math.random()*12;
  fallsGroup.add(makeTree(Math.cos(angle)*radius + 6, Math.sin(angle)*radius - 4, 0.85+Math.random()*0.4));
}
const fallsCaveDoor = new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,2.4,12,1,false,0,Math.PI), new THREE.MeshStandardMaterial({color:0x2a2438, roughness:0.9}));
fallsCaveDoor.rotation.z = Math.PI/2; fallsCaveDoor.rotation.y = Math.PI/2; fallsCaveDoor.position.set(-6, 1.2, 3);
fallsGroup.add(fallsCaveDoor);
fallsGroup.add(makeSignboard(4, -6, -0.4));
const fallsTravelSign = makeTravelSign('กลับ Whisperwood');
fallsTravelSign.position.set(10, 0, -8);
fallsGroup.add(fallsTravelSign);
const fallsCavesSign = makeTravelSign('เข้า Glimmerdeep Caves');
fallsCavesSign.position.set(-2, 0, 16);
fallsGroup.add(fallsCavesSign);
REGIONS.falls = { name:'Amberfall Falls', thaiName:'น้ำตกอำพัน', group:fallsGroup, spawn:{x:8,z:-6}, walkRadius:25, requiresAct2:true };

/* ---------------- Glimmerdeep Caves ---------------- */
const cavesGroup = new THREE.Group();
cavesGroup.add(makeIslandBase(0x413a52, 26));
const crystalHues = [0x8f6fe0, 0x6fd6ff, 0xff9ec4, 0x8fe07a];
for(let i=0;i<14;i++){
  const angle = Math.random()*Math.PI*2, radius = 3 + Math.random()*20;
  cavesGroup.add(makeCrystalCluster(Math.cos(angle)*radius, Math.sin(angle)*radius, crystalHues[i%crystalHues.length], 0.7+Math.random()*0.7));
}
[[6,-6],[-8,4],[2,12],[-4,-14]].forEach(([x,z])=>cavesGroup.add(makeTorch(x,z)));
const cavesLake = new THREE.Mesh(new THREE.CylinderGeometry(4.5,4.5,0.25,22), new THREE.MeshStandardMaterial({color:0x2a2a5e, transparent:true, opacity:0.85, roughness:0.1, metalness:0.2}));
cavesLake.position.set(10, 0.4, 8);
cavesGroup.add(cavesLake);
cavesGroup.add(makeSignboard(-10, -4, 0.5));
const cavesBackSign = makeTravelSign('กลับ Amberfall Falls');
cavesBackSign.position.set(0, 0, -18);
cavesGroup.add(cavesBackSign);
const cavesPeakSign = makeTravelSign('ขึ้น Stonepeak Mountains');
cavesPeakSign.position.set(14, 0, -10);
cavesGroup.add(cavesPeakSign);
REGIONS.caves = { name:'Glimmerdeep Caves', thaiName:'ถ้ำแวววาว', group:cavesGroup, spawn:{x:0,z:-14}, walkRadius:24 };

/* ---------------- Stonepeak Mountains ---------------- */
const peakGroup = new THREE.Group();
peakGroup.add(makeIslandBase(0xc3c3cc, 26));
for(let i=0;i<8;i++){
  const angle = Math.random()*Math.PI*2, radius = 4 + Math.random()*20;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2+Math.random(), 4+Math.random()*3, 6), new THREE.MeshStandardMaterial({color:0x9a9aa8, roughness:0.85, flatShading:true}));
  spire.position.set(Math.cos(angle)*radius, 1.5, Math.sin(angle)*radius);
  peakGroup.add(spire);
}
for(let i=0;i<10;i++){
  const angle = Math.random()*Math.PI*2, radius = 3 + Math.random()*18;
  const snow = new THREE.Mesh(new THREE.CircleGeometry(1.2+Math.random(),10), new THREE.MeshStandardMaterial({color:0xffffff, roughness:0.9}));
  snow.rotation.x = -Math.PI/2; snow.position.set(Math.cos(angle)*radius, 0.72, Math.sin(angle)*radius);
  peakGroup.add(snow);
}
const goatPen = makeGoatPen();
goatPen.position.set(-10, 0.7, 6);
peakGroup.add(goatPen);
const airshipDock = new THREE.Mesh(new THREE.BoxGeometry(5,0.3,4), new THREE.MeshStandardMaterial({color:0xb98a55, roughness:0.85}));
airshipDock.position.set(8, 0.9, -8);
peakGroup.add(airshipDock);
for(let i=0;i<4;i++){
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,1.6,6), new THREE.MeshStandardMaterial({color:0x6e4529}));
  post.position.set(8+(i%2?2:-2), 0.75, -8+(i<2?1.6:-1.6));
  peakGroup.add(post);
}
peakGroup.add(makeSignboard(-2, 14, 0));
const peakBackSign = makeTravelSign('กลับ Glimmerdeep Caves');
peakBackSign.position.set(-16, 0, -10);
peakGroup.add(peakBackSign);
REGIONS.peak = { name:'Stonepeak Mountains', thaiName:'ภูเขาหินยอดเมฆ', group:peakGroup, spawn:{x:-12,z:-8}, walkRadius:24 };

/* ---------------- Duskmire Marsh ---------------- */
const marshGroup = new THREE.Group();
marshGroup.add(makeIslandBase(0x5a7a52, 26));
const marshWater = new THREE.Mesh(new THREE.CylinderGeometry(24,24,0.15,32), new THREE.MeshStandardMaterial({color:0x3a5a4a, transparent:true, opacity:0.7, roughness:0.3}));
marshWater.position.y = 0.55;
marshGroup.add(marshWater);
for(let i=0;i<10;i++){ marshGroup.add(makeBoardwalkTile(-2+Math.sin(i*0.6)*3, -18+i*3.6, Math.sin(i*0.3)*0.3)); }
for(let i=0;i<10;i++){
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.9+Math.random()*0.5,10), new THREE.MeshStandardMaterial({color:0x4f8a56, roughness:0.8}));
  pad.rotation.x = -Math.PI/2; pad.position.set((Math.random()-0.5)*36, 0.63, (Math.random()-0.5)*36);
  marshGroup.add(pad);
}
for(let i=0;i<5;i++){
  const angle = Math.random()*Math.PI*2, radius = 6 + Math.random()*16;
  marshGroup.add(makeTree(Math.cos(angle)*radius, Math.sin(angle)*radius, 0.7+Math.random()*0.3));
}
const marshHut = new THREE.Mesh(new THREE.BoxGeometry(3,2.2,2.6), new THREE.MeshStandardMaterial({color:0x6b5738, roughness:0.85}));
marshHut.position.set(14,1.1,10);
const marshHutRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4,1.3,4), new THREE.MeshStandardMaterial({color:0x4a3a28, roughness:0.85}));
marshHutRoof.rotation.y = Math.PI/4; marshHutRoof.position.set(14,2.9,10);
marshGroup.add(marshHut, marshHutRoof);
const marshFireflyHues = [0xd9a8ff, 0xfff2a0, 0x8fe0c8];
for(let i=0;i<8;i++){
  const angle = Math.random()*Math.PI*2, radius = 4 + Math.random()*18;
  marshGroup.add(makeFirefly(Math.cos(angle)*radius, Math.sin(angle)*radius, marshFireflyHues[i%3]));
}
marshGroup.add(makeSignboard(0, -22, 0));
const marshBackSign = makeTravelSign('กลับ Sunny Hollow');
marshBackSign.position.set(-4, 0, -24);
marshGroup.add(marshBackSign);
const marshDunesSign = makeTravelSign('ไป Amber Dunes Desert');
marshDunesSign.position.set(18, 0, 16);
marshGroup.add(marshDunesSign);
REGIONS.marsh = { name:'Duskmire Marsh', thaiName:'หนองน้ำสนธยา', group:marshGroup, spawn:{x:0,z:-20}, walkRadius:25, requiresAct2:true };

/* ---------------- Amber Dunes Desert ---------------- */
const dunesGroup = new THREE.Group();
dunesGroup.add(makeIslandBase(0xe0a458, 26));
for(let i=0;i<9;i++){
  const angle = Math.random()*Math.PI*2, radius = 3 + Math.random()*20;
  dunesGroup.add(makeDuneMound(Math.cos(angle)*radius, Math.sin(angle)*radius, 1.5+Math.random()*1.8));
}
const oasisPool = new THREE.Mesh(new THREE.CylinderGeometry(4,4,0.3,22), new THREE.MeshStandardMaterial({color:0x5fc2e0, transparent:true, opacity:0.85, roughness:0.15}));
oasisPool.position.set(-10, 0.4, -10);
dunesGroup.add(oasisPool);
[[-13,-8],[-8,-13],[-12,-13]].forEach(([x,z])=>dunesGroup.add(makePalm(x,z,1.1)));
[0xd9564a, 0xf0cf72].forEach((hue,i)=>dunesGroup.add(makeTent(10+i*3, -8+i*2, hue, i*0.5)));
for(let i=0;i<3;i++){
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,2.2,8), new THREE.MeshStandardMaterial({color:0xc79a5a, roughness:0.9}));
  pillar.position.set(6+i*2.4, 1.1, 14);
  pillar.rotation.z = (i-1)*0.15;
  dunesGroup.add(pillar);
}
dunesGroup.add(makeSignboard(2, 4, -0.3));
const dunesBackSign = makeTravelSign('กลับ Duskmire Marsh');
dunesBackSign.position.set(-4, 0, -22);
dunesGroup.add(dunesBackSign);
REGIONS.dunes = { name:'Amber Dunes Desert', thaiName:'ทะเลทรายอำพัน', group:dunesGroup, spawn:{x:0,z:-18}, walkRadius:24 };

/* ---------------- Act 1 -> Act 2 departure signs (gated) ---------------- */
const forestFallsSign = makeTravelSign('ไป Amberfall Falls'); forestFallsSign.position.set(16,0,4); forestGroup.add(forestFallsSign);
const hollowMarshSign = makeTravelSign('ไป Duskmire Marsh'); hollowMarshSign.position.set(-18,0,-4); hollowGroup.add(hollowMarshSign);

travelPointDefs.push(
  { id:'forest_to_falls', region:'forest', x:16, z:4, icon:'💧', label:'ไป Amberfall Falls', targetRegion:'falls' },
  { id:'falls_to_forest', region:'falls', x:10, z:-8, icon:'🏡', label:'กลับ Whisperwood Forest', targetRegion:'forest' },
  { id:'falls_to_caves', region:'falls', x:-2, z:16, icon:'💎', label:'เข้า Glimmerdeep Caves', targetRegion:'caves' },
  { id:'caves_to_falls', region:'caves', x:0, z:-18, icon:'💧', label:'กลับ Amberfall Falls', targetRegion:'falls' },
  { id:'caves_to_peak', region:'caves', x:14, z:-10, icon:'⛰️', label:'ขึ้น Stonepeak Mountains', targetRegion:'peak' },
  { id:'peak_to_caves', region:'peak', x:-16, z:-10, icon:'💎', label:'กลับ Glimmerdeep Caves', targetRegion:'caves' },
  { id:'hollow_to_marsh', region:'hollow', x:-18, z:-4, icon:'🌫️', label:'ไป Duskmire Marsh', targetRegion:'marsh' },
  { id:'marsh_to_hollow', region:'marsh', x:-4, z:-24, icon:'🏡', label:'กลับ Sunny Hollow Valley', targetRegion:'hollow' },
  { id:'marsh_to_dunes', region:'marsh', x:18, z:16, icon:'🏜️', label:'ไป Amber Dunes Desert', targetRegion:'dunes' },
  { id:'dunes_to_marsh', region:'dunes', x:-4, z:-22, icon:'🌫️', label:'กลับ Duskmire Marsh', targetRegion:'marsh' }
);

/* ============================= ACT 2 ACTIVITIES ============================= */
const TROUT_TYPES = [
  { name:'ปลาเทราต์เงิน', icon:'🐟', weightMin:0.2, weightMax:0.6, pricePerKg:12, weight:5 },
  { name:'ปลาเทราต์รุ้ง', icon:'🌈', weightMin:0.6, weightMax:1.4, pricePerKg:22, weight:3 },
  { name:'ปลาเทราต์ทองคำ', icon:'✨', weightMin:0.8, weightMax:1.8, pricePerKg:45, weight:1 }
];
let fallsFishCaughtCount = 0;
function goFishingFalls(){
  SFX.plant();
  const total = TROUT_TYPES.reduce((s,f)=>s+f.weight,0);
  let r = Math.random()*total, fish = TROUT_TYPES[0];
  for(const f of TROUT_TYPES){ r -= f.weight; if(r <= 0){ fish = f; break; } }
  const weightKg = +(fish.weightMin + Math.random()*(fish.weightMax-fish.weightMin)).toFixed(1);
  const coins = Math.round(weightKg * fish.pricePerKg);
  const xp = Math.max(2, Math.round(coins/4));
  setTimeout(()=>{
    SFX.harvest();
    addCoins(coins); addXp(xp);
    fallsFishCaughtCount++;
    localStorage.setItem('rfi_falls_fish_caught', String(fallsFishCaughtCount));
    if(fallsFishCaughtCount >= 10) unlockAchievement('falls_angler10');
    toastFarm(`${fish.icon} ตกปลาได้ ${fish.name}! ${weightKg} กก. × 🪙${fish.pricePerKg}/กก. = 🪙${coins}`, 'ok');
    saveFarmState(); renderHud();
  }, 500);
}

const CRYSTAL_TYPES = [
  { name:'ผลึกม่วง', icon:'💜', valueMin:8, valueMax:16, weight:5 },
  { name:'ผลึกฟ้าใส', icon:'💙', valueMin:10, valueMax:20, weight:4 },
  { name:'ผลึกสายรุ้งหายาก', icon:'🌈', valueMin:30, valueMax:55, weight:1 }
];
let crystalsMinedCount = 0;
function mineCrystal(){
  SFX.plant();
  const total = CRYSTAL_TYPES.reduce((s,c)=>s+c.weight,0);
  let r = Math.random()*total, gem = CRYSTAL_TYPES[0];
  for(const c of CRYSTAL_TYPES){ r -= c.weight; if(r <= 0){ gem = c; break; } }
  const coins = gem.valueMin + Math.floor(Math.random()*(gem.valueMax-gem.valueMin+1));
  const xp = Math.max(2, Math.round(coins/4));
  setTimeout(()=>{
    SFX.harvest();
    addCoins(coins); addXp(xp);
    crystalsMinedCount++;
    localStorage.setItem('rfi_crystals_mined', String(crystalsMinedCount));
    if(crystalsMinedCount >= 10) unlockAchievement('crystal_miner10');
    toastFarm(`${gem.icon} ขุดพบ ${gem.name}! 🪙${coins}`, 'ok');
    saveFarmState(); renderHud();
  }, 500);
}

const FIREFLY_TYPES = [
  { name:'หิ่งห้อยม่วง', icon:'🟣', valueMin:6, valueMax:12, weight:5 },
  { name:'หิ่งห้อยทอง', icon:'🟡', valueMin:8, valueMax:15, weight:4 },
  { name:'หิ่งห้อยเขียวมรกต', icon:'🟢', valueMin:20, valueMax:35, weight:1 }
];
let firefliesCaughtCount = 0;
function catchFireflies(){
  SFX.plant();
  const total = FIREFLY_TYPES.reduce((s,f)=>s+f.weight,0);
  let r = Math.random()*total, bug = FIREFLY_TYPES[0];
  for(const f of FIREFLY_TYPES){ r -= f.weight; if(r <= 0){ bug = f; break; } }
  const coins = bug.valueMin + Math.floor(Math.random()*(bug.valueMax-bug.valueMin+1));
  const xp = Math.max(2, Math.round(coins/4));
  setTimeout(()=>{
    SFX.harvest();
    addCoins(coins); addXp(xp);
    firefliesCaughtCount++;
    localStorage.setItem('rfi_fireflies_caught', String(firefliesCaughtCount));
    if(firefliesCaughtCount >= 10) unlockAchievement('firefly_catcher10');
    toastFarm(`${bug.icon} จับ ${bug.name} ใส่โคมได้แล้ว! 🪙${coins}`, 'ok');
    saveFarmState(); renderHud();
  }, 500);
}

const RELIC_TYPES = [
  { name:'เศษหม้อดินโบราณ', icon:'🏺', valueMin:8, valueMax:16, weight:5 },
  { name:'เหรียญโบราณ', icon:'🪙', valueMin:12, valueMax:22, weight:4 },
  { name:'จี้อัญมณีของกษัตริย์', icon:'👑', valueMin:35, valueMax:60, weight:1 }
];
let relicsFoundCount = 0;
function digRelic(){
  SFX.plant();
  const total = RELIC_TYPES.reduce((s,r)=>s+r.weight,0);
  let r = Math.random()*total, relic = RELIC_TYPES[0];
  for(const rt of RELIC_TYPES){ r -= rt.weight; if(r <= 0){ relic = rt; break; } }
  const coins = relic.valueMin + Math.floor(Math.random()*(relic.valueMax-relic.valueMin+1));
  const xp = Math.max(2, Math.round(coins/4));
  setTimeout(()=>{
    SFX.harvest();
    addCoins(coins); addXp(xp);
    relicsFoundCount++;
    localStorage.setItem('rfi_relics_found', String(relicsFoundCount));
    if(relicsFoundCount >= 10) unlockAchievement('relic_hunter10');
    toastFarm(`${relic.icon} ขุดพบ ${relic.name}! 🪙${coins}`, 'ok');
    saveFarmState(); renderHud();
  }, 500);
}

activityPointDefs.push(
  { id:'falls_fishing', region:'falls', x:-6, z:8, icon:'🎣', label:'ตกปลาเทราต์', onInteract:'goFishingFalls' },
  { id:'caves_mining', region:'caves', x:6, z:0, icon:'⛏️', label:'ขุดแร่ผลึก', onInteract:'mineCrystal' },
  { id:'marsh_fireflies', region:'marsh', x:0, z:6, icon:'🏮', label:'จับหิ่งห้อย', onInteract:'catchFireflies' },
  { id:'dunes_digging', region:'dunes', x:6, z:14, icon:'⛏️', label:'ขุดสำรวจโบราณสถาน', onInteract:'digRelic' }
);

/* ============================= ACT 2 NPCS ============================= */
NPC_DEFS.push(
  { id:'skyexplorer', name:'นักสำรวจฟ้า', role:'นักปีนเขาผู้ชื่นชอบสายรุ้ง', emoji:'🧗', bodyColor:0xff9d66, headColor:0xfff2df, region:'falls', x:6, z:-2,
    lines:{
      stranger:'โอ้! นักเดินทางหน้าใหม่นี่นา น้ำตกนี้สวยใช่ไหมล่ะ',
      acquaintance:'ฉันกำลังตามหาสายรุ้งคู่อยู่ ต้องรอแดดจัดหลังฝนถึงจะเห็น',
      friend:'มาอีกแล้ว! วันนี้อยากปีนผาไปด้วยกันไหม',
      close:'เธอมีใจนักสำรวจเหมือนฉันเลยนะ',
      helper:'มีเธอช่วย ฉันสำรวจได้ไกลขึ้นเยอะเลย',
      family:'น้ำตกนี้เป็นเหมือนบ้านที่สองของเราแล้วนะ'
    },
    gift:{ name:'ผลไม้ป่าสด ๆ', icon:'🍇', cost:20 },
    quest:{ id:'feather', title:'ขนนกวิเศษที่หายไป',
      ask:'ขนนกกระเต็นสายรุ้งที่ฉันเก็บสะสมไว้ปลิวหายไปแถวน้ำตกน่ะ ช่วยหาให้หน่อยได้ไหม?',
      remind:'ขนนกยังไม่เจอเลยนะ ลองเดินสำรวจรอบสระน้ำตกดูสิ',
      complete:'เจอแล้ว! ขอบคุณมากเลยนะ นี่มันหายากมากจริง ๆ',
      done:'ขนนกเส้นนั้นยังอยู่ในคอลเลกชันของฉันนะ ขอบคุณอีกครั้ง',
      itemFlag:'featherFound', reward:{coins:50, xp:18} }
  },
  { id:'crystalminer', name:'ช่างแร่ผลึก', role:'คนขุดแร่ประจำถ้ำ', emoji:'⛏️', bodyColor:0x8f6fe0, headColor:0xe8e0f5, region:'caves', x:-4, z:6,
    lines:{
      stranger:'สวัสดี... ระวังหัวด้วยนะ เพดานถ้ำต่ำ',
      acquaintance:'ผลึกในถ้ำนี้แต่ละก้อนไม่เหมือนกันเลยนะ',
      friend:'มาช่วยขุดแร่ด้วยกันอีกแล้วเหรอ ดีใจจัง',
      close:'มีเธอเป็นเพื่อน ถ้ำนี้ไม่เงียบเหงาอีกต่อไปแล้ว',
      helper:'ผลึกที่ขุดได้ตอนนี้สวยขึ้นเพราะเธอช่วยหาเลยนะ',
      family:'ถ้ำนี้เป็นบ้านของเรากับเธอแล้วล่ะ'
    },
    gift:{ name:'หินขัดเงางาม', icon:'🪨', cost:20 },
    quest:{ id:'rarecrystal', title:'ผลึกสายรุ้งหายาก',
      ask:'ผมอยากได้ผลึกสายรุ้งหายากมาไว้ในคอลเลกชันสักก้อน ช่วยหาให้หน่อยได้ไหม?',
      remind:'ผลึกหายากยังไม่เจอเลยนะ ลองเดินสำรวจในถ้ำดูสิ',
      complete:'เจอแล้ว! สวยมากเลย ขอบคุณจริง ๆ นะ',
      done:'ผลึกก้อนนั้นยังวางอวดอยู่ในถ้ำเลยนะ',
      itemFlag:'rareCrystalFound', reward:{coins:50, xp:18} }
  },
  { id:'goatherder', name:'คนเลี้ยงแพะเขา', role:'คนเลี้ยงแพะประจำยอดเขา', emoji:'🐐', bodyColor:0xd9c090, headColor:0xfff2df, region:'peak', x:-8, z:8,
    lines:{
      stranger:'สวัสดี! ระวังลมแรงนะ ยอดเขานี้อากาศเปลี่ยนไว',
      acquaintance:'ฝูงแพะของฉันชอบเดินเล่นบนหน้าผาสูง ๆ',
      friend:'มาเยี่ยมฝูงแพะอีกแล้วเหรอ พวกมันจำเธอได้แล้วนะ',
      close:'เธอเข้ากับแพะได้ดีเหมือนเป็นคนเลี้ยงแพะจริง ๆ เลย',
      helper:'ฝูงแพะปลอดภัยดีเพราะมีเธอคอยช่วยดูแลนะ',
      family:'ยอดเขานี้อบอุ่นขึ้นเพราะมีเธอนะ'
    },
    gift:{ name:'หญ้าแห้งหอม ๆ', icon:'🌾', cost:20 },
    quest:{ id:'lostgoat', title:'ลูกแพะที่หลงทาง',
      ask:'ลูกแพะตัวน้อยของฉันวิ่งหลงไปไกลจากฝูง ช่วยตามหาให้หน่อยได้ไหม?',
      remind:'ลูกแพะยังหาไม่เจอเลยนะ ลองเดินสำรวจรอบภูเขาดูสิ',
      complete:'เจอแล้ว! ขอบคุณมากเลยนะ มันปลอดภัยดีแล้ว',
      done:'ลูกแพะตัวนั้นกลับมาอยู่กับฝูงอย่างปลอดภัยแล้วนะ ขอบคุณอีกครั้ง',
      itemFlag:'lostGoatFound', reward:{coins:50, xp:18} }
  },
  { id:'airshipbuilder', name:'ช่างต่อเรือเหาะ', role:'ช่างประดิษฐ์ผู้ใฝ่ฝันถึงท้องฟ้า', emoji:'🎈', bodyColor:0xffab52, headColor:0xfff8ea, region:'peak', x:8, z:-4,
    lines:{
      stranger:'สวัสดี! เห็นแท่นไม้นั่นไหม สักวันมันจะกลายเป็นท่าจอดเรือเหาะนะ',
      acquaintance:'ฉันกำลังออกแบบเรือเหาะที่จะพาผู้คนไปดินแดนไกล ๆ',
      friend:'มาดูความคืบหน้าอีกแล้วเหรอ ดีใจที่มีคนสนใจนะ',
      close:'เธอเชื่อในความฝันของฉันจริง ๆ นะ ขอบคุณมาก',
      helper:'มีเธอช่วย งานสร้างเรือเหาะคืบหน้าไปเยอะเลย',
      family:'วันที่เรือเหาะบินได้ เธอต้องได้ขึ้นเป็นคนแรกแน่นอน'
    },
    gift:{ name:'เชือกถักแน่นหนา', icon:'🪢', cost:20 },
    quest:{ id:'airshipsilk', title:'ผ้าไหมสำหรับบอลลูนเรือเหาะ',
      ask:'ผมต้องการผ้าไหมพิเศษมาทำบอลลูนเรือเหาะให้แข็งแรง ช่วยหาให้หน่อยได้ไหม?',
      remind:'ผ้าไหมยังไม่เจอเลยนะ ลองเดินสำรวจแถวยอดเขาดูสิ',
      complete:'เจอแล้ว! เยี่ยมไปเลย เรือเหาะใกล้จะเสร็จแล้วล่ะ ✨ เร็ว ๆ นี้มันจะพาเราไปดินแดนใหม่ไกลออกไปแน่นอน!',
      done:'เรือเหาะกำลังเตรียมพร้อม... เร็ว ๆ นี้จะพาเธอไปดินแดนใหม่แน่นอน!',
      itemFlag:'silkFound', reward:{coins:60, xp:25} }
  },
  { id:'uncleshep', name:'ลุงแกะ', role:'คนเลี้ยงแกะประจำหนองน้ำ', emoji:'🐑', bodyColor:0xf3e8d0, headColor:0xfff2df, region:'marsh', x:-6, z:2,
    lines:{
      stranger:'สวัสดี... เสียงกบร้องยามเย็นเพราะดีใช่ไหมล่ะ',
      acquaintance:'ฝูงแกะของลุงชอบหลงเข้าไปในพงหญ้าสูงบ่อย ๆ นะ',
      friend:'มาช่วยหาแกะอีกแล้วเหรอ ขอบใจจริง ๆ',
      close:'ลุงไว้ใจเธอเรื่องฝูงแกะที่สุดเลยนะ',
      helper:'ฝูงแกะปลอดภัยดีเพราะมีเธอช่วยนับดูแลนะ',
      family:'หนองน้ำนี้อบอุ่นขึ้นเพราะมีเธอนะ'
    },
    gift:{ name:'ขนแกะนุ่ม ๆ', icon:'🧶', cost:20 },
    quest:{ id:'lostsheep', title:'แกะหาย 3 ตัว',
      ask:'แกะของลุงหายไป 3 ตัวเลยระหว่างเดินหมอกยามเช้า ช่วยนับและตามหาให้ครบหน่อยได้ไหม?',
      remind:'ยังหาแกะไม่ครบ 3 ตัวเลยนะ ลองเดินสำรวจในหนองน้ำดูสิ',
      complete:'ครบ 3 ตัวแล้ว! นับดูอีกทีก็ครบพอดีเป๊ะเลย ขอบคุณมากนะ',
      done:'แกะทั้ง 3 ตัวปลอดภัยอยู่กับฝูงแล้วนะ ขอบคุณอีกครั้ง',
      checkFn:'allSheepFound', reward:{coins:55, xp:20} }
  },
  { id:'caravanleader', name:'หัวหน้ากองคาราวาน', role:'ผู้นำกองคาราวานค้าขาย', emoji:'🐫', bodyColor:0xd9564a, headColor:0xfff2df, region:'dunes', x:10, z:-6,
    lines:{
      stranger:'สวัสดี! กองคาราวานของเราแวะพักที่โอเอซิสนี้พอดี',
      acquaintance:'เราเดินทางค้าขายมาไกลจากดินแดนอื่นเลยนะ',
      friend:'มาอีกแล้ว! วันนี้มีของแปลกจากที่ไกล ๆ มาอวดด้วยนะ',
      close:'เธอนี่เหมือนสมาชิกกองคาราวานของเราไปแล้วนะ',
      helper:'กองคาราวานปลอดภัยดีเพราะมีเธอช่วยเหลือนะ',
      family:'ทุกครั้งที่กลับมา โอเอซิสนี้อบอุ่นขึ้นเพราะเธอนะ'
    },
    gift:{ name:'ผ้าพันคอลวดลายแปลก', icon:'🧣', cost:20 },
    quest:{ id:'silkroutemap', title:'แผนที่เส้นทางสายไหมที่หายไป',
      ask:'แผนที่เส้นทางการค้าของกองคาราวานปลิวหายไปในพายุทรายน่ะ ช่วยหาให้หน่อยได้ไหม?',
      remind:'แผนที่ยังไม่เจอเลยนะ ลองเดินสำรวจในทะเลทรายดูสิ',
      complete:'เจอแล้ว! ขอบคุณมากเลยนะ กองคาราวานเดินทางต่อได้แล้ว',
      done:'แผนที่เส้นทางสายไหมยังอยู่กับกองคาราวานนะ ขอบคุณอีกครั้ง',
      itemFlag:'silkRouteMapFound', reward:{coins:50, xp:18} }
  },
  { id:'tinyarch', name:'นักขุดค้นโบราณคดีจิ๋ว', role:'นักโบราณคดีตัวน้อยผู้ช่างสงสัย', emoji:'🔍', bodyColor:0xf0cf72, headColor:0xfff2df, region:'dunes', x:6, z:16,
    lines:{
      stranger:'สวัสดี! เห็นซากปรักหักพังใต้ทรายนั่นไหม น่าตื่นเต้นมากเลย',
      acquaintance:'ฉันเชื่อว่าใต้ทรายนี่มีเมืองโบราณทั้งเมืองซ่อนอยู่นะ',
      friend:'มาขุดสำรวจด้วยกันอีกแล้ว! สนุกจังเลย',
      close:'เธอมีจิตวิญญาณนักโบราณคดีเหมือนฉันเลยนะ',
      helper:'การขุดค้นคืบหน้าไปเยอะเพราะมีเธอช่วยนะ',
      family:'เราเป็นทีมนักโบราณคดีด้วยกันแล้วนะ!'
    },
    gift:{ name:'แปรงขุดโบราณวัตถุ', icon:'🖌️', cost:20 },
    quest:{ id:'ancienttablet', title:'แผ่นจารึกโบราณ',
      ask:'มีแผ่นจารึกโบราณฝังอยู่ใต้ทรายแถวซากปรักหักพัง ช่วยขุดหามาให้ฉันดูหน่อยได้ไหม?',
      remind:'แผ่นจารึกยังไม่เจอเลยนะ ลองขุดสำรวจแถวซากปรักหักพังดูสิ',
      complete:'เจอแล้ว! นี่มันข้อความโบราณที่ไม่เคยมีใครอ่านออกมาก่อนเลยนะ',
      done:'แผ่นจารึกนั้นยังอยู่ในการศึกษาของฉันเลยนะ ขอบคุณอีกครั้ง',
      itemFlag:'ancientTabletFound', reward:{coins:50, xp:18} }
  }
);

/* ============================= ACT 2 SECRETS & QUEST ITEMS ============================= */
worldItemDefs.push(
  { id:'feather', emoji:'🪶', x:-4, z:14, color:0xfff2c0, flagKey:'featherFound', region:'falls' },
  { id:'fallscave', emoji:'💠', x:-6, z:3, color:0xffe08a, flagKey:'fallsCaveFound', secret:true, coins:70, xp:18, region:'falls' },
  { id:'rarecrystal', emoji:'🌈', x:8, z:14, color:0xd9a8ff, flagKey:'rareCrystalFound', region:'caves' },
  { id:'undergroundlake', emoji:'✨', x:10, z:8, color:0x8fd6ff, flagKey:'undergroundLakeFound', secret:true, coins:70, xp:18, region:'caves' },
  { id:'lostgoat', emoji:'🐐', x:6, z:14, color:0xf3e8d0, flagKey:'lostGoatFound', region:'peak' },
  { id:'silk', emoji:'🪢', x:12, z:6, color:0xfff8ea, flagKey:'silkFound', region:'peak' },
  { id:'peakshrine', emoji:'⛩️', x:0, z:-16, color:0xffd166, flagKey:'peakShrineFound', secret:true, coins:70, xp:18, region:'peak' },
  { id:'sheep1', emoji:'🐑', x:10, z:6, color:0xf3e8d0, flagKey:'sheepFound1', region:'marsh' },
  { id:'sheep2', emoji:'🐑', x:-14, z:12, color:0xf3e8d0, flagKey:'sheepFound2', region:'marsh' },
  { id:'sheep3', emoji:'🐑', x:6, z:-10, color:0xf3e8d0, flagKey:'sheepFound3', region:'marsh' },
  { id:'midnightlotus', emoji:'🪷', x:-16, z:-8, color:0xff9ec4, flagKey:'midnightLotusFound', secret:true, coins:70, xp:18, region:'marsh' },
  { id:'silkroutemap', emoji:'🗺️', x:-6, z:6, color:0xf5d98a, flagKey:'silkRouteMapFound', region:'dunes' },
  { id:'ancienttablet', emoji:'🪨', x:8, z:16, color:0xc79a5a, flagKey:'ancientTabletFound', region:'dunes' },
  { id:'hiddenoasis', emoji:'🌴', x:-16, z:4, color:0x6fd6ff, flagKey:'hiddenOasisFound', secret:true, coins:70, xp:18, region:'dunes' }
);

/* ============================= BUILD ALL NPC & ITEM MESHES =============================
   Runs here, once every region (Act 1 and Act 2) and every def is registered,
   so every NPC/item has a home group to be added to. */
NPC_DEFS.forEach(def=>{ npcMeshes[def.id] = buildNpcMesh(def); });
worldItemDefs.forEach(def=>{ worldItemMeshes[def.id] = buildWorldItem(def); });
