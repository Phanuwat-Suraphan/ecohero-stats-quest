/* ============================= CAMERA / ZOOM ============================= */
function updateCamera(){
  const heightRatio = 46/38, distRatio = 38/38;
  const followX = state.gameStarted ? player.position.x : ISLAND_CENTER.x;
  const followZ = state.gameStarted ? player.position.z : ISLAND_CENTER.z;
  const camTarget = new THREE.Vector3(followX, state.domeZoom*heightRatio, followZ + state.domeZoom*distRatio);
  camera.position.lerp(camTarget, 0.09);
  const lookAt = camera.userData.lookAt || (camera.userData.lookAt = new THREE.Vector3());
  lookAt.lerp(new THREE.Vector3(followX, 2, followZ), 0.08);
  camera.lookAt(lookAt);
}

/* ============================= WALKING / PROXIMITY ============================= */
const MOVE_SPEED = 0.16;
function dialogueOpen(){ return document.getElementById('dialogueScreen').classList.contains('show'); }
function handleMovement(){
  if(!state.gameStarted || dialogueOpen()) return;
  let mx = 0, mz = 0;
  if(state.keys['w']||state.keys['arrowup']) mz -= 1;
  if(state.keys['s']||state.keys['arrowdown']) mz += 1;
  if(state.keys['a']||state.keys['arrowleft']) mx -= 1;
  if(state.keys['d']||state.keys['arrowright']) mx += 1;
  mx += state.joyDX;
  mz += state.joyDY;
  const mag = Math.hypot(mx, mz);
  if(mag < 0.05) return;
  const nx = mx/Math.max(1,mag), nz = mz/Math.max(1,mag);
  const speed = MOVE_SPEED * Math.min(1,mag);
  player.position.x += nx * speed;
  player.position.z += nz * speed;
  player.rotation.y = Math.atan2(nx, nz);
  const r = Math.hypot(player.position.x, player.position.z);
  const maxR = REGIONS[state.activeRegion].walkRadius;
  if(r > maxR){
    const s = maxR / r;
    player.position.x *= s; player.position.z *= s;
  }
}
function adjustFarmZoom(delta){
  state.domeZoom = Math.min(state.domeZoomMax, Math.max(state.domeZoomMin, state.domeZoom + delta));
}
window.addEventListener('wheel', (e)=>{
  if(!state.gameStarted) return;
  e.preventDefault();
  state.domeZoom = Math.min(state.domeZoomMax, Math.max(state.domeZoomMin, state.domeZoom + e.deltaY*0.04));
}, {passive:false});
let pinchStartDist = null, pinchStartZoom = null;
renderer.domElement.addEventListener('touchstart', (e)=>{
  if(e.touches.length < 2) return;
  const [t1,t2] = e.touches;
  pinchStartDist = Math.hypot(t2.clientX-t1.clientX, t2.clientY-t1.clientY);
  pinchStartZoom = state.domeZoom;
}, {passive:true});
renderer.domElement.addEventListener('touchmove', (e)=>{
  if(e.touches.length < 2 || pinchStartDist === null) return;
  e.preventDefault();
  const [t1,t2] = e.touches;
  const dist = Math.hypot(t2.clientX-t1.clientX, t2.clientY-t1.clientY);
  const ratio = pinchStartDist / dist;
  state.domeZoom = Math.min(state.domeZoomMax, Math.max(state.domeZoomMin, pinchStartZoom * ratio));
}, {passive:false});
renderer.domElement.addEventListener('touchend', (e)=>{
  if(e.touches.length < 2) pinchStartDist = null;
}, {passive:true});

/* ============================= ENTER FARM ============================= */
function enterFarm(){
  loadFarmState();
  plots.forEach(p=>{
    p.cropId = null; p.plantedAt = null;
    if(p.cropMesh){ islandGroup.remove(p.cropMesh); p.cropMesh = null; }
  });
  for(let tier=0; tier<=farmState.expansionTier; tier++){
    plots.filter(p=>p.tier===tier).forEach(p=>{ p.mesh.visible = true; });
  }
  if(Array.isArray(farmState.plots)){
    farmState.plots.forEach((saved, i)=>{
      if(saved && plots[i]){
        plots[i].cropId = saved.cropId;
        plots[i].plantedAt = saved.plantedAt;
        refreshPlotMesh(plots[i]);
      }
    });
  }
  refreshWorldItemVisibility();
  nearbyTarget = null;
  renderProximityPrompt();
  renderHud();
  renderSeedTray();
  show('farmScreen');
  toastFarm('🌈 ยินดีต้อนรับกลับสู่เกาะของคุณ!', null);
}

