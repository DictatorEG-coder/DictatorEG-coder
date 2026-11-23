// مراجعة نوعية للمشتتات: إعادة بناء الخيارات المتكررة من نفس المجال، مع إصلاحات يدوية للحالات الواضحة.
(()=>{
 const norm=s=>String(s??"").normalize("NFKC").replace(/[أإآ]/g,"ا").replace(/[ًٌٍَُِّْـ]/g,"").replace(/\s+/g," ").trim().toLowerCase();
 const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
 const unique=a=>[...new Map(a.filter(x=>x!=null&&String(x).trim()).map(x=>[norm(x),String(x).trim()])).values()];
 const correct=q=>q[3]?.[q[4]];
 const collect=(test)=>unique(Q.filter(test).map(correct));
 const capitals=collect(q=>/عاصمة/.test(q[2])&&q[0]!=="مدن وعواصم");
 const authors=collect(q=>["أدب","كتب وروايات"].includes(q[0])&&/(مؤلف|من كتب|كتب رواية|صاحب رواية|صاحب كتاب|الشاعر|شاعر|معلقة)/.test(q[2]));
 const proverbs=collect(q=>q[0]==="أمثال شعبية");
 const riddles=collect(q=>q[0]==="ألغاز وحزازير");
 function alternatives(pool,answer,prompt,old){
  const blocked=new Set([norm(answer),...old.map(norm)]);
  let candidates=pool.filter(x=>!blocked.has(norm(x)));
  if(candidates.length<3)candidates=pool.filter(x=>norm(x)!==norm(answer));
  if(candidates.length<3)return old;
  const start=hash(prompt)%candidates.length, picked=[];
  for(let i=0;i<candidates.length&&picked.length<3;i++){const x=candidates[(start+i)%candidates.length];if(!picked.some(y=>norm(y)===norm(x)))picked.push(x);}
  return picked.length===3?picked:old;
 }
 const manual={
  "ما اسم التحول الذهبي الشهير في دراغون بول؟":["سوبر سايان 2","سوبر سايان 3","ألترا إنستنكت"],
  "ما اسم التحول الذهبي الذي ظهر به غوكو لأول مرة؟":["سوبر سايان 2","سوبر سايان 3","سوبر سايان 4"],
  "ما اسم بطل المحقق كونان الحقيقي؟":["هيجي هاتوري","كايتو كيد","كوغورو موري"],
  "ما اسم صديق غون القادم من عائلة زولديك؟":["كورابيكا","ليوريو","إيلومي زولديك"],
  "ما اسم بطل Dragon Ball؟":["سون غوهان","فيجيتا","بيكولو"],
  "ما اسم أخ غوكو؟":["فيجيتا","باردوك","سون غوهان"],
  "ما اسم بطل Jujutsu Kaisen؟":["ميغومي فوشيغورو","يوتا أوكوتسو","ساتورو غوجو"],
  "ما اسم معلم يوجي الأشهر؟":["كينتو نانامي","سوغورو غيتو","يوشينوبو غاكوغانجي"],
  "ما اسم بطل Vinland Saga؟":["أسكيلاد","كنوت","ثورز"],
  "ما اسم بطل Code Geass؟":["سوزاكو كورورغي","كالين شتاتفلد","شنزل إل بريطانيا"],
  "ما اسم التحول الذي ظهر به غوكو بشعر ذهبي لأول مرة؟":["سوبر سايان 2","سوبر سايان 3","ألترا إنستنكت"],
  "ما اسم بطل أنمي ون بيس؟":["رورونوا زورو","سانجي","ترافالغار لاو"],
  "ما اسم رفيق غون القادم من عائلة زولديك؟":["كورابيكا","ليوريو","إيلومي زولديك"],
  "ما اختصار الذاكرة للقراءة فقط؟":["RAM","SRAM","DRAM"],
  "ما مرادف كلمة «الوجيز»؟":["المطوّل","المفصّل","المسهب"],
  "ما نوع الهمزة في كلمة «أحمد»؟":["همزة وصل","همزة متوسطة","همزة متطرفة"],
  "ما الحرف الذي ينصب المبتدأ ويرفع الخبر؟":["كان","ليس","ليت"],
  "في أي رياضة تُستخدم كلمة «ضربة إرسال»؟":["الكرة الطائرة","الريشة الطائرة","كرة الطاولة"],
  "ما الرياضة التي تستخدم فيها عصا ومضربًا وكرة صغيرة على العشب؟":["الهوكي","الكريكيت","البيسبول"],
  "ما الرياضة التي يُستخدم فيها مصطلح كش مات؟":["الشطرنج السريع","الشطرنج الخاطف","الشطرنج"],
  "ما الرياضة التي يتنافس فيها السباحون في حوض؟":["كرة الماء","الغوص","السباحة الفنية"]
 };
 // أسئلة العواصم: كل المشتتات عواصم فعلية بدل تكرار ثلاث عواصم ثابتة.
 // أسئلة المؤلفين: أسماء كتّاب وشعراء من بنك الأدب نفسه.
 // الأمثال والألغاز: مشتتات من النوع نفسه، لا إجابات عشوائية مكررة.
 for(const q of Q){
  if(!Array.isArray(q)||!Array.isArray(q[3])||q[3].length!==4||!Number.isInteger(q[4]))continue;
  const answer=correct(q),old=q[3].filter((_,i)=>i!==q[4]);
  let wrong=null;
  if(manual[q[2]]) wrong=manual[q[2]];
  else if(["جغرافيا","عامة"].includes(q[0])&&/عاصمة/.test(q[2])) wrong=alternatives(capitals,answer,q[2],old);
  else if(["أدب","كتب وروايات"].includes(q[0])&&/(مؤلف|من كتب|كتب رواية|صاحب رواية|صاحب كتاب|الشاعر|شاعر|معلقة)/.test(q[2])) wrong=alternatives(authors,answer,q[2],old);
  else if(q[0]==="أمثال شعبية") wrong=alternatives(proverbs,answer,q[2],old);
  else if(q[0]==="ألغاز وحزازير") wrong=alternatives(riddles,answer,q[2],old);
  if(wrong&&wrong.length===3&&new Set([answer,...wrong].map(norm)).size===4){
   q[3]=[answer,...wrong];q[4]=0;
  }
 }
 // صياغة أدق لإزالة الالتباس النحوي بين إنّ وأنّ.
 const grammar=Q.find(q=>q[2]==="ما الحرف الذي ينصب المبتدأ ويرفع الخبر؟");
 if(grammar)grammar[2]="أيّ حرف ناسخ يُستعمل غالبًا لتوكيد الجملة الاسمية عند ابتدائها؟";
})();