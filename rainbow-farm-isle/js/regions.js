/* ============================= REGION FRAMEWORK =============================
   Sunmeadow Isle (islandGroup, from scene.js) stays exactly as it was. Every
   other region here is a separate THREE.Group built once at load and only
   added to the scene while active — the exact "swap the active scene graph"
   pattern already proven by the maze->dome transition in this project's
   earlier prototype. Only one region's geometry (and physics/interactions)
   is ever live at a time, so nothing about Sunmeadow's tested code changes. */
function makeIslandBase(topColor, topRadius){
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, topRadius, 1.4, 32), new THREE.MeshStandardMaterial({color:topColor, roughness:0.85}));
  g.add(top);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(topRadius-1, topRadius-13, 5, 32), new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.95}));
  dirt.position.y = -3.4;
  g.add(dirt);
  const point = new THREE.Mesh(new THREE.ConeGeometry(topRadius-20, 8, 24), new THREE.MeshStandardMaterial({color:0x6e4529, roughness:0.95}));
  point.position.y = -9.9;
  g.add(point);
  return g;
}
function makeTravelSign(label){
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.85});
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,2.2,8), postMat);
  post.position.y = 1.1;
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.7,0.1), new THREE.MeshStandardMaterial({color:0xf3e3c0, roughness:0.8}));
  board.position.y = 2.0;
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.35,0.5,4), new THREE.MeshStandardMaterial({color:0xffab52, roughness:0.7}));
  arrow.rotation.z = -Math.PI/2; arrow.position.set(1.05,2.0,0);
  g.add(post, board, arrow);
  const glow = new THREE.PointLight(0xffe08a, 0.6, 5);
  glow.position.y = 2.0;
  g.add(glow);
  return g;
}

const REGIONS = {
  sunmeadow: { name:'Sunmeadow Isle', thaiName:'เกาะซันเมโดว์', group:islandGroup, spawn:{x:0,z:-22}, walkRadius:31.5 }
};
function regionGroupFor(id){ return REGIONS[id].group; }

/* ---------------- Driftwood Harbor ---------------- */
const harborGroup = new THREE.Group();
harborGroup.add(makeIslandBase(0xe6d3a0, 28));
const bay = new THREE.Mesh(
  new THREE.CylinderGeometry(13, 13, 0.3, 28),
  new THREE.MeshStandardMaterial({color:0x5fc2e0, transparent:true, opacity:0.85, roughness:0.15})
);
bay.position.set(14, 0.4, 6);
harborGroup.add(bay);
const pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 14), new THREE.MeshStandardMaterial({color:0xb98a55, roughness:0.85}));
pier.position.set(4, 0.55, 6);
harborGroup.add(pier);
for(let i=0;i<5;i++){
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,1.4,7), new THREE.MeshStandardMaterial({color:0x7a5638, roughness:0.9}));
  post.position.set(2.3 + (i%2)*3.6, 0.2, -1 + i*3.2);
  harborGroup.add(post);
}
function makeBoat(x,z,hue){
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4,1.0,1.5), new THREE.MeshStandardMaterial({color:hue, roughness:0.6}));
  hull.position.y = 0.7;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.0,0.15,1.2), new THREE.MeshStandardMaterial({color:0xd9c090, roughness:0.8}));
  deck.position.y = 1.25;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.6,6), new THREE.MeshStandardMaterial({color:0x6b4a30}));
  mast.position.set(0,2.5,0);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.9), new THREE.MeshStandardMaterial({color:0xfff8ea, side:THREE.DoubleSide, roughness:0.9}));
  sail.position.set(0.6,2.6,0); sail.rotation.y = Math.PI/2.3;
  g.add(hull, deck, mast, sail);
  addCuteFace(g, 0, 1.0, 0.78, 0.7, 0.3);
  g.position.set(x,0,z);
  g.userData.bobPhase = Math.random()*Math.PI*2;
  return g;
}
const harborBoats = [makeBoat(11,3,0x5698c9), makeBoat(18,10,0xe08a5c)];
harborBoats.forEach(b=>harborGroup.add(b));
function makeCrateStall(x,z,rotY){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xc79a5a, roughness:0.85});
  for(let i=0;i<3;i++){
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9), mat);
    crate.position.set((i%2)*1.0, 0.45+Math.floor(i/2)*0.9, (i%2)*0.2);
    g.add(crate);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6,0.7,4), new THREE.MeshStandardMaterial({color:0xff9d66, roughness:0.7}));
  roof.rotation.y = Math.PI/4; roof.position.set(0.4,1.9,0);
  g.add(roof);
  g.position.set(x,0,z); g.rotation.y = rotY;
  return g;
}
harborGroup.add(makeCrateStall(-6,-8,0.3), makeCrateStall(-10,-2,-0.4));
harborGroup.add(makeSignboard(-14, -14, 0.5));
harborGroup.add(makeFenceRun(-16, -20, 0.9, 4));
for(let i=0;i<5;i++){
  const angle = Math.random()*Math.PI*2, radius = 6 + Math.random()*16;
  harborGroup.add(makeTree(Math.cos(angle)*radius - 8, Math.sin(angle)*radius - 12, 0.75+Math.random()*0.3));
}
const harborTravelSign = makeTravelSign('กลับ Sunmeadow');
harborTravelSign.position.set(-20, 0, -14);
harborGroup.add(harborTravelSign);
REGIONS.harbor = { name:'Driftwood Harbor', thaiName:'ท่าเรือดริฟต์วูด', group:harborGroup, spawn:{x:-16,z:-10}, walkRadius:27 };

