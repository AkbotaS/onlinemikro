import {useLanguage} from './LanguageContext';
import {ArrowLeft,ArrowRight,CheckSquare,FlaskConical,Microscope,MessageCircle} from 'lucide-react';

type Props={mode:'tasks'|'assistant';onBack:()=>void;onWork:()=>void;onWorkTwo:()=>void;onMicroscope:()=>void};
export default function QuickPage({mode,onBack,onWork,onWorkTwo,onMicroscope}:Props){
 const {t}=useLanguage();
 const tasks=mode==='tasks';
 return <section className="quick-page">
  <button className="back-button" onClick={onBack}><ArrowLeft size={16}/>{t("Басты бетке оралу")}</button>
  <div className="quick-page-heading"><span className="quick-page-icon">{tasks?<CheckSquare size={25}/>:<MessageCircle size={25}/>}</span><div><h1>{tasks?t("Тапсырмалар"):t("Жи-көмекші")}</h1></div></div>
  {tasks?<div className="quick-task-list"><article className="quick-task-card"><span className="quick-task-number">01</span><div className="quick-task-copy"><h2>{t("Ауыз қуысындағы микрофлораны қарау")}</h2><p>{t("Оқу препаратын микроскоппен бақылап, байқалған пішіндерді сипаттаңыз.")}</p></div><button className="rail-cta" onClick={onWork}>{t("Жұмысты бастау")} <ArrowRight size={15}/></button></article><article className="quick-task-card"><span className="quick-task-number">02</span><div className="quick-task-copy"><h2>{t("Микроорганизмдердің жіктелуі мен жүйеленуі")}</h2><p>{t("Жұғын дайындау, қарапайым бояу және микроскоптау техникасы.")}</p></div><button className="rail-cta" onClick={onWorkTwo}>{t("Жұмысты бастау")} <ArrowRight size={15}/></button></article></div>:<article className="quick-assistant-card"><div className="assistant-glow"><MessageCircle size={35}/></div><div><h2>{t("Қадамдап зерттеңіз")}</h2><p>{t("Қазір екі зертханалық сабақ пен виртуалды микроскоп қолжетімді. Қажетті бөлімді ашып, жұмысты орындаудан бастаңыз.")}</p><div className="quick-actions"><button className="rail-cta" onClick={onWork}><FlaskConical size={15}/>{t("Зертханалық жұмыс")}<ArrowRight size={15}/></button><button className="outline-button" onClick={onMicroscope}><Microscope size={15}/>{t("Микроскопты ашу")}</button></div></div></article>}
 </section>
}
