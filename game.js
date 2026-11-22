const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=[100,200,300,500,1000,2000,4000,8000,16000,32000,64000,125000,250000,500000,1000000],AR=["أ","ب","ج","د"];
const ld=(k,d)=>{try{return{...d,...JSON.parse(localStorage[k])}}catch(e){return d}};
let S=ld("mw_s",{plays:0,best:0,ok:0,bad:0,cats:{},hist:[]}),C=ld("mw_c",{snd:1,tmr:0}),g,ac,tid;
const sv=()=>{try{localStorage.mw_s=JSON.stringify(S);localStorage.mw_c=JSON.stringify(C)}catch(e){}};
const show=id=>$$(".scr").forEach(e=>e.classList.toggle("on",e.id==id));
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const rnd=(a,b)=>a+Math.random()*(b-a)|0,fmt=n=>n.toLocaleString("en")+" ر";
const beep=(f,d=.15)=>{if(!C.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=.07;o.connect(v);v.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const prize=i=>i<0?0:P[g.n>1?Math.round(i*14/(g.n-1)):14];
const safes=()=>g.n<3?[]:[Math.floor(g.n/3)-1,Math.floor(2*g.n/3)-1];
$("#cat").innerHTML='<option value="">كل التصنيفات (متنوعة)</option>'+[...new Set(Q.map(q=>q[0]))].map(c=>`<option>${c}</option>`).join("");
$$("[data-m]").forEach(b=>b.onclick=()=>start(b.dataset.m));
$$("[data-l]").forEach(b=>b.onclick=()=>life(b.dataset.l));
$("#snd").checked=!!C.snd;$("#tmr").checked=!!C.tmr;
$("#snd").onchange=e=>{C.snd=+e.target.checked;sv()};$("#tmr").onchange=e=>{C.tmr=+e.target.checked;sv()};
function pick(tier,cat){const c=g.pool.filter(q=>!g.used.has(q)),a=c.filter(q=>q[1]==tier&&q[0]==cat),b=c.filter(q=>q[1]==tier),r=a.length?a:b.length?b:c;return r.length?r[rnd(0,r.length)]:null}
function start(m){const cat=$("#cat").value,pool=Q.filter(q=>!cat||q[0]==cat),n=Math.min(m=="quick"?10:15,pool.length);
 g={m,n,i:0,pool,cat,used:new Set(),L:{fifty:1,aud:1,fr:1,skip:1,x:m!="train"?1:0},sel:null,dead:[],lock:0};show("game");next()}
function next(){g.tier=g.m=="challenge"?(g.i<g.n/2?2:3):Math.floor(g.i*3/g.n)+1;setQ(pick(g.tier))}
function setQ(q){g.q=q;g.used.add(q);g.o=sh([0,1,2,3]);g.cpos=g.o.indexOf(q[4]);g.sel=null;g.dead=[];g.lock=0;render();timer()}
function render(){const q=g.q;$("#lvl").textContent=`السؤال ${g.i+1}/${g.n}`;$("#pz").textContent=g.m=="train"?"تدريب":fmt(prize(g.i));
 $("#lad").innerHTML=Array.from({length:g.n},(_,i)=>`<span class="${i<g.i?"d":i==g.i?"c":""} ${safes().includes(i)?"sf":""}">${fmt(prize(i))}</span>`).join("");
 $("#qc").textContent=q[0]+" • المستوى "+q[1];$("#qt").textContent=q[2];$("#info").innerHTML="";
 $("#opts").innerHTML=g.o.map((x,k)=>`<button onclick="pickO(${k})">${AR[k]}) ${q[3][x]}</button>`).join("");
 $$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);$("#lock").disabled=true}
const ob=()=>$$("#opts button");
function pickO(k){if(g.lock||g.dead.includes(k))return;g.sel=k;ob().forEach((b,i)=>b.classList.toggle("sel",i==k));$("#lock").disabled=false;beep(440,.07)}
function undo(){if(g.lock)return;g.sel=null;ob().forEach(b=>b.classList.remove("sel"));$("#lock").disabled=true}
function timer(){clearInterval(tid);$("#tm").textContent="";if(!C.tmr)return;g.t=45;$("#tm").textContent=g.t;tid=setInterval(()=>{$("#tm").textContent=--g.t;if(g.t<=0){clearInterval(tid);ans(-1)}},1e3)}
function lock(){if(g.sel!=null)ans(g.sel)}
async function ans(k){if(g.lock)return;g.lock=1;clearInterval(tid);$("#lock").disabled=true;const b=ob(),ok=k==g.cpos;
 if(k>=0)b[k].classList.remove("sel");if(k>=0)b[k].classList.add(ok?"ok":"bad");
 if(!ok&&k>=0&&g.L.x){g.L.x=0;g.dead.push(k);b[k].disabled=true;$("#info").textContent="فرصة ثانية! اختر إجابة أخرى.";beep(200,.3);g.lock=0;g.sel=null;timer();return}
 b[g.cpos].classList.add("ok");beep(ok?880:150,.4);S[ok?"ok":"bad"]++;if(ok)S.cats[g.q[0]]=(S.cats[g.q[0]]||0)+1;sv();await wait(1500);
 if(ok||g.m=="train"){if(g.i>=g.n-1)return end("win");g.i++;next()}else end("lose")}
function quit(){if(g.lock)return;end("quit")}
function end(k){clearInterval(tid);let p=0;if(k=="win")p=prize(g.n-1);else if(k=="quit")p=prize(g.i-1);else if(k=="lose"){const s=safes().filter(x=>x<g.i);p=s.length?prize(Math.max(...s)):0}
 if(g.m=="train")p=0;S.plays++;S.best=Math.max(S.best,p);S.hist.unshift({d:new Date().toLocaleDateString("ar"),p,k});S.hist=S.hist.slice(0,10);sv();
 $("#et").textContent={win:"🏆 مبروك! ربحت الجائزة الكبرى",lose:"❌ إجابة خاطئة",quit:"✋ انسحبت بذكاء"}[k]||"انتهى التدريب";
 $("#ep").textContent=g.m=="train"?"أكملت جولة التدريب":(k=="lose"?"الإجابة الصحيحة: "+g.q[3][g.q[4]]+" — ":"")+"مبلغك: "+fmt(p);show("end")}
function life(l){if(g.lock||!g.L[l])return;const vis=[0,1,2,3].filter(k=>!g.dead.includes(k)),w=vis.filter(k=>k!=g.cpos);
 if(l=="skip"){const q=pick(g.tier,g.q[0]);if(!q)return $("#info").textContent="لا توجد أسئلة بديلة";g.L.skip=0;return setQ(q)}
 g.L[l]=0;$$("[data-l]").forEach(b=>b.disabled=!g.L[b.dataset.l]);
 if(l=="fifty"){sh(w).slice(0,2).forEach(k=>{g.dead.push(k);ob()[k].classList.add("x");ob()[k].disabled=true})}
 if(l=="aud"){let c=g.tier==1?rnd(65,90):g.tier==2?rnd(45,70):rnd(30,55),left=100-c,r={};r[g.cpos]=c;w.forEach((k,j)=>{r[k]=j==w.length-1?left:rnd(0,left+1);left-=r[k]});
  $("#info").innerHTML=vis.map(k=>`<div class="bar">${AR[k]} <i style="width:${r[k]*2}px"></i>${r[k]}%</div>`).join("")}
 if(l=="fr"){const cf=g.tier==1?rnd(80,96):g.tier==2?rnd(55,80):rnd(35,65),k=Math.random()*100<cf+10?g.cpos:w[rnd(0,w.length)];$("#info").textContent=`صديقك: أعتقد أن الإجابة (${AR[k]}) — ثقتي ${cf}%`}}
function stats(){const t=S.ok+S.bad,bc=Object.entries(S.cats).sort((a,b)=>b[1]-a[1])[0];
 $("#sb").innerHTML=`<p>عدد الجولات: ${S.plays}</p><p>أعلى جائزة: ${fmt(S.best)}</p><p>صحيحة: ${S.ok} • خاطئة: ${S.bad}</p><p>نسبة النجاح: ${t?Math.round(S.ok/t*100):0}%</p><p>أقوى تصنيف: ${bc?bc[0]:"—"}</p><p>آخر الجولات:</p>`+S.hist.map(h=>`<p>${h.d} — ${fmt(h.p)}</p>`).join("");show("st")}
function reset(){if(confirm("حذف كل الإحصائيات؟")){S={plays:0,best:0,ok:0,bad:0,cats:{},hist:[]};sv()}}
