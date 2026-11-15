import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import translations from './ru.json';

type Language = 'kk' | 'ru';
type LanguageContextValue = {language:Language; setLanguage:(language:Language)=>void; t:(text:string)=>string};
const LanguageContext = createContext<LanguageContextValue | null>(null);
const russian: Record<string,string> = translations;
const kazakh = Object.fromEntries(Object.entries(russian).map(([kk,ru])=>[ru,kk]));
export function LanguageProvider({children}:{children:ReactNode}) {
 const [language,setLanguage] = useState<Language>(()=>{try{return localStorage.getItem('lab-language')==='ru'?'ru':'kk'}catch{return 'kk'}});
 useEffect(()=>{document.documentElement.lang=language;document.title=language==='ru'?'Микромир — виртуальная лаборатория микробиологии':'Микроәлем — виртуалды микробиология зертханасы';try{localStorage.setItem('lab-language',language)}catch{/* Storage is optional. */}},[language]);
 const value = useMemo(()=>({language,setLanguage,t:(text:string)=>language==='ru'?(russian[text] ?? text):(russian[text] !== undefined ? text : (kazakh[text] ?? text))}),[language]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error('LanguageProvider is missing');return value}
