/* ============================= FARM PLOTS ============================= */
const plots = []; // {mesh, x, z, tier, cropId, plantedAt, cropMesh}
function makePlotRing(radius, count, angleOffset, tier){
  for(let i=0;i<count;i++){
    const angle = angleOffset + (i/count)*Math.PI*2;
    const x = Math.cos(angle)*radius, z = Math.sin(angle)*radius;
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1,2.3,0.3,14),
      new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.85})
    );
    pad.position.set(x, 0.85, z);
    pad.visible = false;
    islandGroup.add(pad);
    plots.push({ mesh:pad, x, z, tier, cropId:null, plantedAt:null, cropMesh:null });
  }
}
makePlotRing(7, 5, 0, 0);
makePlotRing(14, 9, Math.PI/9, 1);
makePlotRing(21, 13, 0, 2);
makePlotRing(28, 16, Math.PI/16, 3);

const poppingMeshes = [];
const bouncingMeshes = [];
function bounceMesh(mesh){ bouncingMeshes.push({ mesh, elapsed:0 }); }

function revealExpansionTier(tier){
  plots.filter(p=>p.tier===tier).forEach(p=>{
    p.mesh.visible = true;
    p.mesh.scale.setScalar(0.001);
    poppingMeshes.push(p.mesh);
  });
}
// reveal tier 0 immediately (the starting 5 plots), the rest stay hidden until purchased in the shop
plots.filter(p=>p.tier===0).forEach(p=>{ p.mesh.visible = true; });

function createCropMesh(cropId, stage){
  // stage: 0 = just planted (sprout), 1 = growing (small plant), 2 = ready (full-size, glowing)
  const c = cropById(cropId);
  const g = new THREE.Group();
  const s = 0.35 + stage*0.35;
  if(cropId === 'carrot'){
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16*s,0.5*s,6), new THREE.MeshStandardMaterial({color:0x6fce6a}));
    leaf.position.y = 0.3*s;
    g.add(leaf);
    if(stage>=2){
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.4,8), new THREE.MeshStandardMaterial({color:c.color, emissive:c.color, emissiveIntensity:0.25}));
      root.rotation.x = Math.PI; root.position.y = 0.05;
      g.add(root);
    }
  } else if(cropId === 'tomato'){
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,0.5*s,6), new THREE.MeshStandardMaterial({color:0x6fce6a}));
    stalk.position.y = 0.25*s;
    g.add(stalk);
    if(stage>=1){
      const leafBall = new THREE.Mesh(new THREE.SphereGeometry(0.28*s,8,6), new THREE.MeshStandardMaterial({color:0x6fce6a}));
      leafBall.position.y = 0.5*s;
      g.add(leafBall);
    }
    if(stage>=2){
      for(let i=0;i<3;i++){
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6), new THREE.MeshStandardMaterial({color:c.color, emissive:c.color, emissiveIntensity:0.3}));
        fruit.position.set((i-1)*0.2, 0.55, 0.1);
        g.add(fruit);
      }
    }
  } else if(cropId === 'pumpkin'){
    const vine = new THREE.Mesh(new THREE.TorusGeometry(0.3*s,0.04,6,10), new THREE.MeshStandardMaterial({color:0x6fce6a}));
    vine.rotation.x = Math.PI/2; vine.position.y = 0.1;
    g.add(vine);
    if(stage>=2){
      const pump = new THREE.Mesh(new THREE.SphereGeometry(0.45,10,8), new THREE.MeshStandardMaterial({color:c.color, emissive:c.color, emissiveIntensity:0.25}));
      pump.scale.set(1,0.8,1); pump.position.y = 0.4;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.25,6), new THREE.MeshStandardMaterial({color:0x6e4529}));
      stem.position.y = 0.78;
      g.add(pump, stem);
    } else {
      const bud = new THREE.Mesh(new THREE.SphereGeometry(0.16*s,8,6), new THREE.MeshStandardMaterial({color:0x8fe07a}));
      bud.position.y = 0.16;
      g.add(bud);
    }
  } else { // durian
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.13,0.6*s,7), new THREE.MeshStandardMaterial({color:0x8a5a3a}));
    trunk.position.y = 0.3*s;
    g.add(trunk);
    if(stage>=1){
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.35*s,8,6), new THREE.MeshStandardMaterial({color:0x5cc766}));
      leaf.position.y = 0.65*s; leaf.scale.set(1,0.85,1);
      g.add(leaf);
    }
    if(stage>=2){
      const spiky = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32,0), new THREE.MeshStandardMaterial({color:c.color, emissive:c.color, emissiveIntensity:0.2, flatShading:true}));
      spiky.position.set(0.25, 0.55, 0.1);
      g.add(spiky);
    }
  }
  if(stage>=2){
    const glow = new THREE.PointLight(c.color, 0.7, 4);
    glow.position.y = 0.6;
    g.add(glow);
    g.userData.ready = true;
  }
  g.userData.idlePhase = Math.random()*Math.PI*2;
  g.scale.setScalar(0.001);
  return g;
}

