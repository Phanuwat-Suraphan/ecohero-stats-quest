/* ============================= STATE ============================= */
const state = {
  gameStarted:false, domeZoom: 38, domeZoomMin: 20, domeZoomMax: 62, selectedSeedType:null,
  keys:{}, playerAngle:0, joyDX:0, joyDY:0, activeNpcId:null
};
let isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ============================= WALKING INPUT =============================
   WASD/arrow keys on desktop. On touch, a small FIXED-position joystick pad
   (not a full-screen drag layer) so it never steals taps meant for the seed
   tray, plot tap-to-harvest, or pinch-zoom, which all still live on the
   canvas/chips exactly as before. */
window.addEventListener('keydown', e=>{ state.keys[e.key.toLowerCase()]=true; });
window.addEventListener('keyup', e=>{ state.keys[e.key.toLowerCase()]=false; });

const JOY_MAX_RADIUS = 42;
const JOY_DEADZONE = 8;
let joyActive = false, joyOriginX = 0, joyOriginY = 0;
function resetJoyKeys(){ state.joyDX = 0; state.joyDY = 0; }
function updateJoyKeys(dx, dy){
  if(Math.hypot(dx,dy) < JOY_DEADZONE){ resetJoyKeys(); return; }
  state.joyDX = Math.max(-1, Math.min(1, dx / JOY_MAX_RADIUS));
  state.joyDY = Math.max(-1, Math.min(1, dy / JOY_MAX_RADIUS));
}
function joyShouldActivate(){ return state.gameStarted && !dialogueOpen(); }
function initJoystick(){
  const base = document.getElementById('joystickBase');
  const knob = document.getElementById('joystickKnob');
  const start = (clientX, clientY)=>{
    if(!joyShouldActivate()) return;
    joyActive = true; joyOriginX = clientX; joyOriginY = clientY;
  };
  const move = (clientX, clientY)=>{
    if(!joyActive) return;
    let dx = clientX - joyOriginX, dy = clientY - joyOriginY;
    const dist = Math.hypot(dx,dy);
    if(dist > JOY_MAX_RADIUS){ dx = dx/dist*JOY_MAX_RADIUS; dy = dy/dist*JOY_MAX_RADIUS; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    updateJoyKeys(dx, dy);
  };
  const end = ()=>{ joyActive = false; resetJoyKeys(); knob.style.transform = 'translate(0,0)'; };
  base.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.changedTouches[0]; start(t.clientX,t.clientY); }, {passive:false});
  base.addEventListener('touchmove', e=>{ e.preventDefault(); const t=e.changedTouches[0]; move(t.clientX,t.clientY); }, {passive:false});
  base.addEventListener('touchend', end);
  base.addEventListener('touchcancel', end);
  base.addEventListener('mousedown', e=>{ start(e.clientX,e.clientY); });
  window.addEventListener('mousemove', e=>{ if(joyActive) move(e.clientX,e.clientY); });
  window.addEventListener('mouseup', end);
}

/* ============================= SOUND SYSTEM =============================
   Fully procedural (Web Audio oscillators) — no external audio files, so it
   never depends on network access and works identically everywhere. */
