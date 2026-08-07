/* ============================= THREE SETUP ============================= */
const wrap = document.getElementById('canvas-wrap');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = false; // kept off for mobile GPU reliability, matches the rest of this scene's design
wrap.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffff, 0x8fd8c8, 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xeafff5, 0.9);
sun.position.set(30,45,15);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffe0c0, 0.2));

// cosmetic day/night breathing cycle — purely visual, never fully dark, gives the island atmosphere
const skyDayColor = new THREE.Color(0xbfe8f0);
const skyDuskColor = new THREE.Color(0x5f6fb0);
const skyColor = new THREE.Color(0xbfe8f0);
scene.background = skyColor;
scene.fog = new THREE.Fog(0xdcf5ea, 40, 160);

// generic toon-outline helper (inverted-hull technique)
function addOutline(mesh, scaleUp, color){
  const outlineMat = new THREE.MeshBasicMaterial({color: color || 0x1a1414, side: THREE.BackSide});
  const outline = new THREE.Mesh(mesh.geometry, outlineMat);
  outline.position.copy(mesh.position);
  outline.rotation.copy(mesh.rotation);
  outline.scale.copy(mesh.scale).multiplyScalar(scaleUp || 1.1);
  return outline;
}
const cuteEyeWhiteMat = new THREE.MeshStandardMaterial({color:0xffffff, roughness:0.3});
const cuteEyePupilMat = new THREE.MeshStandardMaterial({color:0x2a2a2a, roughness:0.3});
const cuteCheekMat = new THREE.MeshStandardMaterial({color:0xffb0a0, roughness:0.7, transparent:true, opacity:0.65});
function addCuteFace(group, cx, cy, cz, scale, spread){
  const eyeScale = 0.16*scale;
  [-1,1].forEach(side=>{
    const eg = new THREE.Group();
    const w = new THREE.Mesh(new THREE.SphereGeometry(eyeScale,8,6), cuteEyeWhiteMat);
    const p = new THREE.Mesh(new THREE.SphereGeometry(eyeScale*0.5,6,5), cuteEyePupilMat);
    p.position.z = eyeScale*0.7;
    eg.add(w,p);
    eg.position.set(side*spread*scale, cy, cz);
    eg.name = 'blinkEye';
    group.add(eg);
  });
  const cheekScale = 0.11*scale;
  [-1,1].forEach(side=>{
    const c = new THREE.Mesh(new THREE.SphereGeometry(cheekScale,8,6), cuteCheekMat);
    c.position.set(side*(spread*scale+0.16*scale), cy-0.14*scale, cz-0.02);
    group.add(c);
  });
}

/* ============================= FLOATING ISLAND ============================= */
const ISLAND_CENTER = { x:0, z:0 };
const islandGroup = new THREE.Group();
islandGroup.position.set(ISLAND_CENTER.x, 0, ISLAND_CENTER.z);
scene.add(islandGroup);

const grassTop = new THREE.Mesh(
  new THREE.CylinderGeometry(34, 34, 1.4, 32),
  new THREE.MeshStandardMaterial({color:0x7dc98a, roughness:0.85})
);
islandGroup.add(grassTop);
const dirtBelow = new THREE.Mesh(
  new THREE.CylinderGeometry(33, 22, 5, 32),
  new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.95})
);
dirtBelow.position.y = -3.4;
islandGroup.add(dirtBelow);
const dirtPoint = new THREE.Mesh(
  new THREE.ConeGeometry(15, 8, 24),
  new THREE.MeshStandardMaterial({color:0x6e4529, roughness:0.95})
);
dirtPoint.position.y = -9.9;
islandGroup.add(dirtPoint);

[[40,4,-6],[-38,2,10],[10,-2,42],[-22,0,-36]].forEach(([rx,ry,rz])=>{
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4+Math.random(),0), new THREE.MeshStandardMaterial({color:0x9a7a5a, roughness:0.9, flatShading:true}));
  rock.position.set(rx, ry, rz);
  islandGroup.add(rock);
});

const waterfall = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 14),
  new THREE.MeshStandardMaterial({color:0x8fe0ff, transparent:true, opacity:0.55, roughness:0.2, side:THREE.DoubleSide})
);
waterfall.position.set(30, -6, -4);
waterfall.rotation.y = 0.5;
islandGroup.add(waterfall);

