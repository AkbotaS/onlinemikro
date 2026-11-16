import {useState} from 'react';
import {ArrowLeft,ArrowRight,Box,Microscope} from 'lucide-react';
import type {Language} from './language';

type Props={equipment:string[][];descriptions:Record<string,string>;query:string;language:Language;onHome:()=>void;onMicroscope:()=>void};
const russian:Record<string,[string,string]>={
 microscope:['Световой микроскоп','Увеличивает изображение учебного препарата для наблюдения за клетками и микроорганизмами.'],
 slide:['Предметное стекло','На стекле размещают исследуемый образец для наблюдения под микроскопом.'],
 cover:['Покровное стекло','Тонкое стекло накрывает образец и защищает препарат.'],
 loop:['Бактериологическая петля','Помогает перенести небольшое количество образца на предметное стекло.'],
 pipette:['Пипетка','Используется для переноса жидкости по каплям.'],
 tube:['Пробирка','Служит для хранения жидкостей и учебных биологических образцов.'],
 rack:['Штатив','Удерживает пробирки в устойчивом вертикальном положении.'],
 alcohol:['Флакон со спиртом','Ёмкость для лабораторного спиртового раствора.'],
 methylene:['Метиленовый синий','Краситель для подготовки окрашенного препарата.'],
 water:['Дистиллированная вода','Используется для осторожного промывания окрашенного препарата.'],
 saliva:['Образец слюны','Исследуемый материал первого учебного занятия.'],
 filter:['Фильтровальная бумага','Впитывает лишнюю жидкость у края препарата.'],
 burner:['Спиртовка','Источник пламени для тепловой фиксации мазка.'],
 oil:['Иммерсионное масло','Применяется с иммерсионным объективом 100×.'],
 petri:['Чашка Петри','Неглубокая лабораторная посуда для размещения и наблюдения образцов.'],
 tweezers:['Лабораторный пинцет','Помогает безопасно удерживать небольшие предметы и стёкла.'],
 container:['Контейнер для стёкол','Хранит предметные стёкла в чистоте и порядке.'],
};

export default function EquipmentCatalog({equipment,descriptions,query,language,onHome,onMicroscope}:Props){
 const [selected,setSelected]=useState('microscope');
 const ru=language==='ru';
 const title=(id:string,name:string)=>ru?russian[id]?.[0]||name:name;
 const matches=equipment.filter(([id,,name])=>`${name} ${russian[id]?.[0]||''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 const current=equipment.find(([id])=>id===selected)||equipment[0];
 return <section className="equipment-catalog" lang={language}>
  <button className="equipment-catalog-back" onClick={onHome}><ArrowLeft size={16}/>{ru?'На рабочий стол':'Жұмыс үстеліне оралу'}</button>
  <header><span>{ru?'ЛАБОРАТОРНЫЙ СПРАВОЧНИК':'ЗЕРТХАНА АНЫҚТАМАЛЫҒЫ'}</span><h1>{ru?'Оборудование лаборатории':'Зертхана құрал-жабдықтары'}</h1><p>{ru?'Выберите инструмент, чтобы узнать его назначение. Микроскоп открывается в отдельном режиме.':'Қызметін білу үшін құралды таңдаңыз. Микроскоп жеке режимде ашылады.'}</p></header>
  <div className="equipment-catalog-layout">
   <div className="equipment-catalog-results"><p className="equipment-catalog-count">{ru?'Найдено инструментов':'Табылған құралдар'}: {matches.length} / {equipment.length}{query&&<> · «{query}»</>}</p>
    <div className="equipment-catalog-list" aria-label={ru?'Лабораторные инструменты':'Зертханалық құралдар'}>{matches.map(([id,icon,name])=><button key={id} aria-pressed={selected===id} onClick={()=>setSelected(id)}><span aria-hidden="true">{icon}</span><span>{title(id,name)}</span><ArrowRight size={15}/></button>)}</div>
    {!matches.length&&<p className="equipment-catalog-empty" role="status">{ru?'Ничего не найдено. Попробуйте другое название на русском или казахском языке.':'Құрал табылмады. Қазақша не орысша басқа атаумен іздеп көріңіз.'}</p>}
   </div>
   <aside className="equipment-catalog-detail" aria-live="polite"><Box size={22}/><span>{ru?'ВЫБРАННЫЙ ИНСТРУМЕНТ':'ТАҢДАЛҒАН ҚҰРАЛ'}</span><h2>{title(current[0],current[2])}</h2><p>{ru?russian[current[0]]?.[1]||descriptions[current[0]]:descriptions[current[0]]}</p><button onClick={onMicroscope}><Microscope size={17}/>{ru?'Открыть микроскоп':'Микроскопты ашу'}<ArrowRight size={16}/></button></aside>
  </div>
 </section>
}