/* ---------------- Whisperwood Forest ---------------- */
const forestGroup = new THREE.Group();
forestGroup.add(makeIslandBase(0x4f8a56, 28));
for(let i=0;i<30;i++){
  const angle = Math.random()*Math.PI*2, radius = 4 + Math.random()*23;
  forestGroup.add(makeTree(Math.cos(angle)*radius, Math.sin(angle)*radius, 0.8+Math.random()*0.6));
}
function makeMushroom(x,z,scale){
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,0.5,8), new THREE.MeshStandardMaterial({color:0xf3e8d0, roughness:0.7}));
  stem.position.y = 0.25;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32,10,8,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({color:0xe0546a, roughness:0.6}));
  cap.position.y = 0.5;
  g.add(stem, cap);
  g.position.set(x,0,z); g.scale.setScalar(scale);
  return g;
}
for(let i=0;i<8;i++){
  const angle = Math.random()*Math.PI*2, radius = 3 + Math.random()*20;
  forestGroup.add(makeMushroom(Math.cos(angle)*radius, Math.sin(angle)*radius, 0.8+Math.random()*0.6));
}
function makeWorkshop(){
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6,2.4,3.0), new THREE.MeshStandardMaterial({color:0xb98a55, roughness:0.8}));
  base.position.y = 1.2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8,1.6,4), new THREE.MeshStandardMaterial({color:0x6e4529, roughness:0.8}));
  roof.rotation.y = Math.PI/4; roof.position.y = 3.2;
  const logPile = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,1.4,7), new THREE.MeshStandardMaterial({color:0x9a6a45}));
  logPile.rotation.z = Math.PI/2; logPile.position.set(2.2,0.3,0.8);
  g.add(base, roof, logPile);
  addCuteFace(g, 0, 1.6, 1.55, 1.1, 0.35);
  return g;
}
const workshop = makeWorkshop();
workshop.position.set(-8, 0.7, -14);
forestGroup.add(workshop);
const ancientTree = makeTree(10, 6, 2.1);
forestGroup.add(ancientTree);
const forestTravelSign = makeTravelSign('กลับ Sunmeadow');
forestTravelSign.position.set(-2, 0, -24);
forestGroup.add(forestTravelSign);
REGIONS.forest = { name:'Whisperwood Forest', thaiName:'ป่ากระซิบ', group:forestGroup, spawn:{x:-2,z:-20}, walkRadius:27 };