const treeGroup = new THREE.Group();
const allTrees = [];
function makeTree(x,z,scale){
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,1.4,7), new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.8}));
  trunk.position.y = 0.7;
  const leafColors = [0x6fce6a, 0x8fe07a, 0x5cc766];
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.15,8,7), new THREE.MeshStandardMaterial({color:leafColors[Math.floor(Math.random()*leafColors.length)], roughness:0.7}));
  leaf.position.y = 2.1; leaf.scale.set(1,0.9,1);
  leaf.name = 'leaf';
  t.add(trunk, leaf);
  t.position.set(x,0,z); t.scale.setScalar(scale);
  t.userData.swayPhase = Math.random()*Math.PI*2;
  allTrees.push(t);
  return t;
}
islandGroup.add(makeTree(-26, -18, 1.1), makeTree(24, 20, 0.95), makeTree(-14, 28, 1.0), makeTree(-32, -4, 0.85), makeTree(18, -26, 1.05), makeTree(-8, -32, 0.9), makeTree(32, -14, 1.0));

const streamCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-33, 0.62, -30), new THREE.Vector3(-24, 0.62, -22),
  new THREE.Vector3(-18, 0.62, -26), new THREE.Vector3(-10, 0.62, -18),
  new THREE.Vector3(-4, 0.62, -22), new THREE.Vector3(4, 0.62, -14),
  new THREE.Vector3(10, 0.62, -18), new THREE.Vector3(16, 0.62, -10)
]);
const streamShape = new THREE.Shape();
streamShape.moveTo(-1.1, 0); streamShape.lineTo(1.1, 0);
const stream = new THREE.Mesh(
  new THREE.ExtrudeGeometry(streamShape, { steps:60, extrudePath:streamCurve, bevelEnabled:false }),
  new THREE.MeshStandardMaterial({color:0x6fd6ff, transparent:true, opacity:0.75, roughness:0.15, metalness:0.05})
);
islandGroup.add(stream);
[0.15, 0.4, 0.65, 0.85].forEach(t=>{
  const pt = streamCurve.getPointAt(t);
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,0.18,8), new THREE.MeshStandardMaterial({color:0xb8a888, roughness:0.85, flatShading:true}));
  stone.position.set(pt.x + (Math.random()-0.5)*1.5, 0.7, pt.z + (Math.random()-0.5)*1.5);
  islandGroup.add(stone);
});

const lawnRockMat = new THREE.MeshStandardMaterial({color:0x9a8a72, roughness:0.9, flatShading:true});
[[-20, 8], [22, -6], [-4, 24], [30, 16]].forEach(([rx,rz])=>{
  const clusterSize = 2 + Math.floor(Math.random()*2);
  for(let i=0;i<clusterSize;i++){
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5+Math.random()*0.6,0), lawnRockMat);
    rock.position.set(rx+(Math.random()-0.5)*2.2, 0.7+Math.random()*0.2, rz+(Math.random()-0.5)*2.2);
    rock.rotation.set(Math.random(),Math.random(),Math.random());
    islandGroup.add(rock);
  }
});

const grassMat = new THREE.MeshStandardMaterial({color:0x6fce6a, roughness:0.8});
for(let i=0;i<16;i++){
  const angle = Math.random()*Math.PI*2;
  const radius = 4 + Math.random()*27;
  const gx = Math.cos(angle)*radius, gz = Math.sin(angle)*radius;
  const tuft = new THREE.Group();
  for(let b=0;b<2;b++){
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.06,0.4,4), grassMat);
    blade.position.set((Math.random()-0.5)*0.2, 0.75, (Math.random()-0.5)*0.2);
    blade.rotation.z = (Math.random()-0.5)*0.4;
    tuft.add(blade);
  }
  tuft.position.set(gx, 0, gz);
  islandGroup.add(tuft);
}

// farmhouse (the island's little home base)
function makeFarmhouse(){
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.4,3.0,3.6), new THREE.MeshStandardMaterial({color:0xffd9a0, roughness:0.7}));
  base.position.y = 1.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4,2.0,4), new THREE.MeshStandardMaterial({color:0xff8a5c, roughness:0.7}));
  roof.rotation.y = Math.PI/4; roof.position.y = 4.0;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0,1.6,0.1), new THREE.MeshStandardMaterial({color:0x8a5a3a}));
  door.position.set(0,0.8,1.82);
  const winMat = new THREE.MeshStandardMaterial({color:0x9df7ff, emissive:0xfff2b0, emissiveIntensity:0.4});
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.1), winMat); win1.position.set(-1.4,1.8,1.82);
  const win2 = win1.clone(); win2.position.x = 1.4;
  g.add(base, roof, door, win1, win2);
  addCuteFace(g, 0, 2.1, 1.85, 1.3, 0.4);
  return g;
}
const farmhouse = makeFarmhouse();
farmhouse.position.set(0, 0.7, -30);
islandGroup.add(farmhouse);

