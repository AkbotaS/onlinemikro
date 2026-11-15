import {useLanguage} from './LanguageContext';
import {journalEntries} from './storage';
type Props={onResume:(lesson:number)=>void};
export default function Journal({onResume}:Props){
 const {language}=useLanguage();const l=(ru:string,kk:string)=>language==='ru'?ru:kk;const entries=journalEntries();
 return <section className="study-page journal-page"><div className="study-heading"><h1>{l('Журнал наблюдений','Бақылау журналы')}</h1><button className="outline-button" onClick={()=>window.print()} disabled={!entries.length}>{l('Печать / PDF','Басып шығару / PDF')}</button></div><p className="study-note">{l('Записи хранятся в этом браузере. Для копии используйте печать или сохранение в PDF.','Жазбалар осы браузерде сақталады. Көшірме үшін басып шығарыңыз немесе PDF ретінде сақтаңыз.')}</p>
 {!entries.length?<div className="study-card"><h2>{l('Пока нет записей','Әзірге жазба жоқ')}</h2><p>{l('Сохраните наблюдения из лабораторной работы — они появятся здесь.','Зертханалық жұмыстағы бақылауларды сақтаңыз — олар осында пайда болады.')}</p><button className="primary-button" onClick={()=>onResume(1)}>{l('Открыть первую работу','Бірінші жұмысты ашу')}</button></div>:entries.map((e,i)=><article className="study-card journal-entry-card" key={e.id??i}><small>{e.date}</small><h2>{e.lesson===1?l('Микрофлора полости рта','Ауыз қуысының микрофлорасы'):e.lesson===2?l('Формы микроорганизмов','Микроорганизмдердің пішіндері'):e.title}</h2><h3>{l('Наблюдения','Бақылаулар')}</h3><p>{e.observation||'—'}</p><h3>{e.lesson===2?l('Сравнение форм','Пішіндерді салыстыру'):l('Вывод','Қорытынды')}</h3><p>{e.conclusion||'—'}</p><button className="outline-button" onClick={()=>onResume(e.lesson??1)}>{l('Открыть работу','Жұмысты ашу')}</button></article>)}
 </section>
}
