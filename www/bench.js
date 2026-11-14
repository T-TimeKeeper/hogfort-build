/* The built-in measure of the app (plan/native/PLAN.md §1.2): night 10, speed ×2, the strong set of cards, two battles of 4 minutes one after
   another, three packs of 30 animals at 20, 50 and 80 s of each battle; the fence is kept whole; when a night ends inside the 4 minutes the
   same night starts again. Every frame of the page is timed (requestAnimationFrame); the engine's numbers (frame, slow frame, draws, the
   renderer) are read from the shell (/__shell) once a second. The result stays on screen and goes to the shell's file (user://bench.jsonl).
   Only what the game puts on window is used: __api (startPlay, place, FIELD, finish), __game. Runs inside bench.html — with its own save.
   For the checks: ?dur=20&runs=2&wait=1 shortens it. */
(function(){
const Q=new URLSearchParams(location.search);
const BX={ver:'?',stage:10,speed:2,dur:+(Q.get('dur')||240),runs:+(Q.get('runs')||2),wait:+(Q.get('wait')||5),packs:[20,50,80],prio:['Электроизгородь','Тюк','Костёр','Рой','Вилы'],
  run:false,i:0,res:[],cur:null,last:0,lock:null,shell:null,errs:0,on:false};
window.__hfBench=BX;
const api=()=>window.__api||{};
const game=()=>{try{return window.__game?window.__game():null}catch(e){return null}};
const q=id=>document.getElementById(id);
const shown=id=>{const e=q(id);return !!(e&&!e.hidden&&e.style.display!=='none')};
const r1=x=>Math.round(x*10)/10;
function pct(a,p){if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)))]}
function ver(){try{for(const s of document.scripts){const t=s.textContent;const i=t.indexOf('const HFVER="');if(i>=0)return t.slice(i+13,t.indexOf('"',i+13))}}catch(e){}return '?'}
const css='#bxOv{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(5,10,24,.97);overflow:auto;'+
  'padding:calc(env(safe-area-inset-top) + 16px) 16px calc(env(safe-area-inset-bottom) + 16px);font:500 16px/1.4 -apple-system,system-ui,sans-serif;color:#f3f6ff;text-align:center}'+
  '#bxOv .bxC{max-width:350px;margin:auto}#bxOv h1{font:800 24px/1.2 -apple-system,system-ui,sans-serif;margin:0 0 10px}#bxOv p{margin:0 0 12px;opacity:.92}'+
  '#bxOv button{font:800 19px -apple-system,system-ui,sans-serif;padding:14px 26px;border:0;border-radius:16px;background:#ffcf3a;color:#2a1600;margin:0 4px 8px}'+
  '#bxOv .bxN{font:600 14px/1.5 -apple-system,system-ui,sans-serif;text-align:left;background:rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;margin:0 0 10px}'+
  '#bxOv .ok{color:#7dffa6}#bxOv .no{color:#ff9d8a}'+
  '#bxBlk{position:fixed;inset:0;z-index:2147482990;background:transparent;touch-action:none}'+
  '#bxBadge{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 6px);z-index:2147483001;font:700 13px -apple-system,system-ui,sans-serif;'+
  'color:#fff;background:rgba(0,0,0,.55);padding:6px 12px;border-radius:12px;pointer-events:none;white-space:nowrap}';
function ui(html){let o=q('bxOv');if(!o){o=document.createElement('div');o.id='bxOv';o.setAttribute('translate','no');o.setAttribute('data-noen','1');document.body.appendChild(o)}o.innerHTML='<div class="bxC">'+html+'</div>';o.hidden=false;o.style.display='flex';return o}
function hideUi(){const o=q('bxOv');if(o){o.hidden=true;o.style.display='none'}}
function badge(t){let b=q('bxBadge');if(!b){b=document.createElement('div');b.id='bxBadge';b.setAttribute('translate','no');b.setAttribute('data-noen','1');document.body.appendChild(b)}b.textContent=t||'';b.hidden=!t}
function blocker(on){let b=q('bxBlk');if(on&&!b){b=document.createElement('div');b.id='bxBlk';
  for(const t of ['pointerdown','pointermove','pointerup','touchstart','touchmove','click'])b.addEventListener(t,e=>{e.stopPropagation();if(e.cancelable)e.preventDefault()},{passive:false});
  document.body.appendChild(b)}if(b)b.hidden=!on}
