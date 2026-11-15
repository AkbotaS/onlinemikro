import {useState} from 'react';
import {useLanguage} from './LanguageContext';
import {useStored} from './storage';
type Props={mode:'tasks'|'assistant';onBack:()=>void;onWork:()=>void;onWorkTwo:()=>void;onMicroscope:()=>void};
export default function QuickPage({mode,onBack,onWork,onMicroscope}:Props){
 const {language}=useLanguage();const l=(ru:string,kk:string)=>language==='ru'?ru:kk;
 const questions=[
 {q:l('Окуляр 10×, объектив 40×. Каково оптическое увеличение?','Окуляр 10×, объектив 40×. Оптикалық үлкейту қанша?'),a:['40×','50×','400×'],right:2,why:l('Увеличение окуляра умножают на увеличение объектива: 10 × 40 = 400.','Окуляр мен объективтің үлкейтулерін көбейтеді: 10 × 40 = 400.')},
 {q:l('Что помогает сделать изображение резким?','Кескінді анық көрсетуге не көмектеседі?'),a:[l('Фокусировка','Фокустау'),l('Смена названия препарата','Препараттың атауын өзгерту'),l('Перемещение окна','Терезені жылжыту')],right:0,why:l('Фокусировка регулирует резкость. Увеличение и резкость — разные настройки.','Фокустау кескіннің анықтығын реттейді. Үлкейту мен анықтық — бөлек баптаулар.')},
 {q:l('Можно ли определить вид микроорганизма только по форме?','Микроорганизмнің түрін тек пішіні арқылы анықтауға бола ма?'),a:[l('Да','Иә'),l('Нет, нужны дополнительные признаки','Жоқ, қосымша белгілер қажет')],right:1,why:l('Форма — один из признаков. Она позволяет описать наблюдение, но не установить вид.','Пішін — белгілердің бірі. Ол бақылауды сипаттайды, бірақ түрді анықтамайды.')}
 ];
 const [answers,setAnswers]=useStored<number[]>('lab-practice-answers',[-1,-1,-1]);const [checked,setChecked]=useState(false);
 const faqs=[
 [l('Как продолжить работу?','Жұмысты қалай жалғастыруға болады?'),l('Откройте ту же лабораторную работу. Шаги, ответы и заметки сохраняются автоматически в этом браузере.','Сол зертханалық жұмысты ашыңыз. Қадамдар, жауаптар және жазбалар осы браузерде автоматты сақталады.')],
 [l('Как получить чёткое изображение?','Анық кескінді қалай алуға болады?'),l('В микроскопе изменяйте фокусировку. Перетаскивайте изображение, чтобы рассмотреть другой участок.','Микроскопта фокустауды өзгертіңіз. Басқа аймақты көру үшін кескінді сүйреңіз.')],
 [l('Где найти результат?','Нәтижені қайдан табуға болады?'),l('Нажмите «Сохранить в журнал» в работе. Журнал доступен в меню; записи можно распечатать или сохранить в PDF.','Жұмыста «Журналға сақтау» батырмасын басыңыз. Журнал мәзірде бар; жазбаларды басып шығаруға немесе PDF ретінде сақтауға болады.')],
 [l('Это настоящая микрофотография?','Бұл нақты микрофотосурет пе?'),l('Нет. Микроскоп показывает условную учебную модель. Она помогает изучать управление и описывать наблюдения.','Жоқ. Микроскоп шартты оқу моделін көрсетеді. Ол басқаруды үйренуге және бақылауларды сипаттауға көмектеседі.')]
 ];
 return <section className="study-page"><button className="back-button" onClick={onBack}>{l('На главную','Басты бетке')}</button><h1>{mode==='tasks'?l('Практика','Практика'):l('Справка','Анықтама')}</h1>
 {mode==='tasks'?<><p className="study-note">{l('Проверьте основные понятия перед лабораторной работой.','Зертханалық жұмыс алдында негізгі ұғымдарды тексеріңіз.')}</p>{questions.map((q,i)=><fieldset className="study-card" key={i}><legend>{i+1}. {q.q}</legend>{q.a.map((a,j)=><label className="practice-option" key={j}><input type="radio" name={'question-'+i} checked={answers[i]===j} onChange={()=>{setAnswers(v=>v.map((n,k)=>k===i?j:n));setChecked(false)}}/>{a}</label>)}{checked&&<p role="status" className={answers[i]===q.right?'feedback-good':'study-note'}>{answers[i]===q.right?l('Верно. ','Дұрыс. '):l('Попробуйте ещё раз. ','Қайта көріңіз. ')}{q.why}</p>}</fieldset>)}<div className="study-actions"><button className="primary-button" disabled={questions.some((_,i)=>answers[i]===undefined||answers[i]<0)} onClick={()=>setChecked(true)}>{l('Проверить ответы','Жауаптарды тексеру')}</button><button className="outline-button" onClick={()=>{setAnswers([-1,-1,-1]);setChecked(false)}}>{l('Повторить','Қайталау')}</button></div></>:<>{faqs.map(([q,a])=><details className="study-card" key={q}><summary>{q}</summary><p>{a}</p></details>)}<div className="study-actions"><button className="primary-button" onClick={onWork}>{l('Открыть работу','Жұмысты ашу')}</button><button className="outline-button" onClick={onMicroscope}>{l('Открыть микроскоп','Микроскопты ашу')}</button></div></>}
 </section>
}