/* ---------------- Sunny Hollow Valley ---------------- */
const hollowGroup = new THREE.Group();
hollowGroup.add(makeIslandBase(0xf0cf72, 28));
const wheatMat = new THREE.MeshStandardMaterial({color:0xe8b647, roughness:0.8});
for(let row=-3; row<=3; row++){
  for(let col=-3; col<=3; col++){
    if(Math.abs(row)+Math.abs(col) > 4) continue;
    const tuft = new THREE.Group();
    for(let b=0;b<2;b++){
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.07,0.5,4), wheatMat);
      blade.position.set((Math.random()-0.5)*0.25, 0.9, (Math.random()-0.5)*0.25);
      blade.rotation.z = (Math.random()-0.5)*0.3;
      tuft.add(blade);
    }
    tuft.position.set(col*2.6 + 2, 0, row*2.6 - 6);
    hollowGroup.add(tuft);
  }
}
function makeBarn(){
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.0,3.2,4.0), new THREE.MeshStandardMaterial({color:0xd9564a, roughness:0.75}));
  base.position.y = 1.6;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8,2.0,4), new THREE.MeshStandardMaterial({color:0x6e4529, roughness:0.75}));
  roof.rotation.y = Math.PI/4; roof.position.y = 4.2;
  const door = new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,1.8,12,1,false,0,Math.PI), new THREE.MeshStandardMaterial({color:0xf3e3c0}));
  door.rotation.z = Math.PI/2; door.rotation.y = Math.PI/2; door.position.set(0,0.9,2.02);
  g.add(base, roof, door);
  addCuteFace(g, 0, 2.3, 2.05, 1.4, 0.4);
  return g;
}
const barn = makeBarn();
barn.position.set(-14, 0.7, -18);
hollowGroup.add(barn);
function makePumpkinPatch(x,z){
  const g = new THREE.Group();
  for(let i=0;i<4;i++){
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.4+Math.random()*0.3,10,8), new THREE.MeshStandardMaterial({color:0xff9d3d, roughness:0.7}));
    p.scale.set(1,0.8,1);
    p.position.set((Math.random()-0.5)*2.2, 0.35, (Math.random()-0.5)*2.2);
    g.add(p);
  }
  g.position.set(x,0,z);
  return g;
}
hollowGroup.add(makePumpkinPatch(16, -6), makePumpkinPatch(19, 2));
function makeWindmill(){
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.3,4.0,10), new THREE.MeshStandardMaterial({color:0xf3e3c0, roughness:0.8}));
  tower.position.y = 2.0;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1,1.0,10), new THREE.MeshStandardMaterial({color:0xe0546a, roughness:0.7}));
  cap.position.y = 4.5;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.4,8), new THREE.MeshStandardMaterial({color:0x6e4529}));
  hub.rotation.x = Math.PI/2; hub.position.set(0,3.6,1.1);
  const blades = new THREE.Group();
  for(let i=0;i<4;i++){
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18,1.8,0.06), new THREE.MeshStandardMaterial({color:0xfff8ea, roughness:0.8}));
    blade.position.y = 0.9;
    const holder = new THREE.Group(); holder.add(blade); holder.rotation.z = (i/4)*Math.PI*2;
    blades.add(holder);
  }
  blades.position.set(0,3.6,1.15);
  blades.name = 'windmillBlades';
  g.add(tower, cap, hub, blades);
  return g;
}
const windmill = makeWindmill();
windmill.position.set(-2, 0.7, 16);
hollowGroup.add(windmill);
const hollowTravelSign = makeTravelSign('กลับ Sunmeadow');
hollowTravelSign.position.set(2, 0, 20);
hollowGroup.add(hollowTravelSign);
REGIONS.hollow = { name:'Sunny Hollow Valley', thaiName:'หุบเขาแดดอุ่น', group:hollowGroup, spawn:{x:2,z:16}, walkRadius:27 };

/* ============================= TRAVEL POINTS ============================= */
const travelPointDefs = [
  { id:'sunmeadow_to_harbor', region:'sunmeadow', x:24, z:-6, icon:'⛵', label:'ล่องเรือไป Driftwood Harbor', targetRegion:'harbor' },
  { id:'sunmeadow_to_forest', region:'sunmeadow', x:-22, z:-28, icon:'🌲', label:'เดินเข้า Whisperwood Forest', targetRegion:'forest' },
  { id:'sunmeadow_to_hollow', region:'sunmeadow', x:20, z:22, icon:'🌾', label:'เดินไป Sunny Hollow Valley', targetRegion:'hollow' },
  { id:'harbor_to_sunmeadow', region:'harbor', x:-20, z:-14, icon:'🏡', label:'กลับ Sunmeadow Isle', targetRegion:'sunmeadow' },
  { id:'forest_to_sunmeadow', region:'forest', x:-2, z:-24, icon:'🏡', label:'กลับ Sunmeadow Isle', targetRegion:'sunmeadow' },
  { id:'hollow_to_sunmeadow', region:'hollow', x:2, z:20, icon:'🏡', label:'กลับ Sunmeadow Isle', targetRegion:'sunmeadow' }
];
// travel signposts in Sunmeadow itself (the three new departure points)
const sunmeadowHarborSign = makeTravelSign('ไป Driftwood Harbor'); sunmeadowHarborSign.position.set(22,0,-8); islandGroup.add(sunmeadowHarborSign);
const sunmeadowForestSign = makeTravelSign('ไป Whisperwood Forest'); sunmeadowForestSign.position.set(-20,0,-26); islandGroup.add(sunmeadowForestSign);
const sunmeadowHollowSign = makeTravelSign('ไป Sunny Hollow Valley'); sunmeadowHollowSign.position.set(18,0,20); islandGroup.add(sunmeadowHollowSign);