async function keepAwake(){try{if(navigator.wakeLock&&navigator.wakeLock.request)BX.lock=await navigator.wakeLock.request('screen')}catch(e){}}
async function shellInfo(){try{const r=await fetch('/__shell',{cache:'no-store'});if(r.ok)return await r.json()}catch(e){}return null}
function raf(t){if(!BX.run)return;const c=BX.cur;if(c&&BX.last&&!c.pause){c.d.push(t-BX.last)}BX.last=t;requestAnimationFrame(raf)}
function startNight(){const A=api();try{['energyOv','sheetOv','storyOv'].forEach(id=>{const o=q(id);if(o)o.hidden=true})}catch(e){}
  window.__supply=true;A.startPlay(BX.stage,false);const G=game();
  if(!G||G.mode!=='play')throw new Error('ночь не идёт после старта (mode '+(G?G.mode:'нет')+')');
  if((G.stage|0)!==BX.stage)throw new Error('пошла ночь '+G.stage+' вместо '+BX.stage)}
function pack(){const A=api(),F=A.FIELD,ty=['walker','runner','thrower','brute','side'];let n=0;
  for(let k=0;k<30;k++){const row=k%10,col=(k/10)|0,z=F.zFar-0.8-col*1.4,x=(row-4.5)/4.5*F.xAt(z)*.8;try{A.place(ty[k%5],x,z,{age:1});n++}catch(e){BX.errs++}}return n}
function summary(c){const d=c.d.filter(x=>x>0&&x<5000),sum=d.reduce((a,b)=>a+b,0),al=c.alive,sh=c.sh;
  const avg=k=>sh.length?r1(sh.reduce((a,x)=>a+(+x[k]||0),0)/sh.length):null;
  return {run:c.n,sec:Math.round((performance.now()-c.t0)/1000),frames:d.length,fps:d.length?r1(d.length/(sum/1000)):0,med:r1(pct(d,.5)),p95:r1(pct(d,.95)),p99:r1(pct(d,.99)),
    max:r1(d.length?Math.max.apply(null,d):0),even:d.length?Math.round(1000*d.filter(x=>x<=18).length/d.length)/10:0,over34:d.filter(x=>x>34).length,over50:d.filter(x=>x>50).length,
    over100:d.filter(x=>x>100).length,aliveMax:al.length?Math.max.apply(null,al):0,aliveAvg:al.length?Math.round(al.reduce((a,b)=>a+b,0)/al.length):0,
    sec60:al.filter(x=>x>=60).length,nights:c.nights,picks:c.picks,packs:Object.keys(c.done).length,hidden:c.hidden,
    eng:sh.length?{ms:avg('ms'),p95:avg('p95'),draws:avg('draws'),inst:avg('inst'),n:sh.length}:null}}
function tick(){if(!BX.run)return;const c=BX.cur,G=game(),t=(performance.now()-c.t0)/1000;
  try{if(G){if(G.speed!==BX.speed)G.speed=BX.speed;if(G.wall&&G.wall.max)G.wall.hp=G.wall.max}}catch(e){}
  try{if(shown('cardsOv')){c.cw++;if(c.cw>=3){const cs=[].slice.call(document.querySelectorAll('#cards .card'));let k=null;for(const p of BX.prio){k=cs.find(x=>x.textContent.includes(p));if(k)break}k=k||cs[0];if(k){k.click();c.picks++}c.cw=0}}else c.cw=0}catch(e){BX.errs++}
  try{if(shown('lootOv')){const b=q('lootTake');if(b)b.click()}}catch(e){}
  try{if(shown('pauseOv')&&!document.hidden){const r=document.querySelector('#pauseOv [data-act="resume"],#pauseOv .resume,#resumeBtn');if(r)r.click();else q('pauseOv').hidden=true}}catch(e){}
  let over=false;try{over=!!(G&&G.over)||!G||G.mode!=='play'}catch(e){}
  if(over&&t<BX.dur){c.pause=true;try{const A=api();if(A.finish&&G&&G.mode==='play'&&!G.over)A.finish(false)}catch(e){}
    try{const A=api();if(A.toMenu)A.toMenu()}catch(e){}
    try{startNight();c.nights++;c.nightT0=performance.now();c.done={};c.pause=false;BX.last=0}catch(e){BX.errs++;if(BX.errs>20)return finish(String(e&&e.message||e))}return}
  const nt=(performance.now()-c.nightT0)/1000;
  for(const p of BX.packs)if(nt>=p&&!c.done[p])c.done[p]=pack()||-1;
  try{if(G&&G.enemies){const sec=Math.floor(t);if(c.alive.length<=sec)c.alive.push(G.enemies.filter(e=>!e.dead).length)}}catch(e){}
  if(!c.shT||performance.now()-c.shT>1000){c.shT=performance.now();shellInfo().then(s=>{if(s&&s.stat&&BX.cur===c)c.sh.push(s.stat)})}
  badge('Замер: бой '+c.n+' из '+BX.runs+' — '+Math.min(BX.dur,Math.floor(t))+' из '+BX.dur+' сек · экран не трогай');
  if(t>=BX.dur){BX.res.push(summary(c));if(c.n<BX.runs){try{const A=api();if(A.finish)A.finish(false);if(A.toMenu)A.toMenu()}catch(e){}beginRun(c.n+1)}else finish('')}}