function plotGrowthProgress(p){
  if(!p.cropId || !p.plantedAt) return 0;
  const c = cropById(p.cropId);
  return Math.max(0, Math.min(1, (Date.now() - p.plantedAt) / c.growMs));
}
function plotStage(p){
  const prog = plotGrowthProgress(p);
  if(prog >= 1) return 2;
  if(prog >= 0.4) return 1;
  return 0;
}
function refreshPlotMesh(p){
  if(p.cropMesh){ islandGroup.remove(p.cropMesh); p.cropMesh = null; }
  if(!p.cropId) return;
  const stage = plotStage(p);
  const mesh = createCropMesh(p.cropId, stage);
  mesh.position.set(p.x, 1.0, p.z);
  islandGroup.add(mesh);
  p.cropMesh = mesh;
  poppingMeshes.push(mesh);
}
function plantCrop(p, cropId){
  const c = cropById(cropId);
  if(farmState.coins < c.cost){ toastFarm('เหรียญไม่พอสำหรับปลูก ' + c.name, 'bad'); SFX.bad(); return; }
  farmState.coins -= c.cost;
  p.cropId = cropId;
  p.plantedAt = Date.now();
  p.lastStage = 0;
  refreshPlotMesh(p);
  SFX.plant();
  toastFarm(`🌱 ปลูก ${c.name} แล้ว (-🪙${c.cost})`, 'ok');
  saveFarmState();
  renderHud();
}
function harvestCrop(p){
  const c = cropById(p.cropId);
  addCoins(c.sell);
  addXp(c.xp);
  spawnFloatText(p, `+${c.sell}`, '🪙');
  SFX.harvest();
  const totalHarvested = (parseInt(localStorage.getItem('rfi_total_harvest')||'0',10)) + 1;
  localStorage.setItem('rfi_total_harvest', String(totalHarvested));
  unlockAchievement('first_harvest');
  if(totalHarvested >= 50) unlockAchievement('harvest50');
  if(p.cropMesh) bounceMesh(p.cropMesh);
  toastFarm(`🧺 เก็บเกี่ยว ${c.name} ได้ 🪙${c.sell}!`, 'ok');
  p.cropId = null; p.plantedAt = null;
  if(p.cropMesh){ islandGroup.remove(p.cropMesh); p.cropMesh = null; }
  saveFarmState();
  renderHud();
}

/* ============================= SEED TRAY / DRAG-AND-DROP PLANTING ============================= */
function renderSeedTray(){
  const wrap = document.getElementById('seedTray');
  wrap.innerHTML = '';
  farmState.unlockedSeeds.forEach(id=>{
    const c = cropById(id);
    const affordable = farmState.coins >= c.cost;
    const chip = document.createElement('div');
    chip.className = 'paletteChip' + (affordable ? '' : ' disabled') + (state.selectedSeedType===id ? ' selected' : '');
    const seconds = Math.round(c.growMs/1000);
    const timeLabel = seconds < 60 ? `${seconds}วิ` : `${Math.round(seconds/60)}นาที`;
    chip.innerHTML = `
      <div class="pIcon">${c.icon}</div>
      <div class="pName">${c.name}</div>
      <div class="pCost">🪙${c.cost}</div>
      <div class="pTime">⏱️${timeLabel}</div>
    `;
    chip.addEventListener('pointerdown', (e)=>seedDragStart(e, id, chip));
    wrap.appendChild(chip);
  });
}
let seedDrag = null;
const SEED_DRAG_THRESHOLD = 10;
const dragGhostEl = document.getElementById('dragGhost');
function seedDragStart(e, id, chip){
  if(chip.classList.contains('disabled')) return;
  seedDrag = { id, chip, startX:e.clientX, startY:e.clientY, dragging:false };
}
function seedDragMove(e){
  if(!seedDrag) return;
  const dx = e.clientX - seedDrag.startX, dy = e.clientY - seedDrag.startY;
  if(!seedDrag.dragging){
    if(Math.hypot(dx,dy) < SEED_DRAG_THRESHOLD) return;
    seedDrag.dragging = true;
    seedDrag.chip.classList.add('dragSource');
    dragGhostEl.textContent = cropById(seedDrag.id).icon;
    dragGhostEl.style.display = 'block';
  }
  dragGhostEl.style.left = e.clientX + 'px';
  dragGhostEl.style.top = e.clientY + 'px';
}
function seedDragEnd(e){
  if(!seedDrag) return;
  const { id, chip, dragging } = seedDrag;
  seedDrag = null;
  chip.classList.remove('dragSource');
  if(dragging){
    dragGhostEl.style.display = 'none';
    const plot = getNearestPlot(e.clientX, e.clientY);
    if(!plot){ /* dropped outside any plot — cancel silently */ }
    else if(plot.cropId){ toastFarm('แปลงนี้มีพืชอยู่แล้ว ลองแปลงว่างสิ', 'bad'); }
    else if(!plot.mesh.visible){ toastFarm('แปลงนี้ยังไม่ได้ปลดล็อก ลองขยายเกาะในร้านค้า', 'bad'); }
    else { plantCrop(plot, id); }
    state.selectedSeedType = null;
    renderSeedTray();
  } else {
    if(farmState.coins < cropById(id).cost){ toastFarm('เหรียญไม่พอ', 'bad'); return; }
    state.selectedSeedType = (state.selectedSeedType === id) ? null : id;
    renderSeedTray();
  }
}
function seedDragCancel(){
  if(!seedDrag) return;
  seedDrag.chip.classList.remove('dragSource');
  seedDrag = null;
  dragGhostEl.style.display = 'none';
}
window.addEventListener('pointermove', seedDragMove);
window.addEventListener('pointerup', seedDragEnd);
window.addEventListener('pointercancel', seedDragCancel);