const SFX = (function(){
  let ctx = null;
  let muted = localStorage.getItem('rfi_muted') === '1';
  function getCtx(){
    if(!ctx){ const AC = window.AudioContext || window.webkitAudioContext; ctx = AC ? new AC() : null; }
    return ctx;
  }
  function beep({freq=440, duration=0.15, type='sine', gain=0.18, slideTo=null, delay=0}){
    if(muted) return;
    const c = getCtx();
    if(!c) return;
    if(c.state === 'suspended') c.resume();
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if(slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo), t0+duration);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+duration);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0+duration+0.05);
  }
  function chord(freqs, opts){ freqs.forEach((f,i)=>beep(Object.assign({}, opts, { freq:f, delay:(opts.delay||0)+i*0.014 }))); }
  return {
    ensureStarted(){ const c = getCtx(); if(c && c.state === 'suspended') c.resume(); },
    click(){ beep({freq:520, duration:0.05, type:'square', gain:0.09}); },
    plant(){ beep({freq:440, slideTo:660, duration:0.16, type:'sine', gain:0.14}); },
    harvest(){ chord([523.25,659.25,987.77], {duration:0.18, type:'triangle', gain:0.16}); },
    coin(){ beep({freq:880, slideTo:1320, duration:0.12, type:'square', gain:0.1}); },
    buy(){ chord([392,523.25], {duration:0.13, type:'square', gain:0.12}); },
    equip(){ chord([523.25,659.25], {duration:0.14, type:'sine', gain:0.13}); },
    levelup(){ chord([523.25,659.25,783.99,1046.5], {duration:0.3, type:'triangle', gain:0.17}); },
    unlock(){ chord([659.25,987.77,1318.5], {duration:0.28, type:'sine', gain:0.15}); },
    bad(){ beep({freq:220, slideTo:140, duration:0.2, type:'sawtooth', gain:0.13}); },
    pickup(){ beep({freq:660, slideTo:1100, duration:0.2, type:'sine', gain:0.16}); },
    talk(){ beep({freq:480, duration:0.06, type:'sine', gain:0.08}); },
    isMuted(){ return muted; },
    setMuted(v){ muted = v; localStorage.setItem('rfi_muted', v ? '1' : '0'); }
  };
})();
function toggleMute(){
  SFX.ensureStarted();
  SFX.setMuted(!SFX.isMuted());
  updateMuteButtons();
  if(!SFX.isMuted()) SFX.click();
}
function updateMuteButtons(){
  const icon = SFX.isMuted() ? '🔇' : '🔊';
  const a = document.getElementById('muteBtnFarm'); if(a) a.textContent = icon;
}

