const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=[100,200,300,500,1000,2000,4000,8000,16000,32000,64000,125000,250000,500000,1000000],AR=["أ","ب","ج","د"];
const ld=(k,d)=>{try{return{...d,...JSON.parse(localStorage[k])}}catch(e){return d}};
let S=ld("mw_s",{plays:0,best:0,ok:0,bad:0,cats:{},hist:[]}),C=ld("mw_c",{snd:1,tmr:0,voice:0}),g,ac,tid;
const sv=()=>{try{localStorage.mw_s=JSON.stringify(S);localStorage.mw_c=JSON.stringify(C)}catch(e){}};
const show=id=>{$$(".scr").forEach(e=>e.classList.toggle("on",e.id===id));$("#telegramFab").classList.toggle("visible",id==="home")};
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const rnd=(a,b)=>a+Math.random()*(b-a)|0,fmt=n=>n.toLocaleString("en")+" ج.م",wait=ms=>new Promise(r=>setTimeout(r,ms));
const prize=i=>i<0?0:P[Math.max(0,Math.min(14,Math.round(i*14/Math.max(1,g.n-1))))];
const safes=()=>g.n<3?[]:[Math.floor(g.n/3)-1,Math.floor(2*g.n/3)-1];
const tierName=t=>["","تمهيدي","متوسط","متقدم"][t]||"متقدم";
const hostIntro="مرحبًا بك. هنا لا قيمة للثقة وحدها؛ الإجابة هي التي تتحدث. أمامك تحدٍّ يتصاعد سؤالًا بعد سؤال. لنبدأ.";
function beep(f,d=.14){if(!C.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=.055;o.connect(v);v.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function say(text){["#hostText","#hostLine","#endLine"].forEach(s=>{const el=$(s);if(el)el.textContent=text});if(C.voice&&"speechSynthesis"in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ar-EG";u.rate=.92;u.pitch=.82;speechSynthesis.speak(u)}catch(e){}}}
const progressLines=[
"جيد. لقد تجاوزت البداية، لكن لا تعتبر ذلك إنجازًا بعد.",
"إجابة أخرى صحيحة. بدأت أرفع سقف توقعاتي.",
"أراقب اختياراتك… حتى الآن لم تخذل نفسك.",
"وصلنا إلى منطقة لا تنفع فيها الإجابات العشوائية.",
"أحسنت. سأسمح لنفسي بابتسامة صغيرة… لا أكثر.",
"الأسئلة أصبحت أثقل. خذ وقتك وفكّر.",
"هذا أداء يستحق الانتباه. لا تفسده بالتسرع.",
"اقتربت من المراحل الحاسمة. أعصابك الآن جزء من الاختبار.",
"بدأت أستعد للوقوف… لكن لا تجعلني أندم.",
"إجابة ممتازة. سأرتدي الزي الرسمي إذا حافظت على هذا المستوى.",
"أصبحت قريبًا جدًا. كل تفصيلة قد تصنع الفارق.",
"لم يبقَ الكثير. أريد إجابة تليق بمن وصل إلى هنا.",
"اقتربت من القمة. حتى التصفيق أصبح جاهزًا."
];
function progressLine(){if(g.i>=13)return"السؤال الأخير. سأقف الآن… لا تجعل هذه اللحظة بلا معنى.";return progressLines[Math.min(progressLines.length-1,Math.max(0,g.i-1))]}
const reactions={
wrongEasy:["يا لها من بداية… يبدو أن السؤال كان أذكى من الإجابة!","غلط! غلط! غلط! هل قرأت السؤال أم اكتفيت بالنظر إليه؟","كنت أتوقع الكثير، لكن ليس هذه الإجابة تحديدًا.","سأعتبر ما حدث بروفة… للأسف لا توجد إعادة.","إجابة جريئة. مؤسف أنها خاطئة."],
wrongHard:["يا للخسارة… كنت على بُعد خطوة من إجابة محترمة.","هذه إجابة واثقة جدًا… والثقة لا تغيّر الحقيقة.","سأصفّق للمحاولة، لا للإجابة. هناك فرق.","حتى أصعب الأسئلة لها إجابة صحيحة… وهذه لم تكن هي."],
rightEasy:["صحيحة. بداية هادئة، فلنرَ إن كنت ستصمد.","أحسنت. نقطة لك، ولا داعي للاحتفال بعد.","إجابة سليمة. يبدو أنك حضرت مستعدًا."],
rightMid:["ممتاز. بدأت أرى تركيزًا حقيقيًا.","إجابة في محلها. استمر بهذا الاتزان.","جيد جدًا. لا تترك الحماس يسبق التفكير."],
rightHard:["استثنائية! سأرتدي الزي الرسمي وأصفّق احترامًا لعظمة هذه الإجابة.","يا لها من إجابة! وقفة احترام وتصفيق مستحق.","هذا ليس تخمينًا… هذا مستوى يُرفع له القبّعـة. أحسنت.","أعترف بها: إجابة من العيار الثقيل. تصفيق!"],
rightFinal:["لقد وصلت إلى القمة. أقف احترامًا لهذا الأداء… تحية تليق بالفائز.","المليون لك! لحظة كهذه لا تمرّ بلا تحية وتصفيق.","أحسنت. لم تكن مجرد إجابات صحيحة؛ كان هذا استحقاقًا كاملًا."]
};
function choose(a){return a[rnd(0,a.length)]}
function populateCategories(){
 const counts={};Q.forEach(q=>counts[q[0]]=(counts[q[0]]||0)+1);
 $("#cat").innerHTML='<option value="">كل التصنيفات — أسئلة متنوعة</option>'+Object.keys(counts).sort((a,b)=>a.localeCompare(b,"ar")).map(c=>'<option value="'+c+'">'+c+' · '+counts[c]+' سؤالًا</option>').join("");
 $("#bankCount").textContent=Q.length.toLocaleString("ar")+" سؤالًا متاحًا في "+Object.keys(counts).length+" تصنيفًا";
 $("#cat").onchange=()=>{const n=$("#cat").value;$("#bankCount").textContent=n?counts[n]+" سؤالًا في تصنيف "+n:Q.length+" سؤالًا متاحًا في "+Object.keys(counts).length+" تصنيفًا"};
}
populateCategories();
$$("[data-m]").forEach(b=>b.onclick=()=>start(b.dataset.m));
$$("[data-l]").forEach(b=>b.onclick=()=>life(b.dataset.l));
$("#snd").checked=!!C.snd;$("#tmr").checked=!!C.tmr;$("#voice").checked=!!C.voice;
$("#snd").onchange=e=>{C.snd=+e.target.checked;sv()};
$("#tmr").onchange=e=>{C.tmr=+e.target.checked;sv()};
$("#voice").onchange=e=>{C.voice=+e.target.checked;sv();if(C.voice)say("تم تفعيل صوت مقدّم التحدّي.")};
say(hostIntro);show("home");
function pick(tier,cat){const unused=g.pool.filter(q=>!g.used.has(q)),same=unused.filter(q=>q[1]===tier),byCat=unused.filter(q=>!cat||q[0]===cat),category=byCat.filter(q=>q[1]===tier);const list=cat?(category.length?category:byCat):(same.length?same:unused);return list.length?list[rnd(0,list.length)]:null}
function start(mode){
 const cat=$("#cat").value,pool=Q.filter(q=>!cat||q[0]===cat),target=(mode==="quick"||mode==="pressure")?10:15,n=Math.min(target,pool.length);
 if(!n){say("لا توجد أسئلة في هذا التصنيف حاليًا.");return}
 g={m:mode,n,i:0,pool,cat,used:new Set(),L:{fifty:1,aud:1,fr:1},sel:null,dead:[],lock:0};
 show("game");$("#heartLabel").textContent=mode==="train"?"تدريب بلا خسارة":"قلب واحد · إجابة واحدة لكل سؤال";$("#heartLabel").previousElementSibling.style.visibility=mode==="train"?"hidden":"visible";
 say(mode==="pressure"?"بدأ اختبار تحت الضغط. أمامك "+n+" أسئلة، ولك 15 ثانية فقط لكل سؤال. لا تتردد.":"بدأ التحدّي. أمامك "+n+" سؤالًا. تذكّر: لكل سؤال إجابة واحدة، ولا مكان للمحاولة الثانية.");next();
}
function next(){g.tier=g.m==="challenge"?3:Math.min(3,Math.floor(g.i*3/g.n)+1);setQ(pick(g.tier,g.cat),true)}
function setQ(q,announce){if(!q){end("empty");return}g.q=q;g.used.add(q);g.o=sh([0,1,2,3]);g.cpos=g.o.indexOf(q[4]);g.sel=null;g.dead=[];g.lock=0;render();timer();if(announce&&g.i>0)say(progressLine())}
function render(){
 const q=g.q;$("#lvl").textContent="السؤال "+(g.i+1)+" / "+g.n;$("#pz").textContent=g.m==="train"?"تدريب":fmt(prize(g.i));$("#tierLabel").textContent=tierName(g.tier);
 $("#lad").innerHTML=Array.from({length:g.n},(_,i)=>'<span class="'+(i<g.i?"d":i===g.i?"c":"")+' '+(safes().includes(i)?"sf":"")+'">'+fmt(prize(i))+"</span>").join("");
 $("#qc").textContent=q[0]+"  /  "+tierName(q[1]);$("#qt").textContent=q[2];$("#info").innerHTML="";
 $("#opts").innerHTML=g.o.map((x,k)=>'<button data-letter="'+AR[k]+'" onclick="pickO('+k+')">'+q[3][x]+"</button>").join("");
 $$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);$("#lock").disabled=true;
}
const ob=()=>$$('#opts button');
function pickO(k){if(g.lock||g.dead.includes(k))return;g.sel=k;ob().forEach((b,i)=>b.classList.toggle("sel",i===k));$("#lock").disabled=false;beep(460,.06)}
function timer(){clearInterval(tid);$("#tm").textContent="";if(!C.tmr&&g.m!=="pressure")return;g.t=g.m==="pressure"?15:45;$("#tm").textContent=g.t+" ث";tid=setInterval(()=>{$("#tm").textContent=(--g.t)+" ث";if(g.t<=0){clearInterval(tid);ans(-1)}},1000)}
async function ans(k){
 if(g.lock)return;g.lock=1;clearInterval(tid);$("#lock").disabled=true;const b=ob(),ok=k===g.cpos;
 if(k>=0)b[k].classList.add(ok?"ok":"bad");b[g.cpos].classList.add("ok");b.forEach(x=>x.disabled=true);
 if(g.q[5])$("#info").textContent="تفسير الإجابة: "+g.q[5];
 beep(ok?900:145,.35);S[ok?"ok":"bad"]++;if(ok)S.cats[g.q[0]]=(S.cats[g.q[0]]||0)+1;sv();
 if(ok){const final=g.i===g.n-1;say(final?choose(reactions.rightFinal):g.tier===3?choose(reactions.rightHard):g.tier===2?choose(reactions.rightMid):choose(reactions.rightEasy))}
 else say(choose(g.tier===1?reactions.wrongEasy:reactions.wrongHard));
 await wait(ok?1450:1900);
 if(ok||g.m==="train"){if(g.i>=g.n-1)return end("win");g.i++;next()}else end("lose");
}
function lock(){if(g&&g.sel!==null)ans(g.sel)}
function quit(){if(g&&!g.lock)end("quit")}
async function end(kind){
 clearInterval(tid);let amount=0;if(kind==="win")amount=prize(g.n-1);else if(kind==="quit")amount=prize(g.i-1);else if(kind==="lose"){const s=safes().filter(x=>x<g.i);amount=s.length?prize(Math.max(...s)):0}if(g.m==="train")amount=0;
 S.plays++;S.best=Math.max(S.best,amount);S.hist.unshift({d:new Date().toLocaleDateString("ar"),p:amount,k:kind});S.hist=S.hist.slice(0,12);sv();
 const titles={win:"تستحق هذه الوقفة!",lose:"انتهت المواجهة",quit:"اخترت الانسحاب",empty:"انتهت الجولة"};
 const lines={win:choose(reactions.rightFinal),lose:"انتهت الجولة. كنت تملك قلبًا واحدًا، وقد استُخدم. لا بأس… عُد أكثر استعدادًا، فالسؤال القادم لن ينتظرك.",quit:"انسحبت قبل النهاية. أحيانًا يكون التوقف قرارًا حكيمًا، لكنني كنت أريد رؤية المزيد.",empty:"لا توجد أسئلة أخرى في هذا التصنيف."};
 $("#et").textContent=g.m==="train"?"انتهى التدريب":titles[kind]||titles.empty;$("#endKicker").textContent=kind==="win"?"إنجاز يُحترم":kind==="lose"?"قلب واحد. قرار واحد.":"نتيجة المواجهة";
 $("#ep").textContent=g.m==="train"?"أنهيت جولة التدريب. المعرفة تتراكم بالمحاولة والتعلّم.":(kind==="lose"?"الإجابة الصحيحة: "+g.q[3][g.q[4]]+" · ":"")+"رصيدك النهائي: "+fmt(amount);
 $("#endPrize").textContent=fmt(amount);show("end");say(g.m==="train"?"انتهى التدريب. أحسنت المحاولة.":lines[kind]||lines.empty);beep(kind==="win"?1050:250,.5);
}
function life(type){
 if(!g||g.lock||!g.L[type])return;const visible=[0,1,2,3].filter(k=>!g.dead.includes(k)),wrong=visible.filter(k=>k!==g.cpos);g.L[type]=0;$$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);
 if(type==="fifty"){sh(wrong).slice(0,2).forEach(k=>{g.dead.push(k);ob()[k].classList.add("x");ob()[k].disabled=true});say("حذفت إجابتين خاطئتين. بقي القرار لك، والإجابة لا تقبل التراجع.")}
 if(type==="aud"){const correct=g.tier===1?rnd(65,91):g.tier===2?rnd(43,72):rnd(25,57),rest=100-correct,vals={};vals[g.cpos]=correct;let left=rest;wrong.forEach((k,i)=>{const v=i===wrong.length-1?left:rnd(0,left+1);vals[k]=v;left-=v});$("#info").innerHTML=visible.map(k=>'<div class="bar">'+AR[k]+' <i style="width:'+vals[k]*2+'px"></i>'+vals[k]+'%</div>').join("");say("هذه نتيجة تصويت الجمهور. لا تنسَ أن الأكثرية ليست معصومة من الخطأ.")}
 if(type==="fr"){const confidence=g.tier===1?rnd(80,96):g.tier===2?rnd(55,81):rnd(35,66),k=Math.random()*100<confidence+8?g.cpos:wrong[rnd(0,wrong.length)];$("#info").textContent="صديقك يقول: أميل إلى الإجابة ("+AR[k]+"). نسبة ثقتي "+confidence+"٪.";say("صديقك أعطاك رأيه. القرار النهائي مسؤوليتك وحدك.")}
}
function stats(){const total=S.ok+S.bad,best=Object.entries(S.cats).sort((a,b)=>b[1]-a[1])[0];$("#sb").innerHTML="<p>عدد الجولات: "+S.plays+"</p><p>أعلى جائزة: "+fmt(S.best)+"</p><p>إجابات صحيحة: "+S.ok+" · خاطئة: "+S.bad+"</p><p>نسبة النجاح: "+(total?Math.round(S.ok/total*100):0)+"٪</p><p>أفضل تصنيف: "+(best?best[0]:"—")+"</p><p>آخر الجولات:</p>"+S.hist.map(h=>"<p>"+h.d+" — "+fmt(h.p)+"</p>").join("");show("st")}
function reset(){if(confirm("هل تريد حذف كل الإحصائيات؟")){S={plays:0,best:0,ok:0,bad:0,cats:{},hist:[]};sv();stats()}}