/* ============================= ANIMATE ============================= */
function animate(){
  requestAnimationFrame(animate);
  handleMovement();
  updateCamera();
  const now = Date.now();

  // periodic re-check of nearby NPCs/interactables so the prompt button shows without a tap
  if(now - (animate._lastProximityCheck||0) > 200){
    animate._lastProximityCheck = now;
    if(state.gameStarted && !dialogueOpen()) checkProximity();
  }

  // periodic re-check of plot growth stages so crops visually mature without needing a tap
  if(now - (animate._lastGrowthCheck||0) > 1000){
    animate._lastGrowthCheck = now;
    plots.forEach(p=>{
      if(!p.cropId) return;
      const stage = plotStage(p);
      if(stage !== p.lastStage){ p.lastStage = stage; refreshPlotMesh(p); }
    });
  }

  cloudGroup.children.forEach((c,i)=>{ c.position.x += 0.006 + (i%3)*0.002; if(c.position.x > 90) c.position.x = -90; });
  birdGroup.children.forEach(b=>{
    const t = now*0.0002*b.userData.orbitSpeed*10 + b.userData.phase;
    b.position.set(Math.cos(t)*b.userData.orbitR, b.userData.height + Math.sin(now*0.002+b.userData.phase)*1.5, Math.sin(t)*b.userData.orbitR);
    b.rotation.y = -t + Math.PI/2;
    const flap = Math.sin(now*0.012 + b.userData.phase)*0.6;
    const wl = b.children.find(c=>c.name==='wingL'), wr = b.children.find(c=>c.name==='wingR');
    if(wl) wl.rotation.x = flap; if(wr) wr.rotation.x = -flap;
  });
  REGIONS[state.activeRegion].group.position.y = Math.sin(now*0.0005)*0.6;

  // cosmetic day/night cycle: sky tint + light intensity + star opacity, never fully dark
  const nightAmt = (1 - Math.cos(now*0.000022*Math.PI*2)) / 2;
  skyColor.copy(skyDayColor).lerp(skyDuskColor, nightAmt*0.75);
  hemi.intensity = 1.15 - nightAmt*0.55;
  sun.intensity = 0.9 - nightAmt*0.45;
  starMat.opacity = Math.max(0, nightAmt - 0.35) * 1.3;

  for(let i=poppingMeshes.length-1; i>=0; i--){
    const m = poppingMeshes[i];
    m.userData.popT = (m.userData.popT || 0) + 0.055;
    const t = Math.min(1, m.userData.popT);
    const c1 = 1.7, c3 = c1 + 1;
    const eased = t >= 1 ? 1 : 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2);
    m.scale.setScalar(Math.max(0.001, eased));
    if(t >= 1){ poppingMeshes.splice(i,1); }
  }
  for(let i=bouncingMeshes.length-1; i>=0; i--){
    const b = bouncingMeshes[i];
    b.elapsed += 16;
    const t = Math.min(1, b.elapsed/300);
    b.mesh.scale.setScalar(1 + Math.sin(t*Math.PI)*0.3);
    if(t >= 1){ b.mesh.scale.setScalar(1); bouncingMeshes.splice(i,1); }
  }

  plots.forEach(p=>{
    if(!p.cropMesh || poppingMeshes.includes(p.cropMesh)) return;
    const phase = p.cropMesh.userData.idlePhase || 0;
    if(p.cropMesh.userData.ready){
      p.cropMesh.position.y = 1.0 + Math.abs(Math.sin(now*0.004 + phase))*0.18;
      p.cropMesh.rotation.y = Math.sin(now*0.002+phase)*0.3;
    } else {
      p.cropMesh.position.y = 1.0 + Math.sin(now*0.0022 + phase)*0.04;
    }
  });

  const playerBlink = (now*0.001) % 3.6;
  const pBlink = playerBlink > 3.45 ? 0.15 : 1;
  [eyeL, eyeR].forEach(eye=>{ eye.children[0].scale.y = pBlink; eye.children[1].scale.y = pBlink; });
  head.position.y = 2.55 + Math.sin(now*0.003)*0.03;
  allTrees.forEach(t=>{
    const leaf = t.children.find(c=>c.name === 'leaf');
    if(leaf) leaf.rotation.z = Math.sin(now*0.0012 + t.userData.swayPhase)*0.08;
  });

  // NPC idle bob + gentle turn toward the player when nearby (feels alive without full animation rigging)
  NPC_DEFS.forEach(def=>{
    const g = npcMeshes[def.id];
    if(!g) return;
    const phase = g.userData.idlePhase || 0;
    g.position.y = Math.sin(now*0.0018 + phase) * 0.05;
    const dx = player.position.x - def.x, dz = player.position.z - def.z;
    if(Math.hypot(dx,dz) < 9){ g.rotation.y = Math.atan2(dx, dz); }
  });
  // secret/quest item bob + spin
  worldItemDefs.forEach(def=>{
    const g = worldItemMeshes[def.id];
    if(!g || !g.visible) return;
    const phase = g.userData.bobPhase || 0;
    g.children[1].position.y = 1.6 + Math.sin(now*0.003 + phase) * 0.15;
    g.children[1].rotation.y = now*0.0015 + phase;
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ============================= BOOT ============================= */
(function boot(){
  if(isTouchDevice) document.body.classList.add('touch-device');
  initJoystick();
  updateMuteButtons();
  markRegionVisited(state.activeRegion);
  const streakData = computeStreakOnLoad();
  checkStreakAchievements(streakData);
  renderStreakPanel();
  renderAchievements();
  loadFarmState();
  renderHud();
})();
