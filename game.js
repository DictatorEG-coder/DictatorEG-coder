const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=[100,200,300,500,1000,2000,4000,8000,16000,32000,64000,125000,250000,500000,1000000],AR=["أ","ب","ج","د"];
const ld=(k,d)=>{try{return{...d,...JSON.parse(localStorage[k])}}catch(e){return d}};
let S=ld("mw_s",{plays:0,best:0,ok:0,bad:0,cats:{},hist:[]}),C=ld("mw_c",{snd:1,tmr:0,voice:0}),g,ac,tid;
const sv=()=>{try{localStorage.mw_s=JSON.stringify(S);localStorage.mw_c=JSON.stringify(C)}catch(e){}};
const show=id=>$$(".scr").forEach(e=>e.classList.toggle("on",e.id==id));
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const rnd=(a,b)=>a+Math.random()*(b-a)|0,fmt=n=>n.toLocaleString("en")+" ج.م";
const beep=(f,d=.15)=>{if(!C.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=.07;o.connect(v);v.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const prize=i=>i<0?0:P[g.n>1?Math.round(i*14/(g.n-1)):14];
const safes=()=>g.n<3?[]:[Math.floor(g.n/3)-1,Math.floor(2*g.n/3)-1];
function say(text){
 ["#hostText","#hostLine","#endLine"].forEach(s=>{const el=$(s);if(el)el.textContent=text});
 if(C.voice&&"speechSynthesis"in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ar-EG";u.rate=.92;u.pitch=.82;speechSynthesis.speak(u)}catch(e){}}
}
const progressLines=[
 "جيد. لقد تجاوزت البداية، لكن الأسئلة القادمة لا ترحم المتردد.",
 "إجابة أخرى في رصيدك. لا تجعل النجاح المبكر يخدعك.",
 "بدأت أراقب اختياراتك… حافظ على تركيزك.",
 "اقتربت من منتصف الطريق. هنا تنتهي المصادفات ويبدأ الاختبار الحقيقي.",
 "أحسنت. لم يعد الانسحاب قرارًا سهلًا، أليس كذلك؟",
 "وصلت إلى منطقة الأسئلة الثقيلة. فكر قبل أن تلمس أي إجابة.",
 "كل إجابة صحيحة تقرّبك من القمة، وكل خطأ يكلّفك الكثير.",
 "أصبحت قريبًا من الجائزة الكبرى. لا تتعجل… فالثقة الزائدة عدوّك.",
 "لم يبقَ الكثير. أريد إجابة محسوبة، لا تخمينًا.",
 "أنت على بُعد خطوات من المليون. أثبت أن وصولك لم يكن صدفة.",
 "السؤال التالي قد يصنع الفارق بين المجد والعودة إلى الصفر.",
 "اقتربت جدًا… حتى الصمت الآن له وزن.",
 "خطوة واحدة تفصلك عن القمة. أرني ما لديك."
];
function progressLine(){const n=g.i;if(n>=13)return "السؤال الأخير… المليون أمامك. لا تسمح للتوتر أن يسرق منك اللحظة.";return progressLines[Math.min(12,Math.max(0,n-1))]}
const hostIntro="مرحبًا بك. أنا الديكتاتور، وسأرافقك حتى السؤال الأخير. هنا لا تُمنح المليون… بل تنتزعها بالإجابة الصحيحة. هل أنت مستعد؟";
$("#cat").innerHTML='<option value="">كل التصنيفات (متنوعة)</option>'+[...new Set(Q.map(q=>q[0]))].map(c=>'<option>'+c+'</option>').join("");
$$("[data-m]").forEach(b=>b.onclick=()=>start(b.dataset.m));
$$("[data-l]").forEach(b=>b.onclick=()=>life(b.dataset.l));
$("#snd").checked=!!C.snd;$("#tmr").checked=!!C.tmr;$("#voice").checked=!!C.voice;
$("#snd").onchange=e=>{C.snd=+e.target.checked;sv()};
$("#tmr").onchange=e=>{C.tmr=+e.target.checked;sv()};
$("#voice").onchange=e=>{C.voice=+e.target.checked;sv();if(C.voice)say("تم تفعيل صوت الديكتاتور.")};
say(hostIntro);
function pick(tier,cat){const c=g.pool.filter(q=>!g.used.has(q)),a=c.filter(q=>q[1]==tier&&(!cat||q[0]==cat)),b=c.filter(q=>q[1]==tier),r=a.length?a:b.length?b:c;return r.length?r[rnd(0,r.length)]:null}
function start(m){
 const cat=$("#cat").value,pool=Q.filter(q=>!cat||q[0]==cat),n=Math.min(m=="quick"?10:15,pool.length);
 if(!n){say("لا توجد أسئلة كافية في هذا التصنيف.");return}
 g={m,n,i:0,pool,cat,used:new Set(),L:{fifty:1,aud:1,fr:1,skip:1,x:m!="train"?1:0},sel:null,dead:[],lock:0};
 show("game");say("بدأ الاختبار. تذكّر: أول سؤال يفتح الباب، أما الأسئلة الأخيرة فتختبر ما وراء المعرفة.");next();
}
function next(){g.tier=g.m=="challenge"?(g.i<g.n/2?2:3):Math.min(3,Math.floor(g.i*3/g.n)+1);setQ(pick(g.tier,g.cat),true)}
function setQ(q,announce){
 if(!q){end("empty");return}
 g.q=q;g.used.add(q);g.o=sh([0,1,2,3]);g.cpos=g.o.indexOf(q[4]);g.sel=null;g.dead=[];g.lock=0;render();
 if(announce&&g.i>0)say(progressLine());
}
function render(){
 const q=g.q;$("#lvl").textContent="السؤال "+(g.i+1)+"/"+g.n;$("#pz").textContent=g.m=="train"?"تدريب":fmt(prize(g.i));
 $("#lad").innerHTML=Array.from({length:g.n},(_,i)=>'<span class="'+(i<g.i?"d":i==g.i?"c":"")+' '+(safes().includes(i)?"sf":"")+'">'+fmt(prize(i))+"</span>").join("");
 $("#qc").textContent=q[0]+" • المستوى "+q[1];$("#qt").textContent=q[2];$("#info").innerHTML="";
 $("#opts").innerHTML=g.o.map((x,k)=>'<button onclick="pickO('+k+')">'+AR[k]+") "+q[3][x]+"</button>").join("");
 $$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);$("#lock").disabled=true;
}
const ob=()=>$$(" #opts button");
function pickO(k){if(g.lock||g.dead.includes(k))return;g.sel=k;ob().forEach((b,i)=>b.classList.toggle("sel",i==k));$("#lock").disabled=false;beep(440,.07)}
function undo(){if(g.lock)return;g.sel=null;ob().forEach(b=>b.classList.remove("sel"));$("#lock").disabled=true}
function timer(){clearInterval(tid);$("#tm").textContent="";if(!C.tmr)return;g.t=45;$("#tm").textContent=g.t;tid=setInterval(()=>{$("#tm").textContent=--g.t;if(g.t<=0){clearInterval(tid);ans(-1)}},1000)}
async function ans(k){
 if(g.lock)return;g.lock=1;clearInterval(tid);$("#lock").disabled=true;
 const b=ob(),ok=k==g.cpos;
 if(k>=0)b[k].classList.remove("sel");
 if(k>=0)b[k].classList.add(ok?"ok":"bad");
 if(!ok&&g.L.x&&k>=0){g.L.x=0;g.dead.push(k);b[k].disabled=true;$("#info").textContent="فرصة أخيرة! تم استبعاد اختيارك. فكّر جيدًا قبل المحاولة الثانية.";say("تمهّل… لن أُنهي فرصتك بعد. أمامك محاولة أخيرة.");beep(200,.3);g.lock=0;g.sel=null;timer();return}
 b[g.cpos].classList.add("ok");beep(ok?880:150,.4);S[ok?"ok":"bad"]++;if(ok)S.cats[g.q[0]]=(S.cats[g.q[0]]||0)+1;sv();
 if(ok)say(g.i>=12?"إجابة صحيحة… لم يبقَ بينك وبين المليون إلا القليل.":"إجابة صحيحة. تابع، فالطريق لم ينتهِ.");
 else say("غلط! غلط! غلط! الإجابة لم تكن صحيحة. هذه هي الإجابة الصحيحة، وقد انتهت محاولتك.");
 await wait(ok?1100:1900);
 if(ok||g.m=="train"){if(g.i>=g.n-1)return end("win");g.i++;next()}else end("lose")
}
function lock(){if(g.sel!=null)ans(g.sel)}
function quit(){if(g.lock)return;end("quit")}
async function end(k){
 clearInterval(tid);let p=0;if(k=="win")p=prize(g.n-1);else if(k=="quit")p=prize(g.i-1);else if(k=="lose"){const s=safes().filter(x=>x<g.i);p=s.length?prize(Math.max(...s)):0}
 if(g.m=="train")p=0;
 S.plays++;S.best=Math.max(S.best,p);S.hist.unshift({d:new Date().toLocaleDateString("ar"),p,k});S.hist=S.hist.slice(0,10);sv();
 const lines={win:"لقد فعلتها. وصلت إلى المليون! لم يكن الحظ هو من قادك إلى هنا… بل تركيزك وثباتك. تحية من الديكتاتور، لقد استحققتها.",lose:"غلط! غلط! غلط! انتهت اللعبة، لكن لا تجعل خسارة جولة تهزمك. عُد عندما تكون مستعدًا لتحدٍ أصعب.",quit:"انسحبت قبل النهاية… قرارك محفوظ. أحيانًا يكون الانسحاب شجاعة، وأحيانًا يكون خوفًا. أنت وحدك تعرف أيهما كان.",empty:"انتهت الجولة."};
 $("#et").textContent=g.m=="train"?"انتهى التدريب":({win:"🏆 المليون لك!",lose:"انتهت اللعبة",quit:"اخترت الانسحاب",empty:"انتهت الجولة."}[k]||"انتهت الجولة");
 $("#ep").textContent=g.m=="train"?"أكملت جولة التدريب. استمر في تطوير معلوماتك.":(k=="lose"?"الإجابة الصحيحة: "+g.q[3][g.q[4]]+" — ":"")+"مبلغك: "+fmt(p);
 $("#endPrize").textContent=fmt(p);show("end");say(g.m=="train"?"انتهى التدريب. أحسنت المحاولة.":lines[k]||lines.empty);beep(k=="win"?1000:260,.5);
}
function life(l){
 if(g.lock||!g.L[l])return;const vis=[0,1,2,3].filter(k=>!g.dead.includes(k)),w=vis.filter(k=>k!=g.cpos);
 if(l=="skip"){const q=pick(g.tier,g.cat);if(!q)return $("#info").textContent="لا توجد أسئلة بديلة";g.L.skip=0;$$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);return setQ(q,false)}
 g.L[l]=0;$$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);
 if(l=="fifty"){sh(w).slice(0,2).forEach(k=>{g.dead.push(k);ob()[k].classList.add("x");ob()[k].disabled=true});say("حذفت إجابتين خاطئتين. أصبحت الاحتمالات أوضح، لكن القرار لك.")}
 if(l=="aud"){const c=g.tier==1?rnd(65,90):g.tier==2?rnd(45,70):rnd(30,55),left=100-c,r={};r[g.cpos]=c;let remain=left;w.forEach((k,j)=>{const v=j==w.length-1?remain:rnd(0,remain+1);r[k]=v;remain-=v});$("#info").innerHTML=vis.map(k=>'<div class="bar">'+AR[k]+' <i style="width:'+r[k]*2+'px"></i>'+r[k]+'%</div>').join("");say("الجمهور أدلى برأيه. تذكّر أن الجمهور قد يخطئ أيضًا.")}
 if(l=="fr"){const cf=g.tier==1?rnd(80,96):g.tier==2?rnd(55,80):rnd(35,65),k=Math.random()*100<cf+10?g.cpos:w[rnd(0,w.length)];$("#info").textContent="صديقك: أعتقد أن الإجابة ("+AR[k]+") — ثقتي "+cf+"%";say("اتصلت بصديقك. خذ رأيه، لكن لا تتخلَّ عن حكمك.")}
}
function stats(){
 const t=S.ok+S.bad,bc=Object.entries(S.cats).sort((a,b)=>b[1]-a[1])[0];
 $("#sb").innerHTML="<p>عدد الجولات: "+S.plays+"</p><p>أعلى جائزة: "+fmt(S.best)+"</p><p>صحيحة: "+S.ok+" • خاطئة: "+S.bad+"</p><p>نسبة النجاح: "+(t?Math.round(S.ok/t*100):0)+"%</p><p>أقوى تصنيف: "+(bc?bc[0]:"—")+"</p><p>آخر الجولات:</p>"+S.hist.map(h=>"<p>"+h.d+" — "+fmt(h.p)+"</p>").join("");
 show("st")
}
function reset(){if(confirm("حذف كل الإحصائيات؟")){S={plays:0,best:0,ok:0,bad:0,cats:{},hist:[]};sv();stats()}}