/* ============================= DAILY STREAK ============================= */
function todayStr(d){
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function getStreakData(){
  try{
    const raw = JSON.parse(localStorage.getItem('rfi_streak'));
    if(raw && typeof raw.streak === 'number') return raw;
  } catch(e){}
  return { lastDate:null, streak:0, bestStreak:0, claimedToday:false, totalDays:0 };
}
function saveStreakData(d){ localStorage.setItem('rfi_streak', JSON.stringify(d)); }
function computeStreakOnLoad(){
  const data = getStreakData();
  const today = todayStr();
  if(data.lastDate !== today){
    const y = new Date(); y.setDate(y.getDate()-1);
    data.streak = (data.lastDate === todayStr(y)) ? data.streak + 1 : 1;
    data.bestStreak = Math.max(data.bestStreak||0, data.streak);
    data.lastDate = today;
    data.claimedToday = false;
    data.totalDays = (data.totalDays||0) + 1;
    saveStreakData(data);
  }
  return data;
}
function checkStreakAchievements(data){
  if(data.streak >= 3) unlockAchievement('streak3');
  if(data.streak >= 7) unlockAchievement('streak7');
  if(data.streak >= 14) unlockAchievement('streak14');
}
function renderStreakPanel(){
  const data = getStreakData();
  document.getElementById('streakCount').textContent = data.streak;
  document.getElementById('streakHudNum').textContent = data.streak;
  const btn = document.getElementById('claimStreakBtn');
  if(data.claimedToday){
    btn.disabled = true;
    btn.textContent = '✔ รับแล้ววันนี้';
  } else {
    btn.disabled = false;
    btn.textContent = '🎁 รับรางวัลวันนี้';
  }
}
function claimDailyReward(){
  const data = getStreakData();
  if(data.claimedToday) return;
  SFX.ensureStarted();
  data.claimedToday = true;
  saveStreakData(data);
  SFX.unlock();
  renderStreakPanel();
  const bonus = 30 + data.streak * 10;
  addCoins(bonus);
  saveFarmState();
  const fb = document.getElementById('streakFeedback');
  fb.textContent = `✔ ได้รับเหรียญโบนัสประจำวัน 🪙+${bonus} แล้ว!`;
  fb.className = 'feedback ok';
}

/* ============================= ACHIEVEMENTS ============================= */
const ACHIEVEMENTS = [
  { id:'first_harvest', name:'ชาวไร่มือใหม่', desc:'เก็บเกี่ยวพืชผลครั้งแรก', icon:'🌱' },
  { id:'harvest50', name:'มือเก็บเกี่ยว', desc:'เก็บเกี่ยวพืชผลครบ 50 ต้น', icon:'🧺' },
  { id:'all_crops', name:'นักสะสมเมล็ดพันธุ์', desc:'ปลดล็อกเมล็ดพันธุ์ครบทุกชนิด', icon:'🌾' },
  { id:'level5', name:'ชาวสวนฝีมือดี', desc:'มีเลเวลถึง 5', icon:'⭐' },
  { id:'level10', name:'เจ้าของฟาร์มมากประสบการณ์', desc:'มีเลเวลถึง 10', icon:'🌟' },
  { id:'rich', name:'เศรษฐีน้อย', desc:'สะสมเหรียญให้ได้ 5,000 เหรียญ', icon:'💰' },
  { id:'first_outfit', name:'แต่งตัวสวย', desc:'ซื้อชุดหรือหมวกชิ้นแรก', icon:'👗' },
  { id:'streak3', name:'ขาประจำ 3 วัน', desc:'เข้าเล่นติดต่อกัน 3 วัน', icon:'🔥' },
  { id:'streak7', name:'ขาประจำ 7 วัน', desc:'เข้าเล่นติดต่อกัน 7 วัน', icon:'🔥' },
  { id:'streak14', name:'ขาประจำ 14 วัน', desc:'เข้าเล่นติดต่อกัน 14 วัน', icon:'🔥' },
  { id:'first_friend', name:'เพื่อนคนแรก', desc:'มีความสัมพันธ์ระดับ "เพื่อน" กับชาวเกาะคนใดคนหนึ่ง', icon:'🤝' },
  { id:'family_tier', name:'ครอบครัวหมู่บ้าน', desc:'มีความสัมพันธ์ระดับสูงสุดกับชาวเกาะคนใดคนหนึ่ง', icon:'🏡' },
  { id:'first_secret', name:'นักสำรวจตัวจริง', desc:'ค้นพบความลับแรกของเกาะ', icon:'✨' }
];
function getUnlockedAchievements(){
  try{ const l = JSON.parse(localStorage.getItem('rfi_achievements')); return Array.isArray(l) ? l : []; } catch(e){ return []; }
}
function hasAchievement(id){ return getUnlockedAchievements().includes(id); }
function unlockAchievement(id){
  if(hasAchievement(id)) return;
  const list = getUnlockedAchievements();
  list.push(id);
  localStorage.setItem('rfi_achievements', JSON.stringify(list));
  const meta = ACHIEVEMENTS.find(a=>a.id===id);
  if(meta) showUnlockBanner(meta);
  SFX.unlock();
}
let unlockBannerTimer = null;
function showUnlockBanner(meta){
  const el = document.getElementById('unlockBanner');
  el.innerHTML = `<span style="font-size:22px;">${meta.icon}</span><span>ปลดล็อกความสำเร็จ: ${meta.name}</span>`;
  el.classList.add('show');
  clearTimeout(unlockBannerTimer);
  unlockBannerTimer = setTimeout(()=>el.classList.remove('show'), 3200);
}
function renderAchievements(){
  const wrap = document.getElementById('achList');
  wrap.innerHTML = '';
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = hasAchievement(a.id);
    const card = document.createElement('div');
    card.className = 'achCard' + (unlocked ? '' : ' locked');
    card.innerHTML = `<div class="achIcon">${unlocked ? a.icon : '🔒'}</div><div><div class="achName">${a.name}</div><div class="achDesc">${a.desc}</div></div>`;
    wrap.appendChild(card);
  });
  const count = ACHIEVEMENTS.filter(a=>hasAchievement(a.id)).length;
  document.getElementById('achProgress').textContent = `ปลดล็อกแล้ว ${count}/${ACHIEVEMENTS.length}`;
  const hc = document.getElementById('achHubCount'); if(hc) hc.textContent = count;
  const ht = document.getElementById('achHubTotal'); if(ht) ht.textContent = ACHIEVEMENTS.length;
}
function openAchievements(){ SFX.click(); renderAchievements(); show('achievementsScreen'); }