const PLOT_DROP_THRESHOLD_PX = 65;
function getNearestPlot(clientX, clientY){
  const rect = renderer.domElement.getBoundingClientRect();
  let closest = null, closestDist = Infinity;
  plots.forEach(p=>{
    if(!p.mesh.visible) return;
    const world = islandGroup.localToWorld(new THREE.Vector3(p.x, 0.5, p.z));
    const projected = world.project(camera);
    const sx = (projected.x*0.5+0.5)*rect.width + rect.left;
    const sy = (-projected.y*0.5+0.5)*rect.height + rect.top;
    const dist = Math.hypot(sx-clientX, sy-clientY);
    if(dist < closestDist){ closestDist = dist; closest = p; }
  });
  return closestDist <= PLOT_DROP_THRESHOLD_PX ? closest : null;
}

let canvasDownPos = null;
renderer.domElement.addEventListener('pointerdown', (e)=>{ canvasDownPos = { x:e.clientX, y:e.clientY }; });
renderer.domElement.addEventListener('pointerup', (e)=>{
  if(!canvasDownPos){ return; }
  const moved = Math.hypot(e.clientX-canvasDownPos.x, e.clientY-canvasDownPos.y);
  canvasDownPos = null;
  if(moved > 10) return; // was a camera pan, not a tap
  const plot = getNearestPlot(e.clientX, e.clientY);
  if(!plot || !plot.mesh.visible) return;
  if(state.selectedSeedType){
    if(plot.cropId){ toastFarm('แปลงนี้มีพืชอยู่แล้ว', 'bad'); return; }
    plantCrop(plot, state.selectedSeedType);
    state.selectedSeedType = null;
    renderSeedTray();
  } else if(plot.cropId){
    const stage = plotStage(plot);
    if(stage >= 2) harvestCrop(plot);
    else {
      const remainMs = cropById(plot.cropId).growMs - (Date.now() - plot.plantedAt);
      const remainS = Math.max(0, Math.ceil(remainMs/1000));
      const label = remainS < 60 ? `${remainS} วินาที` : `${Math.ceil(remainS/60)} นาที`;
      toastFarm(`${cropById(plot.cropId).icon} ยังไม่พร้อมเก็บเกี่ยว — เหลืออีก ${label}`, null);
    }
  }
});

function spawnFloatText(plot, text, iconIgnored){
  const rect = renderer.domElement.getBoundingClientRect();
  const world = islandGroup.localToWorld(new THREE.Vector3(plot.x, 2.3, plot.z));
  const projected = world.project(camera);
  if(projected.z > 1) return;
  const sx = (projected.x*0.5+0.5)*rect.width + rect.left;
  const sy = (-projected.y*0.5+0.5)*rect.height + rect.top;
  if(sx < 0 || sx > rect.width || sy < 0 || sy > rect.height) return;
  const el = document.createElement('div');
  el.className = 'floatText';
  el.style.left = sx + 'px';
  el.style.top = sy + 'px';
  el.style.color = '#e0a838';
  el.textContent = text;
  document.getElementById('farmFloatTextWrap').appendChild(el);
  setTimeout(()=>{ el.remove(); }, 1450);
}
function toastFarm(msg, cls){
  const wrap = document.getElementById('farmToastWrap');
  const el = document.createElement('div');
  el.className = 'farmToast' + (cls ? ' '+cls : '');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3200);
}

