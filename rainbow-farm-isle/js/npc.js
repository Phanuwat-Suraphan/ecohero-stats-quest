/* ============================= FRIENDSHIP SYSTEM ============================= */
const FRIEND_TIERS = [
  { id:'stranger', name:'คนแปลกหน้า', min:0 },
  { id:'acquaintance', name:'คนรู้จัก', min:10 },
  { id:'friend', name:'เพื่อน', min:30 },
  { id:'close', name:'เพื่อนสนิท', min:60 },
  { id:'helper', name:'ผู้ช่วย', min:100 },
  { id:'family', name:'ครอบครัวหมู่บ้าน', min:150 }
];
function tierForPoints(pts){
  let cur = FRIEND_TIERS[0];
  for(const t of FRIEND_TIERS){ if(pts >= t.min) cur = t; }
  return cur;
}
function tierIndex(id){ return FRIEND_TIERS.findIndex(t=>t.id===id); }
function getFriendData(){
  try{ const raw = JSON.parse(localStorage.getItem('rfi_friends')); if(raw && typeof raw === 'object') return raw; } catch(e){}
  return {};
}
function saveFriendData(d){ localStorage.setItem('rfi_friends', JSON.stringify(d)); }
function getNpcFriend(npcId){
  const d = getFriendData();
  return d[npcId] || { points:0, talked:false, questDone:false, giftsGiven:0 };
}
function checkTierUnlockAchievements(beforeId, afterId){
  if(beforeId === afterId) return;
  const afterIdx = tierIndex(afterId);
  if(afterIdx >= tierIndex('friend')) unlockAchievement('first_friend');
  if(afterIdx >= tierIndex('family')) unlockAchievement('family_tier');
}

/* ============================= WORLD FLAGS (quest items / secrets) ============================= */
function getWorldFlags(){
  try{ const raw = JSON.parse(localStorage.getItem('rfi_world_flags')); if(raw) return raw; } catch(e){}
  return {};
}
function saveWorldFlags(f){ localStorage.setItem('rfi_world_flags', JSON.stringify(f)); }
function isFlagSet(key){ return !!getWorldFlags()[key]; }
function setFlag(key){ const f = getWorldFlags(); f[key] = true; saveWorldFlags(f); }

