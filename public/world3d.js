/* Interactive Three.js holographic board and lightweight mobile emblem.
   Loaded from a pinned CDN; the host retains its CSS background if unavailable. */
(async()=>{
let T;try{T=await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");}catch(err){console.warn("Three.js CDN not available; using static world artwork",err);window.dispatchEvent(new Event("cevworld:unavailable"));return;}
const FACTION_POS=[[-4.3,-3.0],[4.3,-3.0],[-4.3,3],[4.3,3]];
const GRID_COLOR=0x17465d;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function color(hex){try{return new T.Color(hex||"#70c7ff");}catch{return new T.Color("#70c7ff");}}
function material(c,emissiveStrength=.22,roughness=.45){const col=c instanceof T.Color?c:color(c);return new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:emissiveStrength,metalness:.46,roughness});}
function box(w,h,d,mat){return new T.Mesh(new T.BoxGeometry(w,h,d),mat);}
function cylinder(top,bottom,height,mat,segments=16){return new T.Mesh(new T.CylinderGeometry(top,bottom,height,segments),mat);}
function ball(radius,mat,seg=12){return new T.Mesh(new T.IcosahedronGeometry(radius,seg>10?1:0),mat);}
function makeLabel(str,hex="#d9f4ff"){
 const canvas=document.createElement("canvas");canvas.width=480;canvas.height=112;const ctx=canvas.getContext("2d");ctx.clearRect(0,0,480,112);ctx.fillStyle="#0b2439e8";ctx.strokeStyle=hex;ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(9,12,462,83,13);ctx.fill();ctx.stroke();ctx.fillStyle="#eefbff";ctx.font="bold 34px system-ui";ctx.textAlign="center";ctx.fillText(String(str).slice(0,21),240,65);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.scale.set(3.3,.8,1);return sprite;
}
function renderer(root,antialias=true){const r=new T.WebGLRenderer({alpha:true,antialias,powerPreference:"low-power",preserveDrawingBuffer:false});r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.16;root.innerHTML="";root.appendChild(r.domElement);return r;}
function baseScene(){const scene=new T.Scene();scene.fog=new T.FogExp2(0x061521,.017);scene.add(new T.HemisphereLight(0x8bccf4,0x071424,2));const direct=new T.DirectionalLight(0xffd1a0,2.4);direct.position.set(-7,15,9);scene.add(direct);const rim=new T.DirectionalLight(0x51eed5,1.3);rim.position.set(9,8,-6);scene.add(rim);return scene;}
function floor(scene){const mat=new T.MeshStandardMaterial({color:0x061926,roughness:.65,metalness:.35});const board=box(13.4,.25,10.3,mat);board.position.y=-.2;scene.add(board);const base=box(13.7,.13,10.6,material("#2c6b78",.15));base.position.y=-.37;scene.add(base);const grid=new T.GridHelper(13.2,16,GRID_COLOR,0x163749);grid.position.y=-.054;grid.scale.z=.78;scene.add(grid);const sphere=new T.Mesh(new T.SphereGeometry(.17,12,8),new T.MeshBasicMaterial({color:0xffce87}));sphere.position.set(0,.65,0);scene.add(sphere);const ring=new T.Mesh(new T.TorusGeometry(.75,.02,6,64),new T.MeshBasicMaterial({color:0x4dffe3,transparent:true,opacity:.6}));ring.rotation.x=Math.PI/2;ring.position.y=.065;scene.add(ring);return ring;}
function district(index,t){const [x,z]=FACTION_POS[index%4];const c=color(t.color);const group=new T.Group();group.position.set(x,0,z);group.userData.teamIndex=t.index;
 const pedestal=box(3.65,.22,2.85,material(c,.19));pedestal.position.y=.035;group.add(pedestal);
 const base=box(3.4,.3,2.55,material("#0b273c",.1));base.position.y=.23;group.add(base);
 const hub=cylinder(.62,.7,.65,material(c,.20),10);hub.position.set(0,.66,.08);group.add(hub);
 const tower=box(.60,1.7,.62,material(c,.17));tower.position.set(0,1.66,.08);group.add(tower);
 const antenna=cylinder(.05,.07,.62,material("#ffe2a1",.6));antenna.position.set(0,2.75,.08);group.add(antenna);
 // distinct resource infrastructure models
 if(t.factionId==="diamonds"){
  for(let j=0;j<3;j++){const shard=new T.Mesh(new T.OctahedronGeometry(.38+j*.08),material("#87caff",.55));shard.position.set(-1.12+j*.14,.69,-.52+j*.55);shard.rotation.z=.24+j*.21;group.add(shard);}
  const crate=box(.65,.37,.53,material("#8ecff1"));crate.position.set(1,.56,-.60);group.add(crate);
 }else if(t.factionId==="pipeline"){
  for(let j=0;j<3;j++){const tank=cylinder(.40,.4,.85,material("#8ee4bc",.20),18);tank.position.set(-1.12+j*.85,.73,-.63);group.add(tank);const top=cylinder(.38,.38,.08,material("#e0d39a",.3));top.position.set(-1.12+j*.85,1.18,-.63);group.add(top);}
  const pipe=cylinder(.10,.10,2.4,material("#61e1b7",.4));pipe.rotation.x=Math.PI/2;pipe.position.set(0,.52,1);group.add(pipe);
 }else if(t.factionId==="minerals"){
  const ore=new T.Mesh(new T.DodecahedronGeometry(.62),material("#8f76dd",.34));ore.position.set(-1.05,.71,-.45);group.add(ore);
  for(let j=0;j<3;j++){const mine=box(.3,.45+j*.26,.35,material("#d2a9e5",.24));mine.position.set(.82+j*.25,.5+j*.12,-.65+j*.42);group.add(mine);}
 }else{
  const booth=box(.77,.62,.70,material("#ffb970",.32));booth.position.set(-.98,.7,-.50);group.add(booth);
  const barrier=box(2,.07,.11,material("#ffc88a",.6));barrier.position.set(.5,.73,1);barrier.rotation.y=.25;group.add(barrier);
  for(let j=0;j<3;j++){const banana=ball(.19,material("#ffbf5a",.6));banana.position.set(-1+j*.33,.55,1.06);group.add(banana);}
 }
 const display=t.isAI?`${t.name.replace(/ \[AI\]$/," ").trim().split(" ")[0]} [AI]`:t.short;
 const label=makeLabel(display,t.color);label.position.set(0,3.5,-.35);group.add(label);
 if(t.isAI){const bot=new T.Mesh(new T.OctahedronGeometry(.28),material("#f2d185",.85));bot.position.set(1.48,1.3,.75);group.add(bot);
 const halo=new T.Mesh(new T.TorusGeometry(.53,.045,8,26),new T.MeshBasicMaterial({color:0xffc85d}));halo.rotation.x=Math.PI/2;halo.position.set(1.48,1.04,.75);group.add(halo);}

 const crowd=new T.Group();crowd.position.set(0,0,0);group.add(crowd);
 const agents=[];for(let j=0;j<11;j++){const red=material(j<8?"#fc6478":"#ffcc66",.45);const b=ball(.14,red);const ang=(j/11)*Math.PI*2;const radial=.96+(j%3)*.18;b.position.set(Math.sin(ang)*radial,.63+Math.sin(j)*.05,Math.cos(ang)*radial);crowd.add(b);agents.push(b);}
 crowd.visible=!!t.strike;
 group.userData={teamIndex:t.index,hub:tower,antenna,crowd,agents,color:c,base};return group;
}
function routePath(i){const [x,z]=FACTION_POS[i%4];const from=new T.Vector3(x*.77,.43,z*.77),mid=new T.Vector3(x*.33,.24,z*.28),end=new T.Vector3(0,.26,0);return new T.CatmullRomCurve3([from,mid,end]);}
const world={};
world.mountHost=function(root,onTeamSelect){if(!root)return; if(world.host?.root===root)return;world.disposeHost();let ren;try{ren=renderer(root,true);}catch(e){root.innerHTML='<div class="world-loading">3D unavailable: the map artwork remains visible. Enable WebGL to interact.</div>';return;}
 const scene=baseScene(),ring=floor(scene);const camera=new T.PerspectiveCamera(44,1,.1,150);camera.position.set(13,13,17);camera.lookAt(0,.9,0);const hubs=new Map(),trucks=[],routes=[];
 const ground=new T.Group();scene.add(ground);
 for(let i=0;i<4;i++){const path=routePath(i);routes.push(path);const points=path.getPoints(40);const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0x4c8193,transparent:true,opacity:.75}));scene.add(line);for(let j=0;j<2;j++){const vehicle=box(.25,.20,.44,material(i===0?"#83cfff":i===1?"#5edab7":i===2?"#b19aff":"#f9ae68",.32));vehicle.position.copy(path.getPoint((i+j*.3)/5));scene.add(vehicle);trucks.push({mesh:vehicle,path,offset:j*.47,speed:.05+(i*.008)});}}
 const ray=new T.Raycaster(),mouse=new T.Vector2();let yaw=0,tilt=.68,dist=20,drag=false,pt=null,down=null;
 function size(){if(!root.isConnected)return;const w=Math.max(100,root.clientWidth),h=Math.max(100,root.clientHeight);ren.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const obs=new ResizeObserver(size);obs.observe(root);size();
 function cameraUpdate(){const a=yaw+.7;camera.position.set(dist*Math.sin(a)*Math.cos(tilt),dist*Math.sin(tilt),dist*Math.cos(a)*Math.cos(tilt));camera.lookAt(0,.85,0);}
 cameraUpdate();const onDown=e=>{drag=true;pt=[e.clientX,e.clientY];down=[e.clientX,e.clientY];root.setPointerCapture?.(e.pointerId);};
 const onMove=e=>{if(!drag)return;const dx=e.clientX-pt[0],dy=e.clientY-pt[1];yaw-=dx*.006;tilt=clamp(tilt+dy*.004,.35,1.26);pt=[e.clientX,e.clientY];cameraUpdate();};
 const onUp=e=>{if(!drag)return;drag=false;if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;const rect=root.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects([...hubs.values()],true);if(hit.length){let obj=hit[0].object;while(obj.parent&&!Number.isInteger(obj.userData.teamIndex))obj=obj.parent;if(Number.isInteger(obj.userData.teamIndex))onTeamSelect?.(obj.userData.teamIndex);}};
 const onWheel=e=>{e.preventDefault();dist=clamp(dist+Math.sign(e.deltaY)*1.1,11,31);cameraUpdate();};
 root.addEventListener("pointerdown",onDown);root.addEventListener("pointermove",onMove);root.addEventListener("pointerup",onUp);root.addEventListener("wheel",onWheel,{passive:false});
 let running=true,frame=0,last=0;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 function draw(ms){if(!running)return;frame=requestAnimationFrame(draw);if(document.hidden||(!reduced&&ms-last<28))return;last=ms;
 if(!reduced){ring.rotation.z+=.004;for(const item of trucks){const v=(ms*.001*item.speed+item.offset)%1;item.mesh.position.copy(item.path.getPoint(v));const tangent=item.path.getTangent(v);item.mesh.rotation.y=Math.atan2(tangent.x,tangent.z);}for(const group of hubs.values()){const crowd=group.userData.crowd;if(crowd.visible){crowd.rotation.y+=.0015;for(let i=0;i<group.userData.agents.length;i++){group.userData.agents[i].position.y=.60+Math.sin(ms*.005+i)*.13;}}}}
 ren.render(scene,camera);}
 frame=requestAnimationFrame(draw);world.host={root,scene,ren,camera,hubs,trucks,ground,obs,handlers:[onDown,onMove,onUp,onWheel],stop:()=>{running=false;cancelAnimationFrame(frame);}};};