/* ============================= CROPS ============================= */
const CROP_TYPES = [
  { id:'carrot', name:'แครอท', icon:'🥕', cost:5, sell:14, xp:4, growMs:20000, levelReq:1, color:0xff9d4d },
  { id:'tomato', name:'มะเขือเทศ', icon:'🍅', cost:16, sell:44, xp:10, growMs:60000, levelReq:2, color:0xff5f4d },
  { id:'pumpkin', name:'ฟักทอง', icon:'🎃', cost:42, sell:118, xp:24, growMs:180000, levelReq:4, color:0xffab52 },
  { id:'durian', name:'ทุเรียน', icon:'🥭', cost:120, sell:400, xp:60, growMs:600000, levelReq:7, color:0x8fe07a }
];
function cropById(id){ return CROP_TYPES.find(c=>c.id===id); }

const EXPANSION_TIERS = [
  { count:5,  cost:0,    levelReq:1 },
  { count:14, cost:300,  levelReq:3 },
  { count:27, cost:1200, levelReq:6 },
  { count:43, cost:4000, levelReq:9 }
];

/* ============================= OUTFITS ============================= */
const HAT_ITEMS = [
  { id:'none', name:'ไม่ใส่หมวก', icon:'🚫', cost:0, color:null },
  { id:'straw', name:'หมวกฟาง', icon:'👒', cost:0, color:0xe8c878 },
  { id:'cap', name:'หมวกแก๊ป', icon:'🧢', cost:80, color:0xff9d80 },
  { id:'flower', name:'มงกุฎดอกไม้', icon:'🌸', cost:220, color:0xff9ec4 },
  { id:'crown', name:'มงกุฎทอง', icon:'👑', cost:600, color:0xffd166 }
];
const CLOTHES_ITEMS = [
  { id:'default', name:'ชุดเดิม', icon:'👕', cost:0, body:0x5fd6c8, limb:0x4bc0b3 },
  { id:'overalls', name:'ชุดเอี๊ยม', icon:'🧑‍🌾', cost:100, body:0x6fa8e0, limb:0x5088c0 },
  { id:'sundress', name:'ชุดเดรส', icon:'👗', cost:250, body:0xff9ec4, limb:0xef7fa8 },
  { id:'royal', name:'ชุดราชวงศ์', icon:'🥻', cost:700, body:0xb08cf0, limb:0x9070d6 }
];
let outfitTab = 'hat';
function getOwnedOutfits(){
  try{
    const raw = JSON.parse(localStorage.getItem('rfi_outfits'));
    if(raw && Array.isArray(raw.owned)) return raw;
  } catch(e){}
  return { owned:['none','default'], equippedHat:'none', equippedClothes:'default' };
}
function saveOutfits(o){ localStorage.setItem('rfi_outfits', JSON.stringify(o)); }
function hexToCss(hex){ return '#' + hex.toString(16).padStart(6,'0'); }
function switchOutfitTab(tab){
  outfitTab = tab;
  document.getElementById('tabHat').classList.toggle('active', tab==='hat');
  document.getElementById('tabClothes').classList.toggle('active', tab==='clothes');
  SFX.click();
  renderOutfitGrid();
}
function renderOutfitGrid(){
  const wrap = document.getElementById('outfitGrid');
  wrap.innerHTML = '';
  const list = outfitTab === 'hat' ? HAT_ITEMS : CLOTHES_ITEMS;
  const o = getOwnedOutfits();
  const equippedId = outfitTab === 'hat' ? o.equippedHat : o.equippedClothes;
  list.forEach(item=>{
    const owned = o.owned.includes(item.id);
    const card = document.createElement('div');
    card.className = 'itemCard' + (equippedId===item.id ? ' active' : '');
    card.innerHTML = `<div class="itemSwatch">${item.icon}</div><div class="itemName">${item.name}</div>` +
      (owned ? `<div class="itemOwned">${equippedId===item.id ? '✔ สวมอยู่' : 'มีแล้ว'}</div>` : `<div class="itemCost">🪙 ${item.cost}</div>`);
    card.addEventListener('click', ()=>{
      const fb = document.getElementById('outfitFeedback');
      const fresh = getOwnedOutfits();
      if(!fresh.owned.includes(item.id)){
        if(farmState.coins < item.cost){ fb.textContent = '✘ เหรียญไม่พอ'; fb.className = 'feedback bad'; SFX.bad(); return; }
        farmState.coins -= item.cost;
        fresh.owned.push(item.id);
        saveFarmState();
        SFX.buy();
        unlockAchievement('first_outfit');
        fb.textContent = `✔ ซื้อ ${item.name} แล้ว!`;
        fb.className = 'feedback ok';
      } else {
        SFX.equip();
        fb.textContent = `✔ สวม ${item.name} แล้ว`;
        fb.className = 'feedback ok';
      }
      if(outfitTab === 'hat') fresh.equippedHat = item.id; else fresh.equippedClothes = item.id;
      saveOutfits(fresh);
      applyOutfits();
      renderOutfitGrid();
      renderHud();
    });
    wrap.appendChild(card);
  });
}
function openOutfits(){ SFX.click(); switchOutfitTab('hat'); show('outfitScreen'); }
// applyOutfits() is defined after the player mascot materials/meshes are created below