/* ============================= NPCS ============================= */
const NPC_DEFS = [
  { id:'panwan', name:'ป้าหวาน', role:'แม่หมู่บ้าน', emoji:'👩‍🍳', bodyColor:0xffab52, headColor:0xfff2df, region:'sunmeadow', x:11, z:-22,
    lines:{
      stranger:'สวัสดีจ้ะ! ไม่เคยเห็นหน้ามาก่อนเลยนะ มาเที่ยวเกาะเหรอ?',
      acquaintance:'วันนี้ขนมเพิ่งออกจากเตาเลยนะ อยากชิมไหม?',
      friend:'เธอกลับมาอีกแล้ว! ป้าดีใจจังเลยจ้ะ',
      close:'ป้าถือว่าเธอเป็นเหมือนครอบครัวคนหนึ่งแล้วนะ',
      helper:'มีเธอช่วยเหลือแบบนี้ ป้าอุ่นใจขึ้นเยอะเลยจ้ะ',
      family:'เกาะนี้อบอุ่นขึ้นเพราะมีเธอนะ ขอบคุณจริง ๆ จ้ะ'
    },
    gift:{ name:'ดอกลาเวนเดอร์', icon:'💜', cost:20 },
    quest:{ id:'balloon', title:'ลูกโป่งของหลานสาว',
      ask:'ลูกโป่งเทศกาลของหลานสาวป้าลอยติดกิ่งไม้สูงอยู่แถวสวนน่ะจ้ะ ช่วยตามหาให้หน่อยได้ไหม?',
      remind:'ลูกโป่งของหลานสาวยังหาไม่เจอเลยจ้ะ ลองเดินสำรวจดูใกล้ ๆ ต้นไม้สิ',
      complete:'เจอแล้วจริง ๆ ด้วย! ขอบคุณนะจ๊ะ หลานสาวจะดีใจมากเลย 🎈',
      done:'หลานสาวยังพูดถึงลูกโป่งใบนั้นอยู่เลยนะ ขอบคุณอีกครั้งจ้ะ',
      itemFlag:'balloonFound', reward:{coins:40, xp:15} }
  },
  { id:'yaibua', name:'คุณยายบัว', role:'คนสวนดอกไม้', emoji:'👵', bodyColor:0x8fe07a, headColor:0xfff2df, region:'sunmeadow', x:-19, z:17,
    lines:{
      stranger:'อ้าว มีคนมาเยี่ยมสวนยายด้วยเหรอจ๊ะ',
      acquaintance:'ดอกไม้พวกนี้ยายปลูกเองกับมือเลยนะ',
      friend:'มาเยี่ยมสวนยายอีกแล้วเหรอ ยายดีใจนะ',
      close:'หลาน ๆ ของยายก็น่ารักแบบเธอนี่แหละ',
      helper:'ยายไว้ใจเธอเรื่องสวนได้เต็มที่เลยนะ',
      family:'สวนนี้สวยขึ้นเพราะมีเธอมาเยี่ยมบ่อย ๆ จ้ะ'
    },
    gift:{ name:'เมล็ดพันธุ์แปลก', icon:'🌰', cost:20 },
    quest:{ id:'glasses', title:'แว่นสายตาที่หายไป',
      ask:'แว่นสายตาของยายหายไปในสวนตั้งแต่ฤดูก่อนเลยจ้ะ ช่วยหาให้หน่อยได้ไหม?',
      remind:'แว่นของยายยังไม่เจอเลยจ้ะ อยู่แถวพุ่มไม้ในสวนแหละ',
      complete:'เจอแล้ว! ตาดีจริง ๆ นะจ๊ะ ขอบคุณมากเลย',
      done:'ตอนนี้ยายมองเห็นดอกไม้ชัดเจนขึ้นเยอะเลย ต้องขอบคุณเธอนะ',
      itemFlag:'glassesFound', reward:{coins:40, xp:15} }
  },
  { id:'lungtai', name:'ลุงไถ', role:'หัวหน้าหมู่บ้าน', emoji:'👨‍🌾', bodyColor:0xffd166, headColor:0xfff8ea, region:'sunmeadow', x:1, z:-16,
    lines:{
      stranger:'สวัสดี! ยินดีต้อนรับสู่เกาะของเรานะ',
      acquaintance:'เป็นยังไงบ้าง คุ้นเคยกับเกาะแล้วหรือยัง?',
      friend:'เจ้าตัวน้อย! วันนี้เกาะดูมีชีวิตชีวาขึ้นเพราะเธอเลยนะ',
      close:'ลุงภูมิใจในตัวเธอมากเลยนะ',
      helper:'เกาะนี้โชคดีที่มีเธอมาช่วยดูแลจริง ๆ',
      family:'เธอคือส่วนหนึ่งของหมู่บ้านนี้แล้วนะ'
    },
    gift:{ name:'ผลไม้แปลกใหม่', icon:'🍉', cost:20 },
    quest:{ id:'harvest_all', title:'เทศกาลต้อนรับนักสำรวจ',
      ask:'ลุงอยากจัด "เทศกาลต้อนรับนักสำรวจ" น่ะ ช่วยปลดล็อกเมล็ดพันธุ์ให้ครบทุกชนิดในร้านค้าหน่อยได้ไหม?',
      remind:'ยังปลดล็อกเมล็ดพันธุ์ไม่ครบเลยนะ ลองแวะร้านค้าดูสิ',
      complete:'ครบทุกชนิดแล้ว! เทศกาลปีนี้ต้องยิ่งใหญ่แน่ ๆ ขอบคุณนะ',
      done:'เทศกาลต้อนรับนักสำรวจปีนี้สนุกเพราะเธอเลยนะ',
      checkFn:'allSeedsUnlocked', reward:{coins:60, xp:25} }
  }
];
function isQuestReady(def){
  const q = def.quest;
  if(getNpcFriend(def.id).questDone) return false;
  if(q.itemFlag) return isFlagSet(q.itemFlag);
  if(q.checkFn === 'allSeedsUnlocked') return CROP_TYPES.every(c=>farmState.unlockedSeeds.includes(c.id));
  return false;
}
const npcMeshes = {};
function buildNpcMesh(def){
  const g = new THREE.Group();
  const bMat = new THREE.MeshStandardMaterial({color:def.bodyColor, roughness:0.6});
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,0.9), bMat);
  b.position.y = 0.95;
  const hMat = new THREE.MeshStandardMaterial({color:def.headColor, roughness:0.6});
  const h = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.0,1.05), hMat);
  h.position.y = 2.05;
  const legMat = new THREE.MeshStandardMaterial({color:0x6b5738, roughness:0.7});
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.5,0.38), legMat); legL.position.set(-0.35,0.25,0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.5,0.38), legMat); legR.position.set(0.35,0.25,0);
  g.add(addOutline(b,1.12), addOutline(h,1.1), addOutline(legL,1.15), addOutline(legR,1.15));
  g.add(b, h, legL, legR);
  addCuteFace(g, 0, 2.1, 0.56, 0.85, 0.3);
  g.position.set(def.x, 0, def.z);
  g.userData.idlePhase = Math.random()*Math.PI*2;
  regionGroupFor(def.region).add(g);
  return g;
}
// NPC_DEFS may still be extended (regions.js appends more entries) before meshes are
// built — the actual build loop runs at the end of regions.js once every def exists.

