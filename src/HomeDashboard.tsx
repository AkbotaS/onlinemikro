import {ArrowRight,CheckSquare,FlaskConical,Microscope,Sparkles} from 'lucide-react';
import LabScene from './LabScene';

type Destination='home'|'catalog'|'scope'|'tasks'|'assistant'|'lab';
type Props={onOpen:(target:Destination)=>void;onSelect:(name:string,description:string)=>void;dropped:string[];onDrop:(id:string)=>void};

const cards:[Destination,string,string,typeof FlaskConical,string][]=[
 ['catalog','Зертханалық жұмыстар','Биология бойынша практикалық жұмыстар',FlaskConical,'01'],
 ['scope','Микроскоп','Оқу препаратын үлкейтіп қарау',Microscope,'02'],
 ['tasks','Тапсырмалар','Зертханалық жұмысты орындау',CheckSquare,'03'],
 ['assistant','Жи-көмекші','Оқу бойынша көмек алу',Sparkles,'04'],
];

export default function HomeDashboard({onOpen,onSelect,dropped,onDrop}:Props){
 return <div className="home-dashboard">
  <div className="home-content">
   <section className="home-hero">
    <div className="hero-copy"><h1>Online Laboratory</h1><p>Виртуалды зертханалық орта</p><span className="hero-rule"/></div>
    <div className="hero-scene"><LabScene onSelect={onSelect} dropped={dropped} onDrop={onDrop}/></div>
   </section>
   <section className="home-shortcuts" aria-label="Зертхана бөлімдері">
    {cards.map(([target,title,subtitle,Icon])=><button className="home-shortcut-card" key={target} aria-label={`${title}: ${subtitle}`} onClick={()=>onOpen(target)}><span className="shortcut-icon"><Icon size={55} strokeWidth={1.8}/></span><b>{title}</b><span className="shortcut-arrow"><ArrowRight size={23}/></span></button>)}
   </section>
   <div className="home-footer-note"><span className="live-dot"/>Оқу ортасы дайын <span>2 зертханалық сабақ қолжетімді</span></div>
  </div>
 </div>
}
