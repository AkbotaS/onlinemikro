import {useState} from 'react';
import {ArrowLeft,ArrowRight,Bell,ChevronDown,Search} from 'lucide-react';
import type {Language} from './language';

type Props={onHome:()=>void;onSearch:(value:string)=>void;language:Language;onLanguageChange:(language:Language)=>void};
export default function SiteTopbar({onHome,onSearch,language,onLanguageChange}:Props){
 const [value,setValue]=useState('');const [notice,setNotice]=useState(false);const [profile,setProfile]=useState(false);
 const text=language==='ru'?{home:'На рабочий стол',search:'Найти оборудование',placeholder:'Поиск оборудования…',notifications:'Уведомления',empty:'Новых уведомлений пока нет.',profile:'Профиль',researcher:'Исследователь',mode:'Учебный режим',language:'Язык интерфейса'}:{home:'Жұмыс үстеліне оралу',search:'Құралдарды іздеу',placeholder:'Құралдарды іздеу…',notifications:'Хабарламалар',empty:'Әзірге жаңа хабарлама жоқ.',profile:'Профиль',researcher:'Зерттеуші',mode:'Оқу режимі',language:'Интерфейс тілі'};
 return <header className="home-topbar">
  <button className="topbar-back-home" onClick={onHome} aria-label={text.home} title={text.home}><ArrowLeft size={19}/></button>
  <form className="home-search" onSubmit={e=>{e.preventDefault();onSearch(value.trim())}}><Search size={22}/><input value={value} onChange={e=>setValue(e.target.value)} placeholder={text.placeholder} aria-label={text.search}/><button type="submit" aria-label={text.search}><ArrowRight size={17}/></button></form>
  <div className="home-top-actions">
   <div className="workspace-language" role="group" aria-label={text.language}>
    <button type="button" lang="kk" aria-label="Қазақ тілі" aria-pressed={language==='kk'} onClick={()=>onLanguageChange('kk')}>ҚАЗ</button>
    <button type="button" lang="ru" aria-label="Русский язык" aria-pressed={language==='ru'} onClick={()=>onLanguageChange('ru')}>РУС</button>
   </div>
   <div className="header-popover-wrap"><button className={'home-icon-button '+(notice?'selected':'')} onClick={()=>{setNotice(v=>!v);setProfile(false)}} aria-label={text.notifications} aria-expanded={notice}><Bell size={23}/></button>{notice&&<div className="header-popover"><b>{text.notifications}</b><p>{text.empty}</p></div>}</div>
   <div className="header-popover-wrap"><button className="home-profile-button" onClick={()=>{setProfile(v=>!v);setNotice(false)}} aria-label={text.profile} aria-expanded={profile}><span>{language==='ru'?'И':'З'}</span><ChevronDown size={14}/></button>{profile&&<div className="header-popover profile-popover"><b>{text.researcher}</b><p>{text.mode}</p><button onClick={()=>{setProfile(false);onHome()}}>{text.home}</button></div>}</div>
  </div>
 </header>
}