/* ============================= SECRETS: WORLD ITEMS ============================= */
const worldItemDefs = [
  { id:'balloon', emoji:'🎈', x:-25, z:-16, color:0xff9ec4, flagKey:'balloonFound', region:'sunmeadow' },
  { id:'glasses', emoji:'👓', x:-16, z:21, color:0x6fb8e0, flagKey:'glassesFound', region:'sunmeadow' },
  { id:'chest', emoji:'🎁', x:22, z:18, color:0xffd166, flagKey:'chestFound', secret:true, coins:80, xp:20, region:'sunmeadow' }
];
const worldItemMeshes = {};
function buildWorldItem(def){
  const g = new THREE.Group();
  const glow = new THREE.PointLight(def.color, 1.1, 6);
  glow.position.y = 1.6;
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.32,10,8), new THREE.MeshStandardMaterial({color:def.color, emissive:def.color, emissiveIntensity:0.45, roughness:0.4}));
  core.position.y = 1.6;
  g.add(glow, core);
  g.position.set(def.x, 0, def.z);
  g.userData.bobPhase = Math.random()*Math.PI*2;
  regionGroupFor(def.region).add(g);
  return g;
}
// same deal: worldItemDefs may still grow before regions.js's build loop runs
function refreshWorldItemVisibility(){
  worldItemDefs.forEach(def=>{
    const mesh = worldItemMeshes[def.id];
    if(mesh) mesh.visible = !isFlagSet(def.flagKey);
  });
}
function collectWorldItem(id){
  const def = worldItemDefs.find(w=>w.id===id);
  if(!def || isFlagSet(def.flagKey)) return;
  setFlag(def.flagKey);
  const mesh = worldItemMeshes[id];
  if(mesh) mesh.visible = false;
  SFX.pickup();
  if(def.coins) addCoins(def.coins);
  if(def.xp) addXp(def.xp);
  if(def.secret){
    unlockAchievement('first_secret');
    const allSecrets = worldItemDefs.filter(w=>w.secret);
    if(allSecrets.length && allSecrets.every(w=>isFlagSet(w.flagKey))) unlockAchievement('secret_hunter');
    toastFarm(`✨ พบความลับ! ${def.emoji} (+${def.coins} เหรียญ)`, 'ok');
  } else {
    const owner = NPC_DEFS.find(n=>n.quest && n.quest.itemFlag===def.flagKey);
    toastFarm(`${def.emoji} เก็บของได้แล้ว! กลับไปคุยกับ${owner ? owner.name : 'เจ้าของ'}สิ`, 'ok');
  }
  saveFarmState(); renderHud();
  nearbyTarget = null; renderProximityPrompt();
}

