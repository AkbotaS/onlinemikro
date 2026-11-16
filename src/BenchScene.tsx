import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Minus,Plus,RotateCcw,Move,ArrowUpRight} from 'lucide-react';
import {buildBench} from './benchModels';

export type BenchTarget='scope'|'catalog'|'tasks'|'assistant'|'lab'|'experiment'|'experiment2'|'guide';
type Props={onOpen:(target:BenchTarget)=>void;language:'kk'|'ru';activeTarget?:BenchTarget|null;onHover?:(target:BenchTarget|null)=>void};
const labels={
 kk:{scope:'Микроскоп',catalog:'Жұмыстар папкасы',tasks:'Тапсырмалар',assistant:'Оқу көмекшісі',lab:'Құрал-жабдықтар',experiment:'Зертханалық жұмыс 01',experiment2:'Зертханалық жұмыс 02',guide:'Анықтамалық'},
 ru:{scope:'Микроскоп',catalog:'Папка с работами',tasks:'Задания',assistant:'Учебный помощник',lab:'Оборудование',experiment:'Лабораторная работа 01',experiment2:'Лабораторная работа 02',guide:'Справочник'}
};
const targets:BenchTarget[]=['scope','experiment','experiment2','catalog','tasks','guide','lab'];
export default function BenchScene({onOpen,language,activeTarget=null,onHover}:Props){
 const host=useRef<HTMLDivElement>(null),canvasHost=useRef<HTMLDivElement>(null),markers=useRef(new Map<BenchTarget,HTMLButtonElement>());
 const focusedRef=useRef<BenchTarget|null>(null);
 const openRef=useRef(onOpen),hoverRef=useRef(onHover),highlightRef=useRef<(target:BenchTarget|null)=>void>(()=>{}),actionRef=useRef<(action:string)=>void>(()=>{});
 openRef.current=onOpen;hoverRef.current=onHover;
 const [fallback,setFallback]=useState(false),[hovered,setHovered]=useState<BenchTarget|null>(null);
 useEffect(()=>{highlightRef.current(activeTarget)},[activeTarget]);
 useEffect(()=>{
  const root=canvasHost.current;if(!root)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{setFallback(true);return}
  setFallback(false);const scene=new THREE.Scene();scene.background=new THREE.Color('#dce4d9');scene.fog=new THREE.Fog('#dce4d9',25,44);
  const camera=new THREE.PerspectiveCamera(36,1,.1,70);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;root.appendChild(renderer.domElement);
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.touchAction='none';canvas.style.width='100%';canvas.style.height='100%';
  scene.add(new THREE.HemisphereLight('#fff8e9','#6f8f81',2.5));const key=new THREE.DirectionalLight('#fff4da',3.2);key.position.set(-5,10,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:1,far:24});key.shadow.normalBias=.035;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
  const fill=new THREE.DirectionalLight('#b8dad6',1.2);fill.position.set(7,6,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:'#b4c7ba',roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.65;floor.receiveShadow=true;scene.add(floor);
  const objects=buildBench(scene,language);const controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableDamping=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;controls.dampingFactor=.12;controls.minPolarAngle=.43;controls.maxPolarAngle=1.11;controls.minAzimuthAngle=-.4;controls.maxAzimuthAngle=.65;controls.rotateSpeed=.5;controls.zoomSpeed=.7;controls.target.set(0,.5,0);controls.maxDistance=30;
  let baseDistance=15,frame=0,disposed=false,visible=true,teardown=()=>{};const projected=new THREE.Vector3();
  const render=()=>{
   frame=0;if(disposed||!visible)return;const moving=controls.update();renderer.render(scene,camera);
   objects.forEach(({target,anchor})=>{const marker=markers.current.get(target);if(!marker)return;projected.copy(anchor).project(camera);const x=(projected.x*.5+.5)*root.clientWidth,y=(-projected.y*.5+.5)*root.clientHeight;marker.style.left=`${Math.max(54,Math.min(root.clientWidth-54,x))}px`;marker.style.top=`${Math.max(32,Math.min(root.clientHeight-85,y))}px`;marker.style.visibility=projected.z>1?'hidden':'visible'});
   if(moving)requestRender();
  };
  function requestRender(){if(!frame&&!disposed&&visible)frame=requestAnimationFrame(render)}
  const reset=()=>{controls.target.set(0,.5,0);camera.position.set(baseDistance*.19,.5+baseDistance*.58,baseDistance*.79);controls.update();requestRender()};
  const resize=()=>{const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();baseDistance=Math.max(13,11.6/(2*Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect)*1.14);controls.minDistance=Math.max(8.5,baseDistance*.57);controls.maxDistance=baseDistance*1.25;reset()};
  controls.addEventListener('change',requestRender);const ro=new ResizeObserver(resize);ro.observe(root);resize();
  const highlighted:THREE.MeshStandardMaterial[]=[];const colors=new Map<THREE.MeshStandardMaterial,{color:THREE.Color;intensity:number}>();
  const highlight=(target:BenchTarget|null)=>{for(const m of highlighted){m.emissive.copy(colors.get(m)!.color);m.emissiveIntensity=colors.get(m)!.intensity}highlighted.length=0;colors.clear();if(target){const entry=objects.find(o=>o.target===target);entry?.group.traverse(child=>{const materials=(child as THREE.Mesh).material;if(!materials)return;for(const m of Array.isArray(materials)?materials:[materials])if(m instanceof THREE.MeshStandardMaterial&&!colors.has(m)){colors.set(m,{color:m.emissive.clone(),intensity:m.emissiveIntensity});highlighted.push(m);m.emissive.set('#2c7267');m.emissiveIntensity=.14}})}requestRender()};highlightRef.current=highlight;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();const pick=(event:PointerEvent)=>{const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(objects.map(o=>o.group),true)[0];if(!hit)return null;let item:THREE.Object3D|null=hit.object;while(item&&!item.userData.target)item=item.parent;return item?.userData.target as BenchTarget|null};
  let down:{x:number;y:number;id:number}|null=null,moved=false,pointerCount=0;
  let lastHover:BenchTarget|null=null;
  const hover=(nextTarget:BenchTarget|null)=>{const target=nextTarget??focusedRef.current;if(target===lastHover)return;lastHover=target;setHovered(target);hoverRef.current?.(target);highlight(target);canvas.style.cursor=target?'pointer':'grab'};
  const pointerDown=(e:PointerEvent)=>{pointerCount++;if(pointerCount===1){down={x:e.clientX,y:e.clientY,id:e.pointerId};moved=false}else moved=true};
  const pointerMove=(e:PointerEvent)=>{if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)moved=true;if(moved)hover(null)}else if(e.pointerType!=='touch')hover(pick(e))};
  const pointerUp=(e:PointerEvent)=>{pointerCount=Math.max(0,pointerCount-1);if(down?.id===e.pointerId&&!moved){const target=pick(e);if(target)openRef.current(target)}if(!pointerCount)down=null};
  const pointerCancel=()=>{pointerCount=0;down=null;moved=true;hover(null)};
  const pointerLeave=()=>{if(!down)hover(null)};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerCancel);canvas.addEventListener('pointerleave',pointerLeave);
  actionRef.current=(action:string)=>{if(action==='reset')return reset();if(action==='in'||action==='out'){const direction=camera.position.clone().sub(controls.target);const distance=THREE.MathUtils.clamp(direction.length()*(action==='in'?.85:1.18),controls.minDistance,controls.maxDistance);direction.setLength(distance);camera.position.copy(controls.target).add(direction)}else{const offset=camera.position.clone().sub(controls.target),sphere=new THREE.Spherical().setFromVector3(offset);if(action==='left')sphere.theta-=.12;if(action==='right')sphere.theta+=.12;if(action==='up')sphere.phi-=.08;if(action==='down')sphere.phi+=.08;sphere.theta=THREE.MathUtils.clamp(sphere.theta,controls.minAzimuthAngle,controls.maxAzimuthAngle);sphere.phi=THREE.MathUtils.clamp(sphere.phi,controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(offset.setFromSpherical(sphere))}controls.update();requestRender()};
  const contextLost=(e:Event)=>{e.preventDefault();setFallback(true);teardown()};canvas.addEventListener('webglcontextlost',contextLost);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&!document.hidden;if(visible)requestRender();else{cancelAnimationFrame(frame);frame=0}});observer.observe(root);
  const visibility=()=>{visible=!document.hidden;if(visible)requestRender()};document.addEventListener('visibilitychange',visibility);
  const cleanup=()=>{
   if(disposed)return;disposed=true;highlightRef.current=()=>{};actionRef.current=()=>{};cancelAnimationFrame(frame);ro.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);controls.removeEventListener('change',requestRender);controls.dispose();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerCancel);canvas.removeEventListener('pointerleave',pointerLeave);canvas.removeEventListener('webglcontextlost',contextLost);
   const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)geometries.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(material=>materials.add(material))});materials.forEach(m=>{for(const value of Object.values(m))if(value instanceof THREE.Texture)textures.add(value);m.dispose()});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());key.shadow.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  };teardown=cleanup;return cleanup;
 },[language]);
 const words=labels[language],ru=language==='ru';
 return <div className="bench-scene" ref={host} data-scene-state={fallback?'fallback':'ready'}>
  <div className="bench-canvas" ref={canvasHost}/>
  {fallback?<div className="bench-fallback"><span>◉</span><h3>{ru?'Ваш лабораторный стол':'Сіздің зертханалық үстеліңіз'}</h3><p>{ru?'3D недоступно на этом устройстве. Все материалы и инструменты доступны ниже.':'Бұл құрылғыда 3D қолжетімсіз. Барлық материалдар мен құралдар төменде қолжетімді.'}</p><div>{targets.map((target,i)=><button key={target} onClick={()=>onOpen(target)}><span>0{i+1}</span>{words[target]}<ArrowUpRight size={17}/></button>)}</div></div>:<>
   <div className="bench-hotspots" aria-label={ru?'Предметы лабораторного стола':'Зертханалық үстелдегі заттар'}>{targets.map((target,i)=><button key={target} ref={node=>{if(node)markers.current.set(target,node);else markers.current.delete(target)}} className={'bench-hotspot '+(hovered===target||activeTarget===target?'is-active':'')} style={{visibility:'hidden'}} onClick={()=>onOpen(target)} onFocus={()=>{focusedRef.current=target;setHovered(target);highlightRef.current(target);onHover?.(target)}} onBlur={()=>{focusedRef.current=null;setHovered(null);highlightRef.current(null);onHover?.(null)}} onPointerEnter={()=>{setHovered(target);highlightRef.current(target);onHover?.(target)}} onPointerLeave={()=>{const focused=focusedRef.current;setHovered(focused);highlightRef.current(focused);onHover?.(focused)}} aria-label={words[target]}><span className="bench-hotspot-number">0{i+1}</span><span className="bench-hotspot-label">{words[target]}<ArrowUpRight size={12}/></span></button>)}</div>
   <div className="bench-scene-tip"><Move size={15}/><span>{ru?'Потяните, чтобы осмотреть · Нажмите на предмет':'Қарау үшін сүйреңіз · Затты басыңыз'}</span></div>
   <div className="bench-scene-controls" role="group" aria-label={ru?'Управление видом: стрелки, +, − и Home':'Көріністі басқару: көрсеткілер, +, − және Home'} onKeyDown={e=>{const action:Record<string,string>={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset'};if(action[e.key]){e.preventDefault();actionRef.current(action[e.key])}}}>
    <button type="button" onClick={()=>actionRef.current('out')} aria-label={ru?'Отдалить':'Алыстату'} title={ru?'Отдалить (−)':'Алыстату (−)'}><Minus size={18}/></button>
    <button type="button" onClick={()=>actionRef.current('in')} aria-label={ru?'Приблизить':'Жақындату'} title={ru?'Приблизить (+)':'Жақындату (+)'}><Plus size={18}/></button>
    <button type="button" onClick={()=>actionRef.current('reset')} aria-label={ru?'Исходный вид':'Бастапқы көрініс'} title={ru?'Исходный вид (Home)':'Бастапқы көрініс (Home)'}><RotateCcw size={17}/></button>
   </div>
  </>}
 </div>
}