function beginRun(n){const c=BX.cur={n,t0:performance.now(),nightT0:performance.now(),d:[],alive:[],sh:[],done:{},cw:0,picks:0,nights:1,hidden:0,pause:false,shT:0};
  try{startNight()}catch(e){return finish(String(e&&e.message||e))}c.t0=c.nightT0=performance.now();BX.last=0}
function verdict(s){const a=s.med<=16.7,b=s.even>=95;return '<span class="'+(a?'ok':'no')+'">обычный кадр '+s.med+' мс</span> · <span class="'+(b?'ok':'no')+'">ровных '+s.even+' %</span>'}
function text(){const sh=BX.shell||{};return 'Hogfort замер · игра '+BX.ver+' · сборка '+(sh.build||'страница')+' · отрисовка '+(sh.renderer||'страница')+' · '+(sh.hz>0?Math.round(sh.hz)+' Гц':'')+'\n'+
  BX.res.map(s=>'Бой '+s.run+' ('+s.sec+' с): обычный кадр '+s.med+' мс ('+s.fps+' кадров/с), ровных '+s.even+' %, каждый 20-й '+s.p95+' мс, каждый 100-й '+s.p99+' мс, самый долгий '+s.max+
    ' мс, дольше 50 мс: '+s.over50+', дольше 100 мс: '+s.over100+'; зверей до '+s.aliveMax+', в среднем '+s.aliveAvg+', секунд с 60+ зверями: '+s.sec60+'; ночей '+s.nights+', карт '+s.picks+
    (s.eng?'; движок: кадр '+s.eng.ms+' мс, каждый 20-й '+s.eng.p95+' мс, команд '+s.eng.draws+', зверей '+s.eng.inst:'')+(s.hidden?'; экран гас '+s.hidden+' раз':'')).join('\n')+(BX.why?'\nОстановлен: '+BX.why:'')}