/* ============================= FARM STATE (persisted) ============================= */
const farmState = {
  coins: 60,
  level: 1,
  xp: 0,
  expansionTier: 0,
  unlockedSeeds: ['carrot'],
  plots: [] // {cropId, plantedAt} | null, indexed same order plots[] is built in
};
function xpToNext(level){ return 40 + level*22; }
function loadFarmState(){
  try{
    const raw = JSON.parse(localStorage.getItem('rfi_farm'));
    if(raw && typeof raw.coins === 'number'){
      Object.assign(farmState, raw);
    }
  } catch(e){}
}
function saveFarmState(){
  localStorage.setItem('rfi_farm', JSON.stringify({
    coins: farmState.coins, level: farmState.level, xp: farmState.xp,
    expansionTier: farmState.expansionTier, unlockedSeeds: farmState.unlockedSeeds,
    plots: plots.map(p => p.cropId ? { cropId:p.cropId, plantedAt:p.plantedAt } : null)
  }));
}
function addCoins(n){
  farmState.coins += n;
  if(farmState.coins >= 5000) unlockAchievement('rich');
}
function addXp(n){
  farmState.xp += n;
  let leveled = false;
  while(farmState.xp >= xpToNext(farmState.level)){
    farmState.xp -= xpToNext(farmState.level);
    farmState.level++;
    leveled = true;
  }
  if(leveled){
    SFX.levelup();
    showLevelUpBanner();
    if(farmState.level >= 5) unlockAchievement('level5');
    if(farmState.level >= 10) unlockAchievement('level10');
  }
}
let levelUpTimer = null;
function showLevelUpBanner(){
  const el = document.getElementById('levelUpBanner');
  el.innerHTML = `🎉 เลเวลอัป! ตอนนี้เลเวล ${farmState.level} แล้ว`;
  el.classList.add('show');
  clearTimeout(levelUpTimer);
  levelUpTimer = setTimeout(()=>el.classList.remove('show'), 2800);
}
function renderHud(){
  document.getElementById('coinNum').textContent = Math.floor(farmState.coins).toLocaleString();
  document.getElementById('levelNum').textContent = farmState.level;
  const need = xpToNext(farmState.level);
  document.getElementById('xpText').textContent = `${farmState.xp}/${need}`;
  document.getElementById('xpBarFill').style.width = Math.min(100, (farmState.xp/need)*100) + '%';
}

