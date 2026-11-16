import {useEffect, useRef, useState} from 'react';
import {ArrowDownRight, ArrowRight, BookOpen, CheckSquare, FlaskConical, Microscope, Move, X} from 'lucide-react';
import BenchScene, {type BenchTarget} from './BenchScene';

type Destination = 'home'|'catalog'|'scope'|'tasks'|'assistant'|'lab'|'experiment'|'experiment2';
type Props = {onOpen:(target:Destination)=>void; language:'kk'|'ru'};

const copy = {
 kk: {
  eyebrow:'МИКРОБИОЛОГИЯ · ВИРТУАЛДЫ ПРАКТИКУМ', title:'Зерттеу осы жерден басталады.',
  intro:'Өз зертханаңызға қош келдіңіз. Үстелдегі нысанды таңдап, микроәлемді зерттеңіз.',
  ready:'Зертхана дайын', station:'ЖҰМЫС ОРНЫ', stationName:'Микробиология үстелі', explore:'Үстелді зерттеңіз',
  hint:'Нысанды таңдаңыз немесе бос кеңістікті сүйреп, үстелді айналдырыңыз.',
  desk:'ҮСТЕЛІҢІЗДЕ', lessons:'2 зертханалық сабақ', notes:'Оқу симуляциясы', open:'Ашу',
  scope:['Жарық микроскопы','Объективті таңдап, оқу препаратын окуляр арқылы зерттеңіз.'],
  catalog:['Зертханалық жұмыстар','Материалдар папкасында екі практикалық сабақ бар.'],
  experiment:['Зертханалық жұмыс №1','Ауыз қуысының микрофлорасы: бақылау, сипаттау және қорытынды.'],
  experiment2:['Зертханалық жұмыс №2','Микроорганизмдердің жіктелуі мен жүйеленуі.'],
  tasks:['Тапсырмалар','Сабақты таңдап, қадамдық тапсырмаларды орындаңыз.'],
  assistant:['Оқу көмекшісі','Сабақ пен микроскопқа арналған оқу бағыттары.'],
  lab:['Құрал-жабдықтар','Зертханалық құралдарды таңдап, олардың қызметімен танысыңыз.'],
  guide:['Зертхана анықтамалығы','Үстелді басқару, оқу реті және қауіпсіз жұмыс туралы.'],
  close:'Анықтамалықты жабу', guideLabel:'ЗЕРТХАНА АНЫҚТАМАЛЫҒЫ', guideTitle:'Алғашқы қадамдар',
  guideIntro:'Бұл — микробиологияны үйренуге арналған виртуалды орта. Үстелдегі әр белгі нақты оқу бөліміне апарады.',
  guideSections:[['01','Көріністі басқарыңыз','Бос жерді сүйреп айналдырыңыз. Дөңгелек, екі саусақ немесе + / − арқылы үлкейтіңіз. Көріністі қалпына келтіру түймесі үстелді орнына қайтарады.'],['02','Нысандарды ашыңыз','Микроскоп — окулярға, папка — сабақтарға, парақтар — жұмыстарға, құралдар — жабдықтар бөліміне апарады. Tab арқылы белгіні таңдап, Enter басыңыз.'],['03','Зерттеп, жазып алыңыз','Бірінші жұмыста бақылау мен қорытындыны толтырып, нәтижені журналға сақтаңыз. Жазбалар осы браузерде сақталады.'],['04','Үлгінің шектеулерін ескеріңіз','Кескін — оқу симуляциясы, нақты микрофотосурет емес. Ол медициналық диагноз қоюға немесе микроағза түрін дәл анықтауға арналмаған.']],
  lessonLanguage:'Оқу сабақтарының түпнұсқа тілі — қазақша.',
 },
 ru: {
  eyebrow:'МИКРОБИОЛОГИЯ · ВИРТУАЛЬНЫЙ ПРАКТИКУМ', title:'Здесь начинается исследование.',
  intro:'Добро пожаловать в вашу лабораторию. Выберите предмет на столе и загляните в микромир.',
  ready:'Лаборатория готова', station:'РАБОЧЕЕ МЕСТО', stationName:'Стол микробиолога', explore:'Исследуйте стол',
  hint:'Выберите предмет или потяните за свободное место, чтобы осмотреть стол.',
  desk:'НА ВАШЕМ СТОЛЕ', lessons:'2 лабораторных занятия', notes:'Учебная симуляция', open:'Открыть',
  scope:['Световой микроскоп','Выберите объектив и исследуйте учебный препарат через окуляр.'],
  catalog:['Лабораторные работы','В папке с материалами собраны два практических занятия.'],
  experiment:['Лабораторная работа №1','Микрофлора полости рта: наблюдение, описание и выводы.'],
  experiment2:['Лабораторная работа №2','Классификация и систематика микроорганизмов.'],
  tasks:['Задания','Выберите занятие и выполните пошаговые задания.'],
  assistant:['Учебный помощник','Отправные точки для работы с уроками и микроскопом.'],
  lab:['Оборудование','Изучайте лабораторные инструменты и их назначение.'],
  guide:['Справочник лаборатории','Управление столом, порядок работы и учебная безопасность.'],
  close:'Закрыть справочник', guideLabel:'СПРАВОЧНИК ЛАБОРАТОРИИ', guideTitle:'Первые шаги',
  guideIntro:'Это виртуальная среда для изучения микробиологии. Каждая метка на столе открывает учебный раздел.',
  guideSections:[['01','Осмотритесь','Потяните за свободное место для вращения. Колесо, два пальца или + / − меняют масштаб. Кнопка сброса возвращает стол в исходное положение.'],['02','Откройте предмет','Микроскоп ведёт к окуляру, папка — к занятиям, листы — к работам, инструменты — к оборудованию. Выбирайте метки клавишей Tab и открывайте через Enter.'],['03','Наблюдайте и записывайте','В первой работе заполните наблюдение и вывод, затем сохраните результат в журнал. Записи хранятся в этом браузере.'],['04','Помните об учебной модели','Изображение — условная симуляция, а не реальная микрофотография. Оно не предназначено для медицинской диагностики или точного определения вида микроорганизма.']],
  lessonLanguage:'Оригинальные учебные занятия доступны на казахском языке.',
 },
} as const;