function getVisitedRegions(){
  try{ const l = JSON.parse(localStorage.getItem('rfi_visited_regions')); return Array.isArray(l) ? l : []; } catch(e){ return []; }
}
function markRegionVisited(id){
  const list = getVisitedRegions();
  if(!list.includes(id)) list.push(id);
  localStorage.setItem('rfi_visited_regions', JSON.stringify(list));
  if(list.length >= Object.keys(REGIONS).length) unlockAchievement('region_explorer');
}
function travelTo(regionId){
  const target = REGIONS[regionId];
  if(!target || regionId === state.activeRegion) return;
  SFX.click();
  const current = REGIONS[state.activeRegion];
  scene.remove(current.group);
  scene.add(target.group);
  target.group.add(player);
  player.position.set(target.spawn.x, 0, target.spawn.z);
  state.activeRegion = regionId;
  markRegionVisited(regionId);
  nearbyTarget = null;
  renderProximityPrompt();
  document.getElementById('regionNameLabel').textContent = target.name;
  toastFarm(`🗺️ มาถึง ${target.name} · ${target.thaiName} แล้ว!`, null);
}

/* ============================= FISHING ACTIVITY (Driftwood Harbor) ============================= */
const FISH_TYPES = [
  { name:'ปลาซิวเงิน', icon:'🐟', weightMin:0.1, weightMax:0.4, pricePerKg:8, weight:5 },
  { name:'ปลากะพงเงิน', icon:'🐠', weightMin:0.8, weightMax:2.2, pricePerKg:15, weight:3 },
  { name:'ปลาหมึกจิ๋ว', icon:'🦑', weightMin:0.3, weightMax:0.9, pricePerKg:20, weight:2 },
  { name:'ปลาทองมงคล', icon:'🐡', weightMin:0.5, weightMax:1.5, pricePerKg:40, weight:1 }
];
function pickWeightedFish(){
  const total = FISH_TYPES.reduce((s,f)=>s+f.weight,0);
  let r = Math.random()*total;
  for(const f of FISH_TYPES){ r -= f.weight; if(r <= 0) return f; }
  return FISH_TYPES[0];
}
let fishCaughtCount = 0;
function goFishing(){
  SFX.plant();
  const fish = pickWeightedFish();
  const weightKg = +(fish.weightMin + Math.random()*(fish.weightMax-fish.weightMin)).toFixed(1);
  const coins = Math.round(weightKg * fish.pricePerKg);
  const xp = Math.max(2, Math.round(coins/4));
  setTimeout(()=>{
    SFX.harvest();
    addCoins(coins);
    addXp(xp);
    fishCaughtCount++;
    localStorage.setItem('rfi_fish_caught', String(fishCaughtCount));
    if(fishCaughtCount >= 10) unlockAchievement('angler10');
    toastFarm(`${fish.icon} ตกปลาได้ ${fish.name}! ${weightKg} กก. × 🪙${fish.pricePerKg}/กก. = 🪙${coins}`, 'ok');
    saveFarmState(); renderHud();
  }, 500);
}
const activityPointDefs = [
  { id:'harbor_fishing', region:'harbor', x:5, z:11, icon:'🎣', label:'ตกปลา', onInteract:'goFishing' }
];

