import {useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,CheckCircle2,ChevronDown,ClipboardList,Microscope,ShieldCheck} from 'lucide-react';

type Props={onBack:()=>void;onMicroscope:()=>void};
type Section='overview'|'questions'|'practice'|'record';

const questions=[
 ['Микробиологиялық зертхана қалай ұйымдастырылады?','Жұмыс аймақтары таза және зерттеу аймақтарына бөлінеді; құрал-жабдық пен қалдықтарға арналған белгіленген орындар болады. Нақты тәртіпті зертхана нұсқаулығынан қараңыз.'],
 ['Зертханада жұмыс істеудің негізгі ережелері қандай?','Жеке қорғаныш құралдарын кию, үлгілерді белгілеу, жұмыс орнын ретімен ұстау, белгісіз материалды өз бетінше ашпау және жұмыстан кейін қолды өңдеу.'],
 ['Микроорганизмдер қалай жіктеледі?','Микроорганизмдерді жасушалық құрылысы, генетикалық және биохимиялық белгілері бойынша жүйелейді. Бұл сабақта бактериялардың пішіні мен орналасуы қарастырылады.'],
 ['Бактериялардың негізгі пішіндері мен орналасуы қандай?','Кокктар шар тәрізді; таяқша тәрізді бактериялар ұзынша; вибриондар иілген. Кокктар жеке, жұп, тізбек, шоғыр немесе топ болып орналасуы мүмкін.'],
 ['Жарық микроскопы не үшін қолданылады?','Жарық микроскопы жарықтың үлгі арқылы өтуін пайдаланып, боялған жасушалар мен микроорганизмдердің жалпы пішінін үлкейтіп көрсетеді.'],
 ['Иммерсиялық жүйе дегеніміз не?','100× иммерсиялық объектив пен иммерсиялық майды бірге қолданатын оптикалық жүйе. Майды тек тиісті объективке және нұсқаушының нұсқауымен қолданыңыз.'],
 ['Қарапайым бояу әдісінің мақсаты қандай?','Бір бояғыш арқылы жасушаны фоннан айқынырақ көрсетіп, пішіні мен орналасуын бақылауға көмектеседі. Ол микроорганизм түрін өздігінен анықтамайды.'],
];
const groups=[
 {title:'Шар тәрізді бактериялар · кокктар',forms:'Микрококктар · диплококктар · стрептококктар · стафилококктар · тетракокктар · сарциналар',examples:'Micrococcus — жеке орналасуы мүмкін; Neisseria gonorrhoeae және N. meningitidis — жұп; Streptococcus pyogenes — тізбек; Staphylococcus aureus — шоғыр. Медициналық мысалдар: гонорея, менингококк инфекциясы, пневмония және іріңді тері-жұмсақ тін инфекциялары. Тетракокктар мен сарциналар сабақта орналасу үлгісі ретінде қарастырылады.'},
 {title:'Таяқша тәрізді бактериялар',forms:'Тік таяқшалар · коккобациллалар · спора түзетін таяқшалар · шоқпар тәрізді және жіпше тәрізді пішіндер',examples:'Escherichia coli — ішек микрофлорасының бөлігі, кейбір штамдары ауру туғызады; Salmonella enterica серовар Typhi және Enteritidis — ішек инфекциялары; Shigella dysenteriae — дизентерия; Yersinia pestis — оба. Басқа мысалдар: Brucella (бруцеллез), Bordetella pertussis (көкжөтел), Bacillus anthracis (сібір түйнеме), Clostridium tetani/perfringens/botulinum (сіреспе, газды гангрена, ботулизм), Corynebacterium diphtheriae (дифтерия), Mycobacterium tuberculosis/leprae (туберкулез, алапес).'},
 {title:'Иілген бактериялар',forms:'Вибриондар · спириллалар · спирохеталар',examples:'Vibrio cholerae және V. eltor — тырысқақ қоздырғыштары; Spirillum minor — содоку ауруымен байланысты. Helicobacter pylori (бұрын Campylobacter pylori деп аталған) асқазан ауруларымен байланысты. Пішінін тек дайын демонстрациялық препараттан қарастырыңыз.'},
];

export default function LessonTwo({onBack,onMicroscope}:Props){
 const [section,setSection]=useState<Section>('overview');const [openQuestion,setOpenQuestion]=useState(-1);const [done,setDone]=useState<boolean[]>([false,false,false,false]);const [observation,setObservation]=useState('');const [conclusion,setConclusion]=useState('');
 const toggleDone=(n:number)=>setDone(v=>v.map((x,i)=>i===n?!x:x));
 return <section className="content-page lesson-two-page">
  <button className="back-link" onClick={onBack}><ArrowLeft size={15}/>Зертханалық жұмыстар</button>
  <div className="page-title lesson-two-title"><div><div className="kicker"><span/>ЗЕРТХАНАЛЫҚ САБАҚ · 02</div><h1>Микроорганизмдердің жіктелуі мен жүйеленуі. Жұғын дайындау техникасы. Қарапайым бояу. Микроскоптау техникасы</h1><p>Микробиологиялық зертхана ережелері, бактерия морфологиясы және микроскоппен бақылау негіздері.</p></div><span className="lab-meta-tag">Сабақ №2 · Теория және практика</span></div>
  <div className="lesson-two-objective"><BookOpen size={19}/><div><b>Сабақтың мақсаты</b><p>Микробиологиялық зертханада қауіпсіз жұмыс істеу ережелерін және зертханаішілік жұқтырудың алдын алу қағидаларын түсіну; жұғын-препаратты дайындау, қарапайым бояу және микроскоптау әдістерімен танысу.</p></div></div>
  <nav className="lesson-two-tabs" aria-label="Сабақ бөлімдері">{([['overview','Сабақ мазмұны'