function makeSignboard(x,z,rotY){
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({color:0x8a5a3a, roughness:0.85});
  const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.6,6), postMat);
  post1.position.set(-0.5,0.8,0);
  const post2 = post1.clone(); post2.position.x = 0.5;
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.5,0.9,0.08), new THREE.MeshStandardMaterial({color:0xf3e3c0, roughness:0.8}));
  board.position.y = 1.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0,0.35,4), new THREE.MeshStandardMaterial({color:0xffab52, roughness:0.7}));
  roof.rotation.y = Math.PI/4; roof.position.y = 2.05;
  g.add(post1,post2,board,roof);
  g.position.set(x,0,z); g.rotation.y = rotY;
  return g;
}
function makeFenceRun(x,z,rotY,count){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color:0xe0c89a, roughness:0.8});
  for(let i=0;i<count;i++){
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.5,6), mat);
    post.position.set(i*0.7,0.25,0);
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(count*0.7,0.08,0.06), mat);
  rail.position.set((count-1)*0.35,0.35,0);
  g.add(rail);
  g.position.set(x,0,z); g.rotation.y = rotY;
  return g;
}
function makeBirdhouse(x,z){
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,2.0,6), new THREE.MeshStandardMaterial({color:0x8a5a3a}));
  pole.position.y = 1.0;
  const house = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.4), new THREE.MeshStandardMaterial({color:0xffd88a}));
  house.position.y = 2.15;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.4,0.3,4), new THREE.MeshStandardMaterial({color:0xff8a5c}));
  roof.rotation.y = Math.PI/4; roof.position.y = 2.5;
  g.add(pole, house, roof);
  g.position.set(x,0,z);
  return g;
}
islandGroup.add(makeSignboard(-6, -30, 0.3), makeFenceRun(2, -34, 0.2, 4), makeFenceRun(2, -34.6, 0.2, 4), makeBirdhouse(-32, 14));

// rainbow arc + drifting clouds + flying birds — the cozy "floating island" hero look
const rainbowColors = [0xff6f6f, 0xffab52, 0xffe066, 0x8fe07a, 0x6fd6ff, 0x9d8cf0];
const rainbowGroup = new THREE.Group();
rainbowColors.forEach((c,i)=>{
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(20 - i*0.9, 0.5, 8, 32, Math.PI),
    new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:0.85})
  );
  arc.rotation.z = Math.PI;
  arc.position.set(0, 0, 0);
  rainbowGroup.add(arc);
});
rainbowGroup.position.set(24, 6, -20);
rainbowGroup.rotation.y = -0.5;
islandGroup.add(rainbowGroup);

const cloudGroup = new THREE.Group();
const cloudMat = new THREE.MeshStandardMaterial({color:0xffffff, roughness:1, transparent:true, opacity:0.92});
function makeCloud(x,y,z,scale){
  const c = new THREE.Group();
  const puffCount = 4+Math.floor(Math.random()*3);
  for(let i=0;i<puffCount;i++){
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1,8,7), cloudMat);
    puff.position.set((Math.random()-0.5)*2.4, (Math.random()-0.5)*0.5, (Math.random()-0.5)*1.2);
    puff.scale.setScalar(0.7+Math.random()*0.5);
    c.add(puff);
  }
  c.position.set(x,y,z); c.scale.setScalar(scale);
  return c;
}
for(let i=0;i<10;i++){
  cloudGroup.add(makeCloud((Math.random()-0.5)*140, 26+Math.random()*10, (Math.random()-0.5)*140, 2+Math.random()*1.5));
}
scene.add(cloudGroup);

const birdGroup = new THREE.Group();
const birdMat = new THREE.MeshBasicMaterial({color:0x3a3a3a});
function makeBird(){
  const g = new THREE.Group();
  const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.35,0.9,3), birdMat);
  wingL.rotation.z = Math.PI/2; wingL.position.x = -0.4; wingL.name = 'wingL';
  const wingR = wingL.clone(); wingR.position.x = 0.4; wingR.rotation.z = -Math.PI/2; wingR.name = 'wingR';
  g.add(wingL, wingR);
  g.userData.phase = Math.random()*Math.PI*2;
  g.userData.orbitR = 30 + Math.random()*20;
  g.userData.orbitSpeed = 0.06 + Math.random()*0.05;
  g.userData.height = 20 + Math.random()*8;
  return g;
}
for(let i=0;i<5;i++){ const b = makeBird(); birdGroup.add(b); }
scene.add(birdGroup);