world.updateHost=function(teams){const host=world.host;if(!host)return;for(const t of teams||[]){if(t.index>=32)continue;let group=host.hubs.get(t.index);if(!group){group=district(t.index,t);host.ground.add(group);host.hubs.set(t.index,group);}const n=teams?.length||1;
 if(n>4){const cols=Math.ceil(Math.sqrt(n*1.32)),rows=Math.ceil(n/cols);const col=t.index%cols,row=Math.floor(t.index/cols);const cellW=11.7/cols,cellZ=8.4/rows;const x=-5.85+cellW*(col+.5),z=-4.2+cellZ*(row+.5);group.position.set(x,0,z);const k=Math.min(.94,cellW/3.8,cellZ/3.1);group.scale.setScalar(k);}
 const m=t.resources||{};group.userData.hub.scale.y=clamp(.6+(m.capital||0)*.16,.65,2);group.userData.hub.position.y=.82+.85*(group.userData.hub.scale.y-.6);group.userData.crowd.visible=!!(t.strike||t.crisis);group.userData.base.material.emissiveIntensity=t.strike?.5:.1;
 group.userData.antenna.material.emissiveIntensity=t.strike?.9:.3;
 }
 for(const [id,g]of host.hubs)if(!teams?.some(t=>t.index===id)){host.ground.remove(g);host.hubs.delete(id);}
};
world.disposeHost=function(){const h=world.host;if(!h)return;h.stop();h.obs.disconnect();const [down,move,up,wheel]=h.handlers;h.root.removeEventListener("pointerdown",down);h.root.removeEventListener("pointermove",move);h.root.removeEventListener("pointerup",up);h.root.removeEventListener("wheel",wheel);h.ren.dispose();h.ren.domElement.remove();world.host=null;};
world.mountEmblem=function(root){if(!root||world.emblem?.root===root)return;world.disposeEmblem();let ren;try{ren=renderer(root,false);}catch{return;}const scene=baseScene();scene.fog=null;const camera=new T.PerspectiveCamera(46,1,.1,30);camera.position.set(0,0,6.2);
 const group=new T.Group();scene.add(group);const core=new T.Mesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:0x4cdca8,roughness:.3,metalness:.55,emissive:0x245744,emissiveIntensity:.4}));group.add(core);
 const ring1=new T.Mesh(new T.TorusGeometry(1.62,.045,8,48),new T.MeshBasicMaterial({color:0xf4c777}));ring1.rotation.x=.78;group.add(ring1);
 const ring2=new T.Mesh(new T.TorusGeometry(1.3,.036,8,48),new T.MeshBasicMaterial({color:0x5cdbff}));ring2.rotation.y=.78;group.add(ring2);
 const obs=new ResizeObserver(()=>{if(!root.isConnected)return;const w=Math.max(root.clientWidth,50),h=Math.max(root.clientHeight,50);ren.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});obs.observe(root);ren.setSize(Math.max(root.clientWidth,50),Math.max(root.clientHeight,50),false);
 let active=true,frame=0,last=0;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 function animate(now){if(!active)return;frame=requestAnimationFrame(animate);if(document.hidden||(!reduced&&now-last<45))return;last=now;if(!reduced){group.rotation.y+=.012;ring1.rotation.z+=.008;ring2.rotation.z-=.008;}ren.render(scene,camera);}frame=requestAnimationFrame(animate);world.emblem={root,ren,obs,core,stop:()=>{active=false;cancelAnimationFrame(frame);}};};
world.updateEmblem=function(t){if(!t||!world.emblem)return;const c=color(t.color);world.emblem.core.material.color.copy(c);world.emblem.core.material.emissive.copy(c);};
world.disposeEmblem=function(){const e=world.emblem;if(!e)return;e.stop();e.obs.disconnect();e.ren.dispose();e.ren.domElement.remove();world.emblem=null;};
window.CEVWorld=world;window.dispatchEvent(new Event("cevworld:ready"));
})();