/* ============================= PROXIMITY / DIALOGUE ============================= */
const PROXIMITY_RADIUS = 4.4;
let nearbyTarget = null;
function checkProximity(){
  let best = null, bestDist = PROXIMITY_RADIUS;
  NPC_DEFS.forEach(def=>{
    if(def.region !== state.activeRegion) return;
    const d = Math.hypot(player.position.x-def.x, player.position.z-def.z);
    if(d < bestDist){ bestDist = d; best = {type:'npc', id:def.id}; }
  });
  worldItemDefs.forEach(def=>{
    if(def.region !== state.activeRegion) return;
    if(isFlagSet(def.flagKey)) return;
    const d = Math.hypot(player.position.x-def.x, player.position.z-def.z);
    if(d < bestDist){ bestDist = d; best = {type:'item', id:def.id}; }
  });
  (typeof travelPointDefs !== 'undefined' ? travelPointDefs : []).forEach(def=>{
    if(def.region !== state.activeRegion) return;
    const d = Math.hypot(player.position.x-def.x, player.position.z-def.z);
    if(d < bestDist){ bestDist = d; best = {type:'travel', id:def.id}; }
  });
  (typeof activityPointDefs !== 'undefined' ? activityPointDefs : []).forEach(def=>{
    if(def.region !== state.activeRegion) return;
    const d = Math.hypot(player.position.x-def.x, player.position.z-def.z);
    if(d < bestDist){ bestDist = d; best = {type:'activity', id:def.id}; }
  });
  const changed = JSON.stringify(best) !== JSON.stringify(nearbyTarget);
  nearbyTarget = best;
  if(changed) renderProximityPrompt();
}
function renderProximityPrompt(){
  const el = document.getElementById('proximityPrompt');
  if(!nearbyTarget){ el.classList.remove('show'); el.innerHTML = ''; return; }
  if(nearbyTarget.type === 'npc'){
    const def = NPC_DEFS.find(n=>n.id===nearbyTarget.id);
    el.innerHTML = `<button onclick="openDialogue('${def.id}')">💬 คุยกับ${def.name}</button>`;
  } else if(nearbyTarget.type === 'item'){
    const def = worldItemDefs.find(w=>w.id===nearbyTarget.id);
    el.innerHTML = `<button onclick="collectWorldItem('${def.id}')">${def.emoji} เก็บ</button>`;
  } else if(nearbyTarget.type === 'travel'){
    const def = travelPointDefs.find(t=>t.id===nearbyTarget.id);
    el.innerHTML = `<button onclick="travelTo('${def.targetRegion}')">${def.icon} ${def.label}</button>`;
  } else if(nearbyTarget.type === 'activity'){
    const def = activityPointDefs.find(a=>a.id===nearbyTarget.id);
    el.innerHTML = `<button onclick="${def.onInteract}()">${def.icon} ${def.label}</button>`;
  }
  el.classList.add('show');
}
let currentDialogueNpc = null;
function openDialogue(npcId){
  currentDialogueNpc = npcId;
  const def = NPC_DEFS.find(n=>n.id===npcId);
  const d = getFriendData();
  const cur = d[npcId] || { points:0, talked:false, questDone:false, giftsGiven:0 };
  const beforeTierId = tierForPoints(cur.points).id;
  cur.points += 2; cur.talked = true;
  d[npcId] = cur;
  saveFriendData(d);
  checkTierUnlockAchievements(beforeTierId, tierForPoints(cur.points).id);
  SFX.talk();
  document.getElementById('dialoguePortrait').textContent = def.emoji;
  document.getElementById('dialoguePortrait').style.background = hexToCss(def.bodyColor);
  document.getElementById('dialogueName').textContent = def.name;
  document.getElementById('dialogueRole').textContent = def.role;
  renderDialogueBody();
  show('dialogueScreen');
  nearbyTarget = null; renderProximityPrompt();
}
function renderDialogueBody(){
  const def = NPC_DEFS.find(n=>n.id===currentDialogueNpc);
  const friend = getNpcFriend(currentDialogueNpc);
  const tier = tierForPoints(friend.points);
  document.getElementById('dialogueTier').textContent = tier.name;
  const nextTier = FRIEND_TIERS[tierIndex(tier.id)+1];
  const pct = nextTier ? Math.min(100, (friend.points-tier.min)/(nextTier.min-tier.min)*100) : 100;
  document.getElementById('dialogueBar').style.width = pct + '%';
  document.getElementById('dialogueText').textContent = def.lines[tier.id] || def.lines.stranger;

  const q = def.quest;
  const questBox = document.getElementById('dialogueQuestBox');
  questBox.style.display = 'block';
  if(friend.questDone){
    questBox.className = 'questBox done';
    questBox.textContent = '✔ ' + q.done;
  } else {
    questBox.className = 'questBox';
    questBox.textContent = friend.talked ? q.remind : q.ask;
  }

  const actions = document.getElementById('dialogueActions');
  actions.innerHTML = '';
  if(!friend.questDone && isQuestReady(def)){
    const btn = document.createElement('button');
    btn.className = 'mainBtn';
    btn.textContent = '✔ ส่งมอบภารกิจ';
    btn.onclick = ()=>completeQuest(def.id);
    actions.appendChild(btn);
  }
  const giftBtn = document.createElement('button');
  giftBtn.className = 'mainBtn orange';
  giftBtn.textContent = `${def.gift.icon} ให้ของขวัญ (🪙${def.gift.cost})`;
  giftBtn.disabled = farmState.coins < def.gift.cost;
  giftBtn.onclick = ()=>giveGift(def.id);
  actions.appendChild(giftBtn);
}
function completeQuest(npcId){
  const def = NPC_DEFS.find(n=>n.id===npcId);
  const d = getFriendData();
  const cur = d[npcId] || { points:0, talked:true, questDone:false, giftsGiven:0 };
  if(cur.questDone) return;
  const beforeTierId = tierForPoints(cur.points).id;
  cur.questDone = true;
  cur.points += 40;
  d[npcId] = cur;
  saveFriendData(d);
  addCoins(def.quest.reward.coins);
  addXp(def.quest.reward.xp);
  SFX.unlock();
  toastFarm(`✔ ${def.quest.title} สำเร็จ! 🪙+${def.quest.reward.coins}`, 'ok');
  checkTierUnlockAchievements(beforeTierId, tierForPoints(cur.points).id);
  saveFarmState(); renderHud();
  if(currentDialogueNpc === npcId) renderDialogueBody();
}
function giveGift(npcId){
  const def = NPC_DEFS.find(n=>n.id===npcId);
  if(farmState.coins < def.gift.cost){ toastFarm('เหรียญไม่พอ', 'bad'); SFX.bad(); return; }
  farmState.coins -= def.gift.cost;
  const d = getFriendData();
  const cur = d[npcId] || { points:0, talked:true, questDone:false, giftsGiven:0 };
  const beforeTierId = tierForPoints(cur.points).id;
  cur.points += 25;
  cur.giftsGiven = (cur.giftsGiven||0) + 1;
  d[npcId] = cur;
  saveFriendData(d);
  SFX.equip();
  toastFarm(`${def.gift.icon} มอบ ${def.gift.name} ให้ ${def.name} แล้ว!`, 'ok');
  checkTierUnlockAchievements(beforeTierId, tierForPoints(cur.points).id);
  saveFarmState(); renderHud();
  if(currentDialogueNpc === npcId) renderDialogueBody();
}
function closeDialogue(){ hide('dialogueScreen'); currentDialogueNpc = null; }

