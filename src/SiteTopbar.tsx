import {useState} from 'react';
import {ArrowLeft,ArrowRight,Bell,ChevronDown,Search} from 'lucide-react';

type Props={onHome:()=>void;onSearch:(value:string)=>void};
export default function SiteTopbar({onHome,onSearch}:Props){
 const [value,setValue]=useState('');const [notice,setNotice]=useState(false);const [profile,setProfile]=useState(false);
 return <header className="home-topbar">
  <button className="topbar-back-home" onClick={onHome} aria-label="Басты бетке оралу" title="Басты бетке оралу"><ArrowLeft size={19}/></button>
  <form className="home-search" onSubmit={e=>{e.preventDefault();onSearch(value.trim())}}><Search size={22}/><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Іздеу..." aria-label="Іздеу"/><button type="submit" aria-label="Іздеу"><ArrowRight size={17}/></button></form>
  <div className="home-top-actions">
   <div className="header-popover-wrap"><button className={'home-icon-button '+(notice?'selected':'')} onClick={()=>{setNotice(v=>!v);setProfile(false)}} aria-label="Хабарламалар"><Bell size={23}/><i/></button>{notice&&<div className="header-popover"><b>Хабарламалар</b><p>Әзірге жаңа хабарлама жоқ.</p></div>}</div>
   <div className="header-popover-wrap"><button className="home-profile-button" onClick={()=>{setProfile(v=>!v);setNotice(false)}} aria-label="Профиль"><span>З</span><ChevronDown size={14}/></button>{profile&&<div className="header-popover profile-popover"><b>Зерттеуші</b><p>Оқу режимі</p><button onClick={()=>{setProfile(false);onHome()}}>Басты бетке оралу</button></div>}</div>
  </div>
 </header>
}