/* ============================= NEW NPCS (Act 1) ============================= */
NPC_DEFS.push(
  { id:'lungrua', name:'ลุงเรือ', role:'กัปตันเรือประมง', emoji:'⚓', bodyColor:0x5698c9, headColor:0xfff2df, region:'harbor', x:2, z:9,
    lines:{
      stranger:'สวัสดี! ไม่เคยเห็นหน้าที่ท่าเรือนี้มาก่อนนะ มาจากซันเมโดว์เหรอ?',
      acquaintance:'วันนี้ทะเลใจดี คลื่นลมสงบดี เหมาะกับการตกปลาเลยล่ะ',
      friend:'กลับมาอีกแล้ว! มาช่วยตกปลาด้วยกันไหม',
      close:'ลุงว่าเธอนี่มีสายเลือดกะลาสีอยู่ในตัวนะ',
      helper:'ท่าเรือนี้โชคดีที่มีเธอมาช่วยนะ',
      family:'เธอเป็นเหมือนลูกเรือคนหนึ่งของลุงแล้วล่ะ'
    },
    gift:{ name:'เปลือกหอยเก่าแปลก ๆ', icon:'🐚', cost:20 },
    quest:{ id:'sailcloth', title:'ผ้าใบเรือลำใหม่',
      ask:'ลุงอยากซ่อมเรือใหญ่ให้เสร็จ แต่ขาดผ้าใบเรือพิเศษอยู่ชิ้นนึง ช่วยหาให้หน่อยได้ไหม?',
      remind:'ผ้าใบเรือยังหาไม่เจอเลยนะ ลองเดินสำรวจรอบท่าเรือดูสิ',
      complete:'เจอแล้ว! เยี่ยมไปเลย เรือลำใหม่จะได้แล่นออกทะเลไกลๆ ได้แล้ว ⛵',
      done:'เรือลำใหม่แล่นได้สวยเพราะผ้าใบที่เธอหามาให้เลยนะ',
      itemFlag:'sailclothFound', reward:{coins:45, xp:16} }
  },
  { id:'pakhanom', name:'ป้าขนม', role:'แม่ค้าขนมโบราณ', emoji:'🥮', bodyColor:0xff9d80, headColor:0xfff2df, region:'harbor', x:-8, z:-4,
    lines:{
      stranger:'สวัสดีจ้ะ แวะมาชิมขนมที่แผงป้าไหมล่ะ',
      acquaintance:'ขนมของป้าทำจากสูตรโบราณของครอบครัวเลยนะ',
      friend:'มาอีกแล้ว! วันนี้มีขนมใหม่ให้ชิมด้วยนะจ๊ะ',
      close:'เธอนี่เหมือนหลานป้าเองเลยนะจ๊ะ',
      helper:'ป้าไว้ใจเธอที่สุดในตลาดนี้เลยล่ะ',
      family:'แผงขนมนี้อบอุ่นขึ้นเพราะมีเธอแวะมาบ่อย ๆ นะจ๊ะ'
    },
    gift:{ name:'ใบเตยสดหอม ๆ', icon:'🌿', cost:20 },
    quest:{ id:'recipe', title:'สูตรขนมที่หายไป',
      ask:'สูตรขนมโบราณของครอบครัวป้าหายไปตอนที่ครัวไฟไหม้เล็กน้อยน่ะจ้ะ ช่วยหาให้หน่อยได้ไหม?',
      remind:'สูตรขนมยังไม่เจอเลยจ้ะ น่าจะยังอยู่แถวท่าเรือนี่แหละ',
      complete:'เจอสูตรแล้ว! ขอบคุณนะจ๊ะ ตอนนี้ป้าทำขนมสูตรเดิมได้อีกครั้งแล้ว',
      done:'ขนมที่ป้าขายตอนนี้อร่อยเพราะเธอช่วยหาสูตรคืนมาให้นะจ๊ะ',
      itemFlag:'recipeFound', reward:{coins:45, xp:16} }
  },
  { id:'changmaithong', name:'ช่างไม้ทอง', role:'ช่างไม้ประจำป่า', emoji:'🪚', bodyColor:0xb98a55, headColor:0xfff2df, region:'forest', x:-6, z:-10,
    lines:{
      stranger:'สวัสดี... (ยิ้มเขิน ๆ แล้วก้มหน้าแกะไม้ต่อ)',
      acquaintance:'ไม้ท่อนนี้จะกลายเป็นของเล่นให้เด็ก ๆ นะ',
      friend:'เธอมาอีกแล้วนี่นา นั่งดูได้เลยนะ',
      close:'พูดกับเธอแล้วรู้สึกสบายใจดีนะ',
      helper:'มีเธอช่วย งานช่างของผมเสร็จเร็วขึ้นเยอะเลย',
      family:'ป่านี้อบอุ่นขึ้นเพราะมีเธอนะ'
    },
    gift:{ name:'ไม้จากต้นเก่าแก่', icon:'🪵', cost:20 },
    quest:{ id:'specialwood', title:'ไม้พิเศษสร้างสะพาน',
      ask:'ผมกำลังหาไม้พิเศษ 2 ท่อนมาสร้างสะพานข้ามลำธารน่ะ ช่วยหาให้หน่อยได้ไหม?',
      remind:'ไม้พิเศษยังหาไม่เจอเลยนะ ลองเดินสำรวจในป่าดูสิ',
      complete:'เจอแล้ว! ขอบคุณมากนะ สะพานจะได้สร้างเสร็จสักที',
      done:'สะพานที่สร้างเสร็จ แข็งแรงเพราะไม้ที่เธอหามาให้เลยนะ',
      itemFlag:'specialwoodFound', reward:{coins:45, xp:16} }
  },
  { id:'reusi', name:'ฤๅษีใบไผ่', role:'ผู้เฒ่าแห่งป่า', emoji:'🧙', bodyColor:0x8fe07a, headColor:0xe8e0c8, region:'forest', x:9, z:5,
    lines:{
      stranger:'เจ้าเดินเข้ามาในป่านี้ได้อย่างไร... น่าสนใจนัก',
      acquaintance:'ต้นไม้เก่าแก่ต้นนี้จำได้ทุกฝีเท้าที่เดินผ่านนะ',
      friend:'เจ้ากลับมาอีกแล้วสินะ ป่านี้ชอบเจ้านะ',
      close:'เจ้ามีหัวใจที่ฟังเสียงป่าเป็นนะ',
      helper:'ป่านี้ไว้ใจเจ้าแล้วล่ะ',
      family:'เจ้าเป็นส่วนหนึ่งของป่านี้แล้วสินะ'
    },
    gift:{ name:'ใบไผ่แห้งพิเศษ', icon:'🎋', cost:20 },
    quest:{ id:'atlaspage', title:'เศษหน้ากระดาษเก่า',
      ask:'มีเศษหน้ากระดาษเก่าตกอยู่ใต้ต้นไม้เก่าแก่กลางป่า ช่วยเก็บมาให้ข้าดูหน่อยได้ไหม?',
      remind:'เศษหน้ากระดาษยังไม่เจอเลยนะ ลองไปดูใต้ต้นไม้เก่าแก่สิ',
      complete:'อืม... นี่มันหน้าหนึ่งจาก Atlas of Everbloom เก่าแก่นี่นา น่าสนใจยิ่งนัก',
      done:'เศษกระดาษนั้นยังอยู่กับข้านะ ขอบใจเจ้าจริง ๆ',
      itemFlag:'atlasPageFound', reward:{coins:45, xp:16} }
  },
  { id:'lungkla', name:'ลุงกล้า', role:'ชาวไร่ฟักทอง', emoji:'🎃', bodyColor:0xff9d3d, headColor:0xfff2df, region:'hollow', x:14, z:-4,
    lines:{
      stranger:'สวัสดี! มาดูไร่ฟักทองของลุงเหรอ',
      acquaintance:'ปีนี้ฟักทองไม่ค่อยยอมโตเลยนะ กำลังปวดหัวอยู่',
      friend:'เธอมาอีกแล้ว! มาช่วยดูไร่กันหน่อยไหม',
      close:'เธอนี่เหมือนลูกหลานลุงเองเลยนะ',
      helper:'ไร่นี้ปลอดภัยเพราะมีเธอช่วยดูแลนะ',
      family:'หุบเขานี้อบอุ่นขึ้นเพราะเธอนะ'
    },
    gift:{ name:'เมล็ดพันธุ์แปลกใหม่', icon:'🌱', cost:20 },
    quest:{ id:'soilsample', title:'ตัวอย่างดินในไร่',
      ask:'ลุงอยากตรวจดินในไร่ว่าทำไมฟักทองไม่ยอมโต ช่วยเก็บตัวอย่างดินมาให้หน่อยได้ไหม?',
      remind:'ยังไม่ได้ตัวอย่างดินเลยนะ ลองเดินสำรวจแถวไร่ดูสิ',
      complete:'ขอบคุณนะ! ได้ตัวอย่างดินแล้ว คราวนี้ฟักทองต้องโตแน่ ๆ',
      done:'ฟักทองปีนี้โตงามเพราะเธอช่วยไว้เลยนะ',
      itemFlag:'soilSampleFound', reward:{coins:45, xp:16} }
  },
  { id:'dekying', name:'เด็กหญิงเกสร', role:'นักปลูกดอกไม้ตัวน้อย', emoji:'🌼', bodyColor:0xff9ec4, headColor:0xfff2df, region:'hollow', x:-4, z:12,
    lines:{
      stranger:'สวัสดี! หนูกำลังปลูกดอกไม้อยู่นะ',
      acquaintance:'สวนดอกไม้ของหนูยังไม่ครบทุกสีเลย',
      friend:'มาช่วยดูสวนหนูอีกแล้ว! ดีใจจัง',
      close:'พี่เป็นเพื่อนที่ดีที่สุดของหนูเลยนะ',
      helper:'สวนของหนูสวยเพราะพี่ช่วยเลยนะ',
      family:'พี่เป็นเหมือนพี่แท้ ๆ ของหนูเลย!'
    },
    gift:{ name:'เมล็ดดอกไม้สีแปลก', icon:'🌸', cost:20 },
    quest:{ id:'blueflower', title:'ดอกไม้สีน้ำเงินหายาก',
      ask:'หนูอยากได้ดอกไม้สีน้ำเงินมาปลูกในสวนให้ครบทุกสี ช่วยหาให้หนูหน่อยได้ไหมคะ?',
      remind:'ดอกไม้สีน้ำเงินยังหาไม่เจอเลยค่ะ ลองเดินสำรวจดูสิ',
      complete:'เจอแล้ว! ขอบคุณมากเลยค่ะ สวนของหนูใกล้ครบทุกสีแล้ว',
      done:'ดอกไม้สีน้ำเงินที่พี่หามาให้ ยังบานสวยอยู่ในสวนเลยนะคะ',
      itemFlag:'blueFlowerFound', reward:{coins:45, xp:16} }
  }
);