function finish(why){if(!BX.run)return;BX.run=false;BX.why=why||'';clearInterval(BX.iv);blocker(false);badge('');try{if(BX.lock)BX.lock.release()}catch(e){}
  if(BX.cur&&BX.res.length<BX.cur.n&&BX.cur.d.length>30)BX.res.push(summary(BX.cur));
  try{const A=api();if(A.finish)A.finish(false)}catch(e){}
  const T=text();window.__hfBenchRes={ver:BX.ver,shell:BX.shell,res:BX.res,why:BX.why,text:T};
  try{fetch('/__shell/bench?d='+encodeURIComponent(JSON.stringify({at:Date.now(),ver:BX.ver,res:BX.res,why:BX.why}).slice(0,6000)),{cache:'no-store'}).catch(()=>{})}catch(e){}
  const sh=BX.shell||{};
  ui('<h1>'+(why?'Замер остановлен':'Замер готов')+'</h1>'+(why?'<p class="no" style="font-size:13px;word-break:break-word">'+String(why).slice(0,300).replace(/</g,'&lt;')+'</p>':'')+
    '<div class="bxN">Игра '+BX.ver+' · сборка '+(sh.build||'—')+'<br>Отрисовка: '+(sh.renderer||'страница')+(sh.hz>0?' · '+Math.round(sh.hz)+' Гц':'')+'</div>'+
    BX.res.map(s=>'<div class="bxN"><b>Бой '+s.run+'</b> ('+s.sec+' сек, ночь '+BX.stage+', ×'+BX.speed+')<br>'+verdict(s)+'<br>'+s.fps+' кадров/с · каждый 20-й кадр '+s.p95+' мс · самый долгий '+s.max+' мс<br>'+
      'Кадров дольше 50 мс: '+s.over50+', дольше 100 мс: '+s.over100+'<br>Зверей: до '+s.aliveMax+', в среднем '+s.aliveAvg+'; секунд с 60+ зверями: '+s.sec60+
      (s.eng?'<br>Движок: кадр '+s.eng.ms+' мс, каждый 20-й '+s.eng.p95+' мс, команд '+s.eng.draws:'')+'</div>').join('')+
    '<p style="font-size:13px">Цель: обычный кадр 16,7 мс и ровных кадров не меньше 95 % при 60+ зверях.</p><button id="bxCopy">Скопировать</button><button id="bxAgain">Ещё раз</button><br><button id="bxBack" style="background:#2b3a66;color:#fff">В игру</button>');
  const c=q('bxCopy');if(c)c.onclick=()=>{let ok=false;try{const ta=document.createElement('textarea');ta.value=T;ta.style.cssText='position:fixed;left:0;top:0;opacity:.01';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove()}catch(e){}
    try{if(navigator.clipboard)navigator.clipboard.writeText(T).then(()=>{c.textContent='Скопировано'},()=>{})}catch(e){}if(ok)c.textContent='Скопировано'};
  const a=q('bxAgain');if(a)a.onclick=()=>location.reload();const b=q('bxBack');if(b)b.onclick=()=>{location.href='index.html?native=1'}}
function go(){if(BX.on)return;BX.on=true;keepAwake();let left=BX.wait;
  ui('<h1>Готовлю бой…</h1><p id="bxW">Старт через '+left+' с. Положи телефон экраном вверх и не трогай.</p>');
  const iv=setInterval(()=>{left--;const el=q('bxW');if(el)el.textContent='Старт через '+Math.max(0,left)+' с. Положи телефон экраном вверх и не трогай.';
    if(left<=0){clearInterval(iv);hideUi();blocker(true);BX.run=true;BX.res=[];BX.last=0;beginRun(1);if(BX.run){requestAnimationFrame(raf);BX.iv=setInterval(tick,250)}}},1000)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&BX.run&&BX.cur)BX.cur.hidden++;if(!document.hidden&&BX.run)keepAwake()});
async function boot(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);BX.ver=ver();BX.shell=await shellInfo();const sh=BX.shell||{};
  if(!window.__benchOwnSave){ui('<h1>Замер не запущен</h1><p>Эта страница открывается только как bench.html — со своим сохранением.</p>');return}
  const min=Math.round(BX.runs*BX.dur/60*10)/10;
  ui('<h1>Замер плавности</h1><div class="bxN">Игра '+BX.ver+' · сборка '+(sh.build||'—')+'<br>Отрисовка: '+(sh.renderer||'страница')+(sh.hz>0?' · '+Math.round(sh.hz)+' Гц':'')+'</div>'+
    '<p>Телефон сам играет '+BX.runs+' боя подряд по '+Math.round(BX.dur/60*10)/10+' мин: ночь '+BX.stage+', скорость ×'+BX.speed+', сильный набор, три набега по 30 зверей — и меряет каждый кадр. Всего ≈ '+min+' мин. Сохранение игры не трогается.</p>'+
    '<p>Нажми кнопку и положи телефон — экран не трогай.</p><button id="bxGo">Начать замер</button><br><button id="bxBack0" style="background:#2b3a66;color:#fff">В игру</button>');
  const b=q('bxGo');if(b)b.onclick=go;const k=q('bxBack0');if(k)k.onclick=()=>{location.href='index.html?native=1'};if(Q.get('auto')==='1')go()}
function ready(){try{const A=window.__api;return !!(window.__game&&A&&A.FIELD&&typeof A.startPlay==='function'&&typeof A.place==='function')}catch(e){return false}}
let tries=0;const w=setInterval(()=>{tries++;if(ready()||tries>480){clearInterval(w);setTimeout(boot,800)}},250);
})();
