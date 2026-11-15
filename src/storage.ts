import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
export function readStored<T>(key:string,fallback:T):T {
 try {const raw=JSON.parse(localStorage.getItem(key)??'null');
 if(raw===null||typeof raw!==typeof fallback||Array.isArray(raw)!==Array.isArray(fallback))return fallback;
 if(Array.isArray(raw)&&Array.isArray(fallback)&&fallback.length&&raw.some(v=>typeof v!==typeof fallback[0]))return fallback;
 if(typeof raw==='number'&&!Number.isFinite(raw))return fallback;
 if(key==='lab1-step'&&(!Number.isInteger(raw)||raw<0||raw>10))return fallback;
 if(key==='lab1-objective'&&![4,10,40,100].includes(raw))return fallback;
 if(key==='lab1-focus'&&(raw<0||raw>100))return fallback;
 if(key==='lab2-section'&&!['overview','questions','practice','record'].includes(raw))return fallback;
 if(key==='lab-practice-answers'&&(!Array.isArray(raw)||raw.length!==3||raw.some((n,i)=>!Number.isInteger(n)||n< -1||n>(i===2?1:2))))return fallback;
 if(key==='lab2-done'&&(!Array.isArray(raw)||raw.length!==3))return fallback;
 return raw as T;
 }catch{return fallback}
}
export function useStored<T>(key:string,initial:T):[T,Dispatch<SetStateAction<T>>,boolean]{
 const [value,setValue]=useState<T>(()=>readStored(key,initial));const [failed,setFailed]=useState(false);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));setFailed(false)}catch{setFailed(true)}},[key,value]);
 return [value,setValue,failed];
}
export type Entry={title:string;date:string;observation:string;conclusion:string;id?:string;lesson?:number;score?:number};
export function journalEntries():Entry[]{return readStored<unknown[]>('micro_lab_journal',[]).filter((v):v is Entry=>!!v&&typeof v==='object'&&['title','date','observation','conclusion'].every(k=>typeof (v as Record<string,unknown>)[k]==='string'))}
export function saveEntry(entry:Entry):boolean{try{const entries=journalEntries();localStorage.setItem('micro_lab_journal',JSON.stringify([entry,...entries.filter(e=>e.id!==entry.id)]));return true}catch{return false}}