/* ============================= FRIENDSHIP HUB ============================= */
function openFriends(){ SFX.click(); renderFriendList(); show('friendsScreen'); }
function renderFriendList(){
  const wrap = document.getElementById('friendList');
  wrap.innerHTML = '';
  NPC_DEFS.forEach(def=>{
    const friend = getNpcFriend(def.id);
    const tier = tierForPoints(friend.points);
    const nextTier = FRIEND_TIERS[tierIndex(tier.id)+1];
    const pct = nextTier ? Math.min(100, (friend.points-tier.min)/(nextTier.min-tier.min)*100) : 100;
    const card = document.createElement('div');
    card.className = 'friendCard';
    card.innerHTML = `
      <div class="friendTop">
        <div class="friendEmoji" style="background:${hexToCss(def.bodyColor)};">${def.emoji}</div>
        <div style="flex:1;">
          <div class="friendName">${def.name}</div>
          <div class="friendTier">${tier.name}${nextTier ? ` · อีก ${nextTier.min-friend.points} คะแนนถึง ${nextTier.name}` : ' · ระดับสูงสุดแล้ว'}</div>
        </div>
      </div>
      <div class="friendBarTrack"><div class="friendBarFill" style="width:${pct}%;"></div></div>
    `;
    wrap.appendChild(card);
  });
}