// starfield for the night portion of the day/night cycle (hidden by day)
const starGeo = new THREE.BufferGeometry();
const starCount = 160;
const starPos = new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){
  const a = Math.random()*Math.PI*2, r = 40+Math.random()*60;
  starPos[i*3] = Math.cos(a)*r;
  starPos[i*3+1] = 20 + Math.random()*40;
  starPos[i*3+2] = Math.sin(a)*r;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
const starMat = new THREE.PointsMaterial({color:0xffffff, size:0.5, transparent:true, opacity:0});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

/* ============================= PLAYER MASCOT ============================= */
const player = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({color:0x5fd6c8, roughness:0.55});
const body = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.55,1.05), bodyMat);
body.position.y=1.05;
const headMat = new THREE.MeshStandardMaterial({color:0xfff2df, roughness:0.6});
const head = new THREE.Mesh(new THREE.BoxGeometry(1.35,1.2,1.25), headMat);
head.position.y=2.5;
function makeEye(xOff){
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8), cuteEyeWhiteMat);
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6), cuteEyePupilMat);
  p.position.z = 0.16;
  g.add(w,p);
  g.position.set(xOff,2.55,0.68);
  return g;
}
const eyeL = makeEye(-0.32), eyeR = makeEye(0.32);
const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6), cuteCheekMat); cheekL.position.set(-0.58,2.3,0.58);
const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6), cuteCheekMat); cheekR.position.set(0.58,2.3,0.58);
const limbMat = new THREE.MeshStandardMaterial({color:0x4bc0b3, roughness:0.55});
const armL = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.85,0.36), limbMat); armL.position.set(-0.95,1.05,0);
const armR = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.85,0.36), limbMat); armR.position.set(0.95,1.05,0);
const bootMat = new THREE.MeshStandardMaterial({color:0x6b5738, roughness:0.7});
const legL = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.55,0.42), bootMat); legL.position.set(-0.42,0.28,0);
const legR = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.55,0.42), bootMat); legR.position.set(0.42,0.28,0);

player.add(addOutline(body,1.12), addOutline(head,1.1), addOutline(armL,1.15), addOutline(armR,1.15), addOutline(legL,1.15), addOutline(legR,1.15));
player.add(body, head, eyeL, eyeR, cheekL, cheekR, armL, armR, legL, legR);
player.position.set(0, 0, -22);
player.rotation.y = Math.PI;
islandGroup.add(player);

// hat + clothes overlays, swapped live by applyOutfits()
let hatMesh = null;
function buildHatMesh(hatId){
  if(hatMesh){ player.remove(hatMesh); hatMesh = null; }
  if(hatId === 'none') return;
  const meta = HAT_ITEMS.find(h=>h.id===hatId);
  const g = new THREE.Group();
  if(hatId === 'straw'){
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,0.08,14), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.8}));
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.5,0.4,14), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.8}));
    top.position.y = 0.24;
    g.add(brim, top);
  } else if(hatId === 'cap'){
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.62,10,8,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.6}));
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.06,10), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.6}));
    brim.position.set(0,0,0.45);
    g.add(dome, brim);
  } else if(hatId === 'flower'){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62,0.1,8,16), new THREE.MeshStandardMaterial({color:0x8fe07a, roughness:0.7}));
    ring.rotation.x = Math.PI/2;
    g.add(ring);
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.6}));
      petal.position.set(Math.cos(a)*0.62, 0.05, Math.sin(a)*0.62);
      g.add(petal);
    }
  } else if(hatId === 'crown'){
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.65,0.3,10), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.35, metalness:0.5}));
    g.add(band);
    for(let i=0;i<5;i++){
      const a = (i/5)*Math.PI*2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.3,6), new THREE.MeshStandardMaterial({color:meta.color, roughness:0.35, metalness:0.5}));
      spike.position.set(Math.cos(a)*0.55, 0.28, Math.sin(a)*0.55);
      g.add(spike);
    }
  }
  g.position.y = 3.28;
  hatMesh = g;
  player.add(g);
}
function applyOutfits(){
  const o = getOwnedOutfits();
  const clothes = CLOTHES_ITEMS.find(c=>c.id===o.equippedClothes) || CLOTHES_ITEMS[0];
  bodyMat.color.set(clothes.body);
  limbMat.color.set(clothes.limb);
  buildHatMesh(o.equippedHat);
}
applyOutfits();
