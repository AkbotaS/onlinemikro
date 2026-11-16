import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createBenchMicroscope} from './benchMicroscope';
import type {BenchTarget} from './BenchScene';

type Language = 'kk'|'ru';
export type BenchObject = {target:BenchTarget; group:THREE.Group; anchor:THREE.Vector3};
const standard=(color:string,roughness=.48,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});

function mesh(g:THREE.Object3D, geometry:THREE.BufferGeometry, material:THREE.Material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function box(g:THREE.Object3D,w:number,h:number,d:number,m:THREE.Material,x=0,y=0,z=0,r=.04){return mesh(g,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m,x,y,z)}
function cylinder(g:THREE.Object3D,top:number,bottom:number,h:number,m:THREE.Material,x=0,y=0,z=0){return mesh(g,new THREE.CylinderGeometry(top,bottom,h,40),m,x,y,z)}
function labelTexture(title:string,subtitle:string,kind:'paper'|'cover'|'note'='paper'){
 const c=document.createElement('canvas');c.width=768;c.height=1024;const ctx=c.getContext('2d')!;
 ctx.fillStyle=kind==='cover'?'#21514f':kind==='note'?'#f5e6ad':'#fffdf2';ctx.fillRect(0,0,768,1024);
 ctx.strokeStyle=kind==='cover'?'#83a89d':'#b9c9be';ctx.lineWidth=2;ctx.strokeRect(48,48,672,928);
 ctx.fillStyle=kind==='cover'?'#cce1d5':'#32625e';ctx.font='500 24px Arial';ctx.fillText('ONLINE LABORATORY',82,120);
 ctx.fillStyle=kind==='cover'?'#fff9de':'#223e3d';ctx.font='bold 48px Arial';const words=title.split(' ');let line='',y=245;for(const word of words){if(ctx.measureText(line+word).width>590){ctx.fillText(line,82,y);line='';y+=65}line+=word+' '}ctx.fillText(line,82,y);
 ctx.font='24px Arial';ctx.fillStyle=kind==='cover'?'#d3e2d6':'#667d73';ctx.fillText(subtitle,82,y+65);
 ctx.strokeStyle=kind==='cover'?'#82a59b':'#b4c6bb';ctx.lineWidth=2;
 if(kind==='cover'){
  ctx.beginPath();ctx.arc(384,650,138,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(384,650,120,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<11;i++){const a=i*2.399;ctx.beginPath();ctx.ellipse(384+Math.sin(a)*80,650+Math.cos(a)*80,20,9,a,0,Math.PI*2);ctx.stroke()}
  ctx.font='20px Arial';ctx.fillText('MICROBIOLOGY • 01 — 02',204,890);
 }else{
  for(let i=0;i<8;i++){const yy=450+i*55;ctx.beginPath();ctx.moveTo(130,yy);ctx.lineTo(660-(i%3)*45,yy);ctx.stroke();ctx.strokeRect(83,yy-17,18,18)}
  ctx.font='bold 56px Arial';ctx.fillStyle='#3f726b';ctx.fillText(kind==='note'?'✓':'01 / 02',82,940);
 }
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function paperFace(g:THREE.Object3D,w:number,d:number,title:string,sub:string,kind:'paper'|'cover'|'note',height:number){const face=mesh(g,new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:labelTexture(title,sub,kind),roughness:.9}),0,height,0);face.rotation.x=-Math.PI/2;return face}
function tube(g:THREE.Object3D,x:number,z:number,liquid:string,teal:THREE.Material,metal:THREE.Material){
 const glass=new THREE.MeshPhysicalMaterial({color:'#d4edef',roughness:.1,metalness:.05,transparent:true,opacity:.24,depthWrite:false});
 cylinder(g,.105,.105,.84,glass,x,.63,z);mesh(g,new THREE.SphereGeometry(.105,24,12),glass,x,.21,z).scale.y=.8;
 cylinder(g,.086,.086,.31,standard(liquid,.22),x,.4,z);mesh(g,new THREE.SphereGeometry(.086,20,12),standard(liquid,.25),x,.24,z).scale.y=.6;
 cylinder(g,.115,.115,.045,metal,x,1.06,z);cylinder(g,.11,.11,.12,teal,x,1.11,z);
}
function flask(g:THREE.Object3D,x:number,z:number,scale:number,color:string,metal:THREE.Material){
 const vessel=new THREE.Group();g.add(vessel);vessel.position.set(x,0,z);vessel.scale.setScalar(scale);
 const points=[new THREE.Vector2(0,0),new THREE.Vector2(.3,0),new THREE.Vector2(.34,.06),new THREE.Vector2(.32,.17),new THREE.Vector2(.13,.67),new THREE.Vector2(.1,.72),new THREE.Vector2(.1,.98),new THREE.Vector2(.12,1),new THREE.Vector2(.12,1.04),new THREE.Vector2(.075,1.04),new THREE.Vector2(.075,.72),new THREE.Vector2(.28,.1),new THREE.Vector2(.27,.04),new THREE.Vector2(0,.04)];
 mesh(vessel,new THREE.LatheGeometry(points,48),new THREE.MeshPhysicalMaterial({color:'#d5e9e5',roughness:.15,metalness:.06,transparent:true,opacity:.3,depthWrite:false}));
 cylinder(vessel,.19,.285,.28,standard(color,.22),0,.19,0);cylinder(vessel,.125,.125,.04,metal,0,1.015,0);
 const markMat=standard('#6b9390',.8);for(let i=0;i<3;i++)box(vessel,.08,.012,.012,markMat,.1,.35+i*.1,.215-i*.037,.003);
}
export function buildBench(scene:THREE.Scene,language:Language):BenchObject[]{
const teal=standard('#356b67'),paper=standard('#fffdf2',.9),metal=standard('#a3b7b7',.28,.8),ink=standard('#263d40'),wood=standard('#b88753',.65);
 const objects:BenchObject[]=[];
 const object=(target:BenchTarget,x:number,z:number,anchor:[number,number,number],rotation=0)=>{const g=new THREE.Group();g.position.set(x,.25,z);g.rotation.y=rotation;g.userData.target=target;scene.add(g);objects.push({target,group:g,anchor:new THREE.Vector3(...anchor).add(g.position)});return g};
 // One continuous worktop with a fine bevel, warm edge and recessed steel frame.
 const desk=new THREE.Group();scene.add(desk);
 box(desk,11.8,.28,6.9,standard('#e7e4d5',.67),0,.08,0,.12);box(desk,11.68,.09,6.78,standard('#b0b9a9',.5),0,-.1,0,.04);
 box(desk,11.2,.18,6.32,standard('#3b5b58',.4,.2),0,-.24,0,.06);
 for(const x of [-5.15,5.15])for(const z of [-2.75,2.75])box(desk,.15,2.3,.15,metal,x,-1.45,z,.04);
 // Fine seams on the splash rail keep the tabletop itself free of visual clutter.
 box(desk,11.8,.16,.19,standard('#c2cec2',.4),0,.31,-3.32,.05);
 const scope=object('scope',.35,-.35,[0,2.75,.1],-.12);scope.add(createBenchMicroscope());
 // Folder full of laboratory material, with paper tabs and metal binding.
 const folder=object('catalog',-3.6,-1.8,[0,.16,.1],-.15);
 box(folder,2.05,.11,1.43,standard('#bf9770',.7),0,.06,0,.05);box(folder,.7,.08,.22,standard('#bf9770',.7),-.5,.06,-.78,.04);
 for(let i=0;i<4;i++)box(folder,1.82,.012,1.2,paper,.015*i,.13+i*.014,-.015*i,.009);
 const folderTop=paperFace(folder,1.75,1.12,language==='ru'?'Лабораторные работы':'Зертханалық жұмыстар','01 — 02 · MICROBIOLOGY','paper',.19);folderTop.rotation.z=.015;
 box(folder,.16,.025,.7,metal,-.85,.21,0,.01);
 // A real clipboard and slightly offset loose assignment sheet.
 const clipboard=object('experiment',-3.25,1,[0,.13,.15],.12);
 box(clipboard,1.9,.07,2.22,wood,0,.05,0,.08);box(clipboard,1.72,.018,2.03,paper,0,.1,.015,.025);
 paperFace(clipboard,1.7,2,language==='ru'?'Микрофлора полости рта':'Ауыз қуысының микрофлорасы',language==='ru'?'Лабораторная работа 01':'Зертханалық жұмыс 01','paper',.112);
 box(clipboard,.69,.06,.23,metal,0,.15,-.96,.025);box(clipboard,.42,.045,.08,ink,0,.19,-.94,.025);
 const pen=new THREE.Group();pen.position.set(1.15,.15,.13);pen.rotation.y=-.15;clipboard.add(pen);const barrel=cylinder(pen,.04,.04,1.35,teal);barrel.rotation.x=Math.PI/2;const nib=mesh(pen,new THREE.ConeGeometry(.04,.18,20),metal,0,0,.76);nib.rotation.x=Math.PI/2;box(pen,.016,.018,.4,metal,.04,.05,-.35,.006);
 // Culture dish and a labelled slide tray connect directly to lesson two.
 const cultures=object('experiment2',-.65,1.85,[0,.2,.05],-.15);
 const clear=new THREE.MeshPhysicalMaterial({color:'#d4eeea',roughness:.12,metalness:.1,transparent:true,opacity:.3,depthWrite:false});
 cylinder(cultures,.56,.56,.11,clear,-.2,.08,0);cylinder(cultures,.49,.49,.025,standard('#c1d0a4',.4),-.2,.065,0);cylinder(cultures,.57,.57,.025,clear,-.2,.15,0);
 for(let i=0;i<13;i++){const angle=i*2.399,r=.07+Math.sqrt(i/13)*.31;cylinder(cultures,.025+(i%3)*.009,.03,.014,standard(i%3?'#f3e5b6':'#d19e71',.65),-.2+Math.cos(angle)*r,.086,Math.sin(angle)*r)}
 box(cultures,.5,.06,.83,standard('#bfd0c8'),.7,.04,.02,.035);for(let i=0;i<3;i++){box(cultures,.36,.014,.16,clear,.7,.08,-.24+i*.24,.009);box(cultures,.11,.016,.14,paper,.82,.09,-.24+i*.24,.005)}
 // Lab notebook: the task list has a physical home on the desk.
 const notes=object('tasks',1.75,2,[0,.15,.1],-.12);
 box(notes,1.24,.14,1.55,standard('#d2ad62'),0,.07,0,.045);box(notes,1.15,.08,1.46,paper,.015,.14,0,.025);
 paperFace(notes,1.13,1.44,language==='ru'?'План работы':'Жұмыс жоспары',language==='ru'?'Задания и наблюдения':'Тапсырмалар мен бақылаулар','note',.185);
 for(let i=0;i<8;i++){const ring=mesh(notes,new THREE.TorusGeometry(.045,.012,6,12),metal,-.55,.18,-.6+i*.17);ring.rotation.y=Math.PI/2}
 // A substantial clothbound reference handbook with an inset foil border.
 const book=object('guide',3.95,1.1,[0,.24,.1],-.2);
 box(book,1.49,.3,1.95,paper,0,.18,0,.04);box(book,1.57,.055,2.03,teal,0,.025,0,.035);box(book,1.57,.065,2.03,teal,0,.355,0,.035);
 box(book,.12,.35,2.03,standard('#204e4c'),-.75,.19,0,.035);paperFace(book,1.48,1.92,language==='ru'?'Микробиология':'Микробиология',language==='ru'?'Лабораторный справочник':'Зертханалық анықтамалық','cover',.392);
 box(book,.12,.015,.45,standard('#b2894e'),.4,.15,1.13,.006);
 for(let i=0;i<8;i++)box(book,1.4,.004,.006,standard('#dedacc',.95),.01,.075+i*.032, .975,.001);
 // Sample station, glassware, and a restrained backdrop of reagent bottles.
 const samples=object('lab',3.35,-1.9,[0,1.15,0],-.06);
 box(samples,1.55,.11,.68,wood,0,.08,0,.035);
 const rackTop=new THREE.Shape();rackTop.moveTo(-.735,-.34);rackTop.lineTo(.735,-.34);rackTop.quadraticCurveTo(.775,-.34,.775,-.3);rackTop.lineTo(.775,.3);rackTop.quadraticCurveTo(.775,.34,.735,.34);rackTop.lineTo(-.735,.34);rackTop.quadraticCurveTo(-.775,.34,-.775,.3);rackTop.lineTo(-.775,-.3);rackTop.quadraticCurveTo(-.775,-.34,-.735,-.34);
 for(let i=0;i<5;i++){const hole=new THREE.Path();hole.absarc(-.54+i*.27,0,.12,0,Math.PI*2,true);rackTop.holes.push(hole)}
 const rackPlate=mesh(samples,new THREE.ExtrudeGeometry(rackTop,{depth:.07,bevelEnabled:false,curveSegments:20}),wood,0,.655,0);rackPlate.rotation.x=-Math.PI/2;
 for(const x of [-.66,.66])box(samples,.06,.55,.59,wood,x,.39,0,.015);
 for(let i=0;i<5;i++)tube(samples,-.54+i*.27,0,['#89b9b0','#c3ad6e','#7b9caa','#b29bb8','#9fba8c'][i],teal,metal);
 flask(samples,-1.25,-.25,1.1,'#9bbfb0',metal);flask(samples,1.23,.18,.85,'#b7a473',metal);
 // Folded wipes and a stainless tray finish the sample station.
 box(samples,1.12,.04,.72,metal,1.24,.03,-.65,.09);for(let i=0;i<3;i++)box(samples,.72,.02,.5,paper,1.25,.075+i*.02,-.65,.025);
 // Behind the objects: a quiet grid and a specimen shelf, never external imagery.
 const backdrop=new THREE.Group();scene.add(backdrop);
 box(backdrop,15,5.5,.15,standard('#cad8ce',.95),0,1.1,-5.3,.04);
 const seam=standard('#baccc1',.9);for(let i=-7;i<=7;i++)box(backdrop,.012,5.5,.015,seam,i,1.1,-5.21,.003);for(let i=-1;i<4;i++)box(backdrop,15,.012,.015,seam,0,i,-5.21,.003);
 box(backdrop,10,.09,.62,standard('#6b8a7e',.55),0,1.3,-4.86,.025);
 for(let i=0;i<6;i++){const x=-4.1+i*.43;const h=.4+(i%3)*.13;cylinder(backdrop,.11,.13,h,standard(i%2?'#c1d4c4':'#6b9487',.3),x,1.35+h/2,-4.86);cylinder(backdrop,.12,.12,.055,ink,x,1.38+h,-4.86);box(backdrop,.15,.14,.008,paper,x,1.37+h/2,-4.735,.008)}
 // Each selectable object owns its materials, so hovering never tints its neighbours.
 objects.forEach(({group})=>{const copies=new Map<THREE.Material,THREE.Material>();group.traverse(child=>{const m=child as THREE.Mesh;if(!m.material)return;const unique=(material:THREE.Material)=>{if(!copies.has(material))copies.set(material,material.clone());return copies.get(material)!};m.material=Array.isArray(m.material)?m.material.map(unique):unique(m.material)})});
 return objects;
}