export default function HomeDashboard({onOpen,language}:Props){
 const t=copy[language];
 const [active,setActive]=useState<BenchTarget|null>(null);
 const [guide,setGuide]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const previousFocus=useRef<HTMLElement|null>(null);
 const open=(target:BenchTarget)=>{if(target==='guide')setGuide(true);else onOpen(target)};
 useEffect(()=>{
  if(!guide)return;
  previousFocus.current=document.activeElement as HTMLElement;
  const el=dialog.current;
  el?.showModal();
  return ()=>{el?.close();previousFocus.current?.focus()};
 },[guide]);
 const selected=active?t[active]:null;
 return <div className="workspace-dashboard">
  <header className="workspace-heading">
   <div><p className="workspace-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="workspace-intro">{t.intro}</p></div>
   <span className="workspace-ready"><i/>{t.ready}</span>
  </header>
  <section className="workspace-bench" aria-label={t.stationName}>
   <div className="workspace-bench-heading"><span className="workspace-station-number">01</span><div><span>{t.station}</span><h2>{t.stationName}</h2></div><span className="workspace-model-label">3D / LIVE</span></div>
   <div className="workspace-scene"><BenchScene onOpen={open} language={language} activeTarget={active} onHover={setActive}/></div>
   <div className="workspace-context" aria-live="polite"><span className="workspace-context-icon">{active?<ArrowDownRight size={22}/>:<Move size={22}/>}</span><div><strong>{selected?selected[0]:t.explore}</strong><p>{selected?selected[1]:t.hint}</p></div>{active&&<button onClick={()=>open(active)}>{t.open}<ArrowRight size={16}/></button>}</div>
  </section>
  <nav className="workspace-desk-links" aria-label={t.desk}><span>{t.desk}</span>{([
   ['catalog',FlaskConical],['scope',Microscope],['tasks',CheckSquare],['guide',BookOpen],
   ['experiment',FlaskConical],['experiment2',FlaskConical],['lab',FlaskConical],
  ] as const).map(([target,Icon])=><button className={['experiment','experiment2','lab'].includes(target)?'workspace-mobile-link':undefined} key={target} onClick={()=>open(target)} onFocus={()=>setActive(target)} onBlur={()=>setActive(null)}><Icon size={18}/>{t[target][0]}<ArrowRight size={14}/></button>)}</nav>
  <footer className="workspace-footer"><span>{t.lessons}</span><span>{t.notes}</span><button onClick={()=>setGuide(true)}><BookOpen size={14}/>{t.guide[0]}</button></footer>
  {guide&&<dialog className="workspace-guide" ref={dialog} onCancel={e=>{e.preventDefault();setGuide(false)}} onClick={e=>{if(e.target===e.currentTarget)setGuide(false)}} aria-labelledby="workspace-guide-title">
   <div className="workspace-guide-top"><span>{t.guideLabel}</span><button autoFocus onClick={()=>setGuide(false)} aria-label={t.close}><X size={21}/></button></div>
   <BookOpen className="workspace-guide-symbol" size={34}/><h2 id="workspace-guide-title">{t.guideTitle}</h2><p>{t.guideIntro}</p>
   <div className="workspace-guide-sections">{t.guideSections.map(([n,title,text])=><section key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></section>)}</div>
   <p className="workspace-language-note">{t.lessonLanguage}</p><button className="workspace-guide-start" onClick={()=>onOpen('catalog')}>{t.catalog[0]}<ArrowRight size={17}/></button>
  </dialog>}
 </div>
}