/* ============================= SHOP ============================= */
function renderShop(){
  const seedWrap = document.getElementById('shopSeedList');
  seedWrap.innerHTML = '';
  CROP_TYPES.forEach(c=>{
    const owned = farmState.unlockedSeeds.includes(c.id);
    const lockedByLevel = farmState.level < c.levelReq;
    const row = document.createElement('div');
    row.className = 'shopRow';
    row.innerHTML = `
      <div class="shopRowInfo">
        <div class="shopRowIcon">${c.icon}</div>
        <div>
          <div class="shopRowName">${c.name}</div>
          <div class="shopRowSub">${owned ? 'ปลดล็อกแล้ว' : (lockedByLevel ? `ต้องเลเวล ${c.levelReq}` : `ปลูก 🪙${c.cost} → ขาย 🪙${c.sell}`)}</div>
        </div>
      </div>
    `;
    const btn = document.createElement('button');
    btn.className = 'shopBuyBtn';
    if(owned){ btn.textContent = '✔ มีแล้ว'; btn.disabled = true; }
    else if(lockedByLevel){ btn.textContent = `Lv.${c.levelReq}`; btn.disabled = true; }
    else {
      const buyCost = c.cost * 10;
      btn.textContent = `ปลดล็อก 🪙${buyCost}`;
      btn.disabled = farmState.coins < buyCost;
      btn.onclick = ()=>{
        const fb = document.getElementById('shopFeedback');
        if(farmState.coins < buyCost){ fb.textContent='✘ เหรียญไม่พอ'; fb.className='feedback bad'; SFX.bad(); return; }
        farmState.coins -= buyCost;
        farmState.unlockedSeeds.push(c.id);
        if(farmState.unlockedSeeds.length >= CROP_TYPES.length) unlockAchievement('all_crops');
        saveFarmState();
        SFX.buy();
        fb.textContent = `✔ ปลดล็อกเมล็ด ${c.name} แล้ว!`;
        fb.className = 'feedback ok';
        renderShop(); renderSeedTray(); renderHud();
      };
    }
    row.appendChild(btn);
    seedWrap.appendChild(row);
  });

  const expWrap = document.getElementById('shopExpandList');
  expWrap.innerHTML = '';
  const nextTier = EXPANSION_TIERS[farmState.expansionTier+1];
  if(!nextTier){
    expWrap.innerHTML = '<div class="shopRowSub" style="padding:6px 2px;">ขยายเกาะครบทุกระดับแล้ว 🎉</div>';
  } else {
    const row = document.createElement('div');
    row.className = 'shopRow';
    const lockedByLevel = farmState.level < nextTier.levelReq;
    row.innerHTML = `
      <div class="shopRowInfo">
        <div class="shopRowIcon">🏝️</div>
        <div>
          <div class="shopRowName">ขยายเกาะ (+${nextTier.count - EXPANSION_TIERS[farmState.expansionTier].count} แปลง)</div>
          <div class="shopRowSub">${lockedByLevel ? `ต้องเลเวล ${nextTier.levelReq}` : `รวมเป็น ${nextTier.count} แปลง`}</div>
        </div>
      </div>
    `;
    const btn = document.createElement('button');
    btn.className = 'shopBuyBtn';
    if(lockedByLevel){ btn.textContent = `Lv.${nextTier.levelReq}`; btn.disabled = true; }
    else {
      btn.textContent = `🪙${nextTier.cost}`;
      btn.disabled = farmState.coins < nextTier.cost;
      btn.onclick = ()=>{
        const fb = document.getElementById('shopFeedback');
        if(farmState.coins < nextTier.cost){ fb.textContent='✘ เหรียญไม่พอ'; fb.className='feedback bad'; SFX.bad(); return; }
        farmState.coins -= nextTier.cost;
        farmState.expansionTier++;
        saveFarmState();
        SFX.buy();
        revealExpansionTier(farmState.expansionTier);
        fb.textContent = '✔ ขยายเกาะสำเร็จ!';
        fb.className = 'feedback ok';
        renderShop(); renderHud();
      };
    }
    row.appendChild(btn);
    expWrap.appendChild(row);
  }
}
function openShop(){ SFX.click(); renderShop(); show('shopScreen'); }

/* ============================= SCREENS ============================= */
function show(id){ document.getElementById(id).classList.add('show'); }
function hide(id){ document.getElementById(id).classList.remove('show'); }

function startGame(){
  SFX.ensureStarted();
  SFX.click();
  hide('startScreen');
  state.gameStarted = true;
  document.getElementById('hudRight').style.pointerEvents = 'auto';
  enterFarm();
}

