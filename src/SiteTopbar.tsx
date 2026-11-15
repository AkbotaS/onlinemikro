import {useLanguage} from './LanguageContext';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Bell,ChevronDown,Search} from 'lucide-react';

type Props={onHome:()=>void;onSearch:(value:string)=>void};
export default function SiteTopbar({onHome,onSearch}:Props){
 const {t,language,setLanguage}=useLanguage();
 const [value,setValue]=useState('');const [notice,setNotice]=useState(false);const [profile,setProfile]=useState(false);
 return <header className="home-topbar">
  <button className="topbar-back-home" onClick={onHome} aria-label={t("Басты бетке оралу")} title={t("Басты бетке оралу")}><ArrowLeft size={19}/></button>
  <form className="home-search" onSubmit={e=>{e.preventDefault();onSearch(value.trim())}}><Search size={22}/><input value={value} onChange={e=>setValue(e.target.value)} placeholder={t("Іздеу...")} aria-label={t("Іздеу")}/><button type="submit" aria-label={t("Іздеу")}><ArrowRight size={17}/></button></form>
  <div className="home-top-actions">
   <button className="home-language" type="button" onClick={()=>setLanguage(language==='kk'?'ru':'kk')} aria-label={language==='kk'?'Переключить язык на русский':'Қазақ тіліне ауысу'}>{language==='kk'?'RU':'ҚАЗ'}</button>
   <div className="header-popover-wrap"><button className={'home-icon-button '+(notice?'selected':'')} onClick={()=>{setNotice(v=>!v);setProfile(false)}} aria-label={t("Хабарламалар")}><Bell size={23}/><i/></button>{notice&&<div className="header-popover"><b>{t("Хабарламалар")}</b><p>{t("Әзірге жаңа хабарлама жоқ.")}</p></div>}</div>
   <div className="header-popover-wrap"><button className="home-profile-button" onClick={()=>{setProfile(v=>!v);setNotice(false)}} aria-label={t("Профиль")}><span>{t("З")}</span><ChevronDown size={14}/></button>{profile&&<div className="header-popover profile-popover"><b>{t("Зерттеуші")}</b><p>{t("Оқу режимі")}</p><button onClick={()=>{setProfile(false);onHome()}}>{t("Басты бетке оралу")}</button></div>}</div>
  </div>
 </header>
}