/* ============================= NEW SECRETS (Act 1) ============================= */
worldItemDefs.push(
  { id:'sailcloth', emoji:'⛵', x:15, z:-3, color:0xd9e8f5, flagKey:'sailclothFound', region:'harbor' },
  { id:'recipe', emoji:'📜', x:-11, z:9, color:0xf5d98a, flagKey:'recipeFound', region:'harbor' },
  { id:'pearl', emoji:'🦪', x:22, z:15, color:0xf5f0e0, flagKey:'pearlFound', secret:true, coins:60, xp:15, region:'harbor' },
  { id:'specialwood', emoji:'🪵', x:14, z:-8, color:0xc79a5a, flagKey:'specialwoodFound', region:'forest' },
  { id:'atlaspage', emoji:'📄', x:10, z:7, color:0xffe08a, flagKey:'atlasPageFound', region:'forest' },
  { id:'goldsquirrel', emoji:'🐿️', x:-18, z:8, color:0xffcf6a, flagKey:'goldSquirrelFound', secret:true, coins:60, xp:15, region:'forest' },
  { id:'soilsample', emoji:'🧪', x:17, z:-2, color:0x8a6a48, flagKey:'soilSampleFound', region:'hollow' },
  { id:'blueflower', emoji:'💠', x:-6, z:8, color:0x6fb8e0, flagKey:'blueFlowerFound', region:'hollow' },
  { id:'goldenegg', emoji:'🥚', x:-16, z:-12, color:0xffd166, flagKey:'goldenEggFound', secret:true, coins:60, xp:15, region:'hollow' }
);

/* ============================= BUILD ALL NPC & ITEM MESHES =============================
   Runs here, after every region's NPCs/items (Sunmeadow's originals plus all
   the pushes above) exist, so every def has a home group to be added to. */
NPC_DEFS.forEach(def=>{ npcMeshes[def.id] = buildNpcMesh(def); });
worldItemDefs.forEach(def=>{ worldItemMeshes[def.id] = buildWorldItem(def); });
