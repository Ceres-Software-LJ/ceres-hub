// Gerado a partir do protótipo. GSAP vem do npm (antes era CDN).
import gsap from 'gsap';
window.gsap = gsap;
gsap.ticker.lagSmoothing(0); // evita saltos grandes após tab ficar em background

/* Views que não são a da rota atual vêm dentro de <template> (HTML estático só da página),
   e entram no DOM aqui, antes de qualquer código que as procure. */
document.querySelectorAll('template[data-view]').forEach((t) => t.replaceWith(t.content));
const START_VIEW = document.body.dataset.view || 'home';
const VIEW_ROUTES = { home: '/', library: '/portfolio/', about: '/sobre/' };
const VIEW_META = JSON.parse(document.getElementById('views-meta')?.textContent || '{}');

/* =====================================================================
   CERES® — protótipo single-file
   Réplica estrutural da experiência (intro de letras -> formas pretas,
   UI com reveal de linhas, botão cursor-follow, wheel de polaroids).
   Todo o código e conteúdo são originais.
===================================================================== */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- dados da library ---------------- */
const ITEMS = [
  {num:1,title:'FlowBloc',domain:'flowbloc.com.br',tags:['Produtividade','SaaS'],g:'g1',tag:'FlowBloc',
   desc:'Plataforma de organização e execução de tarefas. “Organize. Execute. Avance.” Gestão de fluxo de trabalho em blocos.',
   url:'https://flowbloc.com.br/',cta:'Visitar site'},
  {num:2,title:'FinBloc',domain:'finbloc.com.br',tags:['Fintech','IA'],g:'g2',tag:'FinBloc',
   desc:'Plataforma de gestão financeira inteligente com relatórios gerados por IA, dashboards intuitivos e sincronização multi-dispositivo.',
   url:'https://finbloc.com.br/',cta:'Visitar site'},
  {num:3,title:'Kura Lab',domain:'kuralab.com.br',tags:['Marketplace','Brechó'],g:'g3',tag:'Kura',
   desc:'“Brechó perto de você, com peças que ninguém mais tem.” Marketplace que reúne lojas de brechó e roupa em uma só busca: garimpe por região, descubra acervos novos e compre direto da loja.',
   url:'https://kuralab.com.br/',cta:'Visitar site'},
  {num:4,title:'Cutelaria Estância Gaúcha',domain:'cutelariaestanciagaucha.com.br',tags:['Cutelaria','Empório'],g:'g4',tag:'Cutelaria',
   desc:'“O verdadeiro sabor e a tradição da Serra Gaúcha, do RS para o MS.” Facas artesanais, vinhos, queijos e kits de presente em Campo Grande, com envio para todo o Brasil.',
   url:'https://www.cutelariaestanciagaucha.com.br/',cta:'Visitar site'},
  {num:5,title:'MP Engenharia',domain:'mp-engenhariaarquitetura.com.br',tags:['Engenharia Civil','Institucional'],g:'g5',tag:'MP',
   desc:'“O engenheiro que assina seu projeto é o mesmo que aparece na sua obra.” Site para escritório de engenharia e arquitetura em Campo Grande, MS.',
   url:'https://www.mp-engenhariaarquitetura.com.br/',cta:'Visitar site'},
  {num:6,title:'Axa Foto Autorizada',domain:'axa-foto.vercel.app',tags:['Fotografia','Serviços'],g:'g6',tag:'Axa Foto',
   desc:'“Nas mãos de quem entende de fotografia.” Assistência técnica autorizada para câmeras digitais e analógicas, com atuação desde 1998 em Campo Grande.',
   url:'https://axa-foto.vercel.app/',cta:'Visitar site'},
  {num:7,title:'Viva Espaço de Beleza',domain:'viva-espaco-beleza.vercel.app',tags:['Beleza','Salão'],g:'g7',tag:'Viva',
   desc:'“Manicure, cabelo e unhas com o capricho que dura.” Salão inclusivo em Campo Grande com 4,7★ no Google: manicure, gel, escova e hidratação capilar.',
   url:'https://viva-espaco-beleza.vercel.app/',cta:'Visitar site'},
  {num:8,title:'Amaná Makramiya',domain:'amana-macrame.vercel.app',tags:['Artesanato','E-commerce'],g:'g8',tag:'Amaná',
   desc:'“Feito à mão, para permanecer.” Ateliê de macramê com peças decorativas 100% artesanais: painéis, luminárias e espelhos personalizáveis, atendimento nacional.',
   url:'https://amana-macrame.vercel.app/',cta:'Visitar site'},
  {num:9,title:'Seu projeto aqui',domain:'ceres hub',tags:['Vamos conversar'],g:'g9',tag:'+',
   desc:'Tem um projeto em mente? Vamos conversar sobre como transformar sua ideia em realidade digital.',
   url:'https://wa.me/5567992473726',cta:'Iniciar conversa'},
];
/* capturas dos sites (embutidas, 1000px de largura) */
const IMGS = [
  '/assets/images/portfolio/flowbloc.png',
  '/assets/images/portfolio/finbloc.png',
  '/assets/images/portfolio/kuralabs.png',
  '/assets/images/portfolio/estancia-gaucha.png',
  '/assets/images/portfolio/mp-engenharia.png',
  '/assets/images/portfolio/axa-foto.png',
  '/assets/images/portfolio/viva-beleza.png',
  '/assets/images/portfolio/amana.png',
];
ITEMS.forEach((it,i)=>{ it.img = IMGS[i] || null; });

/* =====================================================================
   CANVAS — letras C E R E S / formas pretas
===================================================================== */
const cv = document.getElementById('shapes');
const cx2 = cv.getContext('2d');
let W=0,H=0,DPR=1;
let _cachedFs = -1, _cachedWidths = [], _cachedCap = 0;
function sizeCanvas(){
  DPR = Math.min(devicePixelRatio||1, 1.5);
  W = innerWidth; H = innerHeight;
  cv.width = W*DPR; cv.height = H*DPR;
  cv.style.width = W+'px'; cv.style.height = H+'px';
  cx2.setTransform(DPR,0,0,DPR,0,0);
  _cachedFs = -1; // invalidate cache on resize
}
sizeCanvas();
addEventListener('resize', sizeCanvas);

const LETTERS = ['C','É','R','E','S'];
const END_SCALE = 8;                 // tamanho final das letras gigantes
const L = LETTERS.map(ch=>({ch, spread:1, fill:0, alpha:0}));
const G = {
  scale: 1,          // escala do grupo
  rot: 0,            // rotação do grupo (-90deg = palavra deitada, lendo de baixo p/ cima)
  loop: 0,           // 0..1 liga as cópias da palavra (coluna infinita)
  drift: 0,          // 0..1 velocidade do scroll vertical
  scroll: 0,         // deslocamento acumulado (px)
  curtain: 0,        // 0..1 cortina preta de transição
  baseSize: 0.16,    // fonte inicial como fração da largura
};
document.fonts.load('80px "Archivo Black"');
let lastT = performance.now();

function drawShapes(t){
  if(document.hidden) return;
  const dt = Math.min((t-lastT)/1000, .05); lastT = t;
  cx2.clearRect(0,0,W,H);
  const fs = W * G.baseSize * G.scale;
  cx2.font = `${fs}px "Archivo Black", Arial, sans-serif`;
  cx2.textBaseline = 'alphabetic';
  cx2.textAlign = 'center';

  if(fs !== _cachedFs){
    _cachedFs = fs;
    _cachedCap = cx2.measureText('H').actualBoundingBoxAscent || fs*0.7;
    _cachedWidths = LETTERS.map(ch=>cx2.measureText(ch).width);
  }
  const cap = _cachedCap;
  const widths = _cachedWidths;
  const gapWord = fs*0.02;
  const wordW = widths.reduce((a,b)=>a+b,0) + gapWord*(LETTERS.length-1);
  const cycle = wordW + gapWord;

  // scroll vertical: letras entram por cima e descem (R, E, S, C, É, R, E, S...)
  if(!REDUCED) G.scroll += H*0.18*G.drift*dt;
  const off = ((G.scroll % cycle)+cycle)%cycle;

  const cxp = W/2, cyp = H/2;
  cx2.save();
  cx2.translate(cxp, cyp);
  cx2.rotate(G.rot);
  cx2.translate(-cxp, -cyp);

  const copies = G.loop > 0 ? [-1,0,1] : [0];
  for(const k of copies){
    let acc = -wordW/2;
    for(let i=0;i<L.length;i++){
      const l = L[i];
      const wordX = cxp + acc + widths[i]/2 + k*cycle - off;
      const spreadX = (W/(L.length+1))*(i+1);
      const x = wordX + (spreadX - wordX)*l.spread;
      const alpha = l.alpha * (k===0 ? 1 : G.loop);

      cx2.save();
      cx2.translate(x, cyp);
      if(l.fill < 1){
        cx2.globalAlpha = alpha*0.22;
        cx2.fillStyle = '#0d151f';
        cx2.fillText(l.ch, 0, cap/2);
      }
      if(l.fill > 0){
        cx2.globalAlpha = alpha;
        cx2.fillStyle = '#0d151f';
        if(l.fill < 1){
          cx2.save();
          const hh = cap*1.4*l.fill;
          cx2.beginPath();
          cx2.rect(-widths[i], cap/2 - hh, widths[i]*2, hh);
          cx2.clip();
          cx2.fillText(l.ch, 0, cap/2);
          cx2.restore();
        }else{
          cx2.fillText(l.ch, 0, cap/2);
        }
      }
      cx2.restore();
      acc += widths[i] + gapWord;
    }
  }
  cx2.restore();

  if(G.curtain > 0){
    cx2.globalAlpha = G.curtain;
    cx2.fillStyle = '#0b0b0b';
    cx2.fillRect(0,0,W,H);
    cx2.globalAlpha = 1;
  }
}
gsap.ticker.add(()=>{ drawShapes(performance.now()); });

/* =====================================================================
   REVEAL DE LINHAS (máscara + glitch)
===================================================================== */
function splitLines(el){
  // separa o texto em "linhas visuais" simples via spans por palavra
  const words = el.innerHTML.trim();
  el.innerHTML = `<span class="line-mask"><span>${words}</span></span>`;
}
function revealEl(el, delay=0){
  const inners = el.querySelectorAll('.line-mask > span');
  if(REDUCED){ gsap.set(inners,{yPercent:0,opacity:1}); return; }
  gsap.fromTo(inners,
    {yPercent:110},
    {yPercent:0,duration:.9,ease:'expo.out',stagger:.07,delay});
  // glitch rápido de opacidade
  inners.forEach((s,i)=>{
    gsap.fromTo(s,{opacity:0},{opacity:1,duration:.3,delay:delay+i*.07,
      ease:'steps(3)'});
  });
}

/* =====================================================================
   INTRO
===================================================================== */
const homeUI = document.getElementById('home-ui');
const nav = document.getElementById('nav');
const navMark = document.getElementById('nav-mark');
let markOn=true, markA=1;
gsap.ticker.add(()=>{ const t=markOn?(nav.style.opacity===''?1:+nav.style.opacity):0; markA+=(t-markA)*.18; navMark.style.opacity=markA.toFixed(3); });
gsap.set(homeUI,{opacity:0});

function endStateShapes(){
  G.scale = END_SCALE; G.rot = -Math.PI/2; G.loop = 1; G.drift = 0;
  L.forEach(l=>{ l.spread = 0; l.fill = 1; l.alpha = 1; });
}

function playIntro(){
  if(REDUCED){
    endStateShapes();
    gsap.set([homeUI,nav],{opacity:1});
    document.querySelectorAll('.line-mask > span').forEach(s=>{s.style.transform='none';s.style.opacity='1'});
    return;
  }
  const tl = gsap.timeline();
  tl.timeScale(1.9); // intro mais rápida

  // 1) letras espalhadas na horizontal, esmaecidas, preenchem de preto (recorte de baixo p/ cima)
  tl.to(L,{alpha:1,duration:.5,stagger:.06,ease:'power2.out'})
    .to(L,{fill:1,duration:.9,stagger:.09,ease:'power3.inOut'},'-=.2')
  // 2) juntam no centro formando CÉRES
    .to(L,{spread:0,duration:1.1,ease:'expo.inOut',stagger:.02},'+=.15')
  // 3) a palavra gira e fica deitada na vertical (lendo de baixo para cima)
    .to(G,{rot:-Math.PI/2,duration:1.2,ease:'power4.inOut'},'+=.1')
  // 4) cresce até as letras virarem formas gigantes deitadas
    .to(G,{scale:END_SCALE,duration:1.7,ease:'expo.inOut'},'+=.35')
  // 5) a coluna passa a repetir (loop) e começa a descer: R, E, S, C, É, R, E, S...
    .to(G,{loop:1,duration:.4},'-=.6')
    .to(G,{drift:1,duration:1.6,ease:'power2.inOut'},'-=.5')
  // 6) UI entra
    .add(()=>{
      gsap.to([homeUI,nav],{opacity:1,duration:.2});
      revealAllHome();
    },'-=1.4');
}

function revealAllHome(){
  splitParas();
  revealEl(document.querySelector('.home-brandline'),0);
  revealEl(document.getElementById('home-center'),.08);
  revealEl(document.querySelector('.home-meta'),.25);
  // listas e parágrafos: fade por linha com clip
  if(!REDUCED){
    gsap.fromTo('#home-cats li',{opacity:0,x:-6},{opacity:1,x:0,duration:.45,stagger:.06,delay:.25,ease:'steps(4)'});
    gsap.fromTo(['#para-1','#para-2'],{opacity:0},{opacity:1,duration:.7,delay:.2,ease:'steps(6)'});
    gsap.fromTo('#btn-enter',{opacity:0,scale:.8},{opacity:1,scale:1,duration:.6,delay:.6,ease:'expo.out'});
  }
}
function splitParas(){/* parágrafos ficam inteiros; reveal é por opacidade steps (glitch) */}

/* =====================================================================
   BOTÃO SEGUE O CURSOR
===================================================================== */
const area = document.getElementById('cursor-area');
const btn  = document.getElementById('btn-enter');
const btnPos = {x:.5,y:.5,tx:.5,ty:.5};
area.addEventListener('pointermove',e=>{
  const r = area.getBoundingClientRect();
  btnPos.tx = (e.clientX-r.left)/r.width;
  btnPos.ty = (e.clientY-r.top)/r.height;
});
area.addEventListener('pointerleave',()=>{btnPos.tx=.5;btnPos.ty=.5;});
gsap.ticker.add(()=>{
  if(REDUCED) return;
  btnPos.x += (btnPos.tx-btnPos.x)*0.09;
  btnPos.y += (btnPos.ty-btnPos.y)*0.09;
  btn.style.left = (btnPos.x*100)+'%';
  btn.style.top  = (btnPos.y*100)+'%';
});

/* =====================================================================
   TRANSIÇÃO ENTRE VIEWS (cortina preta)
===================================================================== */
const viewHome = document.getElementById('view-home');
const viewLib  = document.getElementById('view-library');
let current = 'home', transitioning = false;

function goTo(view){
  if(view===current || transitioning) return;
  transitioning = true;
  if(REDUCED){ swapViews(view); G.curtain = 0; transitioning=false; return; }
  // biblioteca -> sobre: painel branco sobe cobrindo a tela (a Sobre também abre branca)
  if(current==='library' && view==='about'){
    const wipe=document.getElementById('about-wipe');
    const H=()=>innerHeight*1.02;
    gsap.set(wipe,{y:H()});
    const tl=gsap.timeline({onComplete:()=>{transitioning=false;gsap.set(wipe,{y:H()});}});
    tl.to(wipe,{y:0,duration:1.25,ease:'expo.inOut'})
      .add(()=>{ swapViews('about'); const v=document.getElementById('view-about'); if(v) v.scrollTop=0; })
      .to(wipe,{y:()=>-H(),duration:1.15,ease:'expo.inOut'},'+=.25');
    return;
  }
  // transições que envolvem a tela Sobre usam um véu escuro
  if(view==='about' || current==='about'){
    const tl = gsap.timeline({onComplete:()=>{transitioning=false;}});
    tl.to(veil,{opacity:1,duration:.7,ease:'power2.in'})
      .add(()=>{ swapViews(view); if(view==='home') G.curtain=0; if(view==='library') G.curtain=1; })
      .to(veil,{opacity:0,duration:1,ease:'power2.out'},'+=.15');
    if(view==='home') tl.add(()=>revealAllHome(),'-=.5');
    return;
  }
  const tl = gsap.timeline({onComplete:()=>{transitioning=false;}});
  // formas crescem e fecham a tela
  tl.to(G,{scale:G.scale*2.2,curtain:1,duration:1.15,ease:'power3.in'})
    .add(()=>swapViews(view))
    .to(G,{curtain:view==='library'?1:0,scale:END_SCALE,duration:view==='library'?0:1.4,ease:'expo.out'})
    .to(G,{curtain:view==='library'?1:0,duration:.1},'<');
  if(view==='home'){
    tl.add(()=>{ revealAllHome(); });
  }
}
let START_DONE = false;
function syncUrl(view){
  const m = VIEW_META[view], path = VIEW_ROUTES[view];
  if(m){
    document.title = m.title;
    const set = (sel, attr, val) => { const e = document.querySelector(sel); if(e) e.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', m.description);
    set('link[rel="canonical"]', 'href', m.canonical);
    set('meta[property="og:url"]', 'content', m.canonical);
    set('meta[property="og:title"]', 'content', m.title);
    set('meta[property="og:description"]', 'content', m.description);
  }
  if(START_DONE && location.pathname !== path) history.pushState({view}, '', path);
}
function viewFromPath(p){
  return p.startsWith('/portfolio') ? 'library' : p.startsWith('/sobre') ? 'about' : 'home';
}
addEventListener('popstate', () => { const v = viewFromPath(location.pathname); if(v !== current) goTo(v); });

function swapViews(view){
  current = view;
  syncUrl(view);
  markOn = view==='home'; document.getElementById('nav').classList.toggle('no-mark',!markOn); navMark.classList.toggle('off',!markOn);
  { const nv=document.getElementById('nav'); nv.style.mixBlendMode = view==='about' ? 'normal' : ''; nv.style.color = view==='about' ? '#000' : ''; }
  viewHome.classList.toggle('is-active',view==='home');
  viewLib.classList.toggle('is-active',view==='library');
  viewAbout.classList.toggle('is-active',view==='about');
  document.getElementById('mi-index').classList.toggle('is-current',view==='home');
  document.getElementById('mi-library').classList.toggle('is-current',view==='library');
  document.getElementById('mi-about').classList.toggle('is-current',view==='about');
  if(view==='library'){
    cv.style.visibility='hidden';
    buildWheel(); introWheel();
  }else if(view==='about'){
    cv.style.visibility='hidden';
    enterAbout();
  }else{
    cv.style.visibility='visible';
    G.curtain = 0;
  }
}
btn.addEventListener('click',()=>goTo('library'));
document.querySelectorAll('[data-goto]').forEach(a=>{
  a.addEventListener('click',e=>{e.preventDefault();goTo(a.dataset.goto);});
});

/* =====================================================================
   LIBRARY — roda de polaroids
===================================================================== */
const wheelEl = document.getElementById('lib-wheel');
const N = ITEMS.length;
const STEP = 24;                       // graus entre cards
let cards = [], rot = {v:0}, target = 0, activeIdx = 0, built=false;
const tilts = ITEMS.map((_,i)=> (i%2? 1:-1)*(3+(i*2.7)%5) );

function buildWheel(){
  if(built) return; built = true;
  document.getElementById('c-total').textContent = N;
  document.getElementById('lib-count-sup').textContent = `(${N})`;
  ITEMS.forEach((it,i)=>{
    const el = document.createElement('div');
    el.className='polaroid';
    el.innerHTML = `
      <div class="ph ${it.g}">${it.img?`<img src="${it.img}" alt="${it.title}" draggable="false">`:`<span class="tag">${it.tag}</span>`}<div class="veil"></div></div>
      <div class="cap"><span>${it.domain}</span></div>`;
    wheelEl.appendChild(el);
    cards.push(el);
  });
  layoutWheel();
}

/* faixa horizontal de letras (C É R E S em loop), presa ao scroll da roda + deriva leve */
const strip = document.getElementById('lib-strip');
let stripCycle = 0, stripDrift = 0;
(function buildStrip(){
  strip.innerHTML = '<span>CÉRES</span>'.repeat(4);
})();
function measureStrip(){ stripCycle = strip.firstElementChild.getBoundingClientRect().width || 0; }
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ measureStrip(); });
function placeStrip(){
  if(stripCycle<10) measureStrip();
  if(stripCycle<10) return;
  const off = -((rot.v*9 + stripDrift) % stripCycle);
  strip.style.transform = `translate3d(${off - stripCycle*1}px,-50%,0)`;
}
if(!REDUCED){
  gsap.ticker.add((t,dt)=>{ if(current!=='library') return; stripDrift += dt*0.02*(innerWidth/1920); if(built) placeStrip(); });
}
addEventListener('resize',()=>{ measureStrip(); placeStrip(); });
function wheelGeom(){
  const R = Math.max(innerHeight*1.15, 700);
  return {R, cx:innerWidth/2, cy:innerHeight/2 + R};
}
function layoutWheel(){
  placeStrip(); if(typeof updateHint==='function'&&hintEl) updateHint();
  const {R,cx,cy} = wheelGeom();
  cards.forEach((el,i)=>{
    const a = (i*STEP - rot.v) * Math.PI/180;
    const x = cx + Math.sin(a)*R;
    const y = cy - Math.cos(a)*R;
    const deg = (i*STEP - rot.v);
    const dist = Math.min(Math.abs(deg)/STEP, 2.5);
    const scale = 1 - dist*0.13;
    const dim = Math.min(dist*0.45, 0.78);
    el.style.setProperty('--dim', dim.toFixed(3));
    el.style.transform =
      `translate(-50%,-50%) translate(${x-innerWidth/2}px,${y-innerHeight/2}px) `+
      `rotate(${deg*0.6 + tilts[i]}deg) scale(${scale.toFixed(3)})`;
    el.style.zIndex = String(100 - Math.round(dist*10));
  });
  const idx = Math.max(0, Math.min(N-1, Math.round(rot.v/STEP)));
  if(idx!==activeIdx){ activeIdx = idx; updateTitles(); }
}
function updateTitles(){
  const it = ITEMS[activeIdx];
  document.getElementById('t-num').textContent = it.num;
  document.getElementById('t-title').textContent = it.title;
  document.getElementById('t-year').innerHTML = it.tags.join('<br>');
  document.getElementById('t-desc').textContent = it.desc;
  const lk = document.getElementById('t-link');
  lk.textContent = it.cta+' ↗'; lk.href = it.url;
  document.getElementById('c-cur').textContent = it.num;
  if(!REDUCED){
    gsap.fromTo('#t-title',{yPercent:30,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'expo.out'});
    gsap.fromTo(['#t-num','#t-year','.lib-detail'],{opacity:0},{opacity:1,duration:.35,ease:'steps(3)'});
  }
}
function introWheel(){
  updateTitles();
  if(REDUCED){ layoutWheel(); return; }
  rot.v = -STEP*3;
  gsap.to(rot,{v:0,duration:1.4,ease:'expo.out',onUpdate:layoutWheel});
  gsap.fromTo('.lib-title-layer',{opacity:0},{opacity:1,duration:.6,delay:.5});
}

/* scroll / drag da roda */
let snapT = null;
function nudge(delta){
  target = Math.max(0, Math.min((N-1)*STEP, target + delta));
  gsap.to(rot,{v:target,duration:REDUCED?0:.8,ease:'expo.out',onUpdate:layoutWheel,overwrite:true});
  clearTimeout(snapT);
  snapT = setTimeout(()=>{
    target = Math.round(target/STEP)*STEP;
    gsap.to(rot,{v:target,duration:.6,ease:'expo.out',onUpdate:layoutWheel,overwrite:true});
  },160);
}
/* home: rolar (ou deslizar/teclar) avança para o portfólio, igual ao botão */
(function(){
  let acc=0, t0=0, ty=null;
  const go=()=>{ acc=0; if(current==='home' && !transitioning) goTo('library'); };
  viewHome.addEventListener('wheel',e=>{
    if(current!=='home') return;
    const now=performance.now(); if(now-t0>350) acc=0; t0=now;
    if(e.deltaY>0){ acc+=e.deltaY; if(acc>=90) go(); } else acc=0;
  },{passive:true});
  viewHome.addEventListener('touchstart',e=>{ ty=e.touches[0].clientY; },{passive:true});
  viewHome.addEventListener('touchmove',e=>{
    if(ty===null||current!=='home') return;
    if(ty-e.touches[0].clientY>60){ ty=null; go(); }
  },{passive:true});
  addEventListener('keydown',e=>{
    if(current==='home' && ['ArrowDown','PageDown',' '].includes(e.key)){ e.preventDefault(); go(); }
  });
})();

/* uma "rolada" = um card; a inércia do trackpad não pula cards */
const WL={locked:false,lockT:0,lastT:0,lastAbs:0,acc:0};
function libStep(dir){
  clearTimeout(snapT);
  const last=(N-1)*STEP;
  target=Math.max(0,Math.min(last,Math.round(target/STEP)*STEP+dir*STEP));
  gsap.to(rot,{v:target,duration:REDUCED?0:1.25,ease:'expo.out',onUpdate:layoutWheel,overwrite:true});
}
viewLib.addEventListener('wheel',e=>{
  e.preventDefault();
  if(panelOpen||transitioning) return;
  let dy=e.deltaY; if(e.deltaMode===1) dy*=34; else if(e.deltaMode===2) dy*=innerHeight;
  if(Math.abs(e.deltaX)>Math.abs(dy)) dy=e.deltaX;
  const now=performance.now(), abs=Math.abs(dy);
  if(WL.locked){
    const gap=now-WL.lastT;
    // destrava quando a inércia acaba ou quando vem uma nova rolada mais forte
    if(now-WL.lockT>800 && (gap>140 || abs>WL.lastAbs*1.6+12)){ WL.locked=false; WL.acc=0; WL.fresh=(gap>250 || abs>WL.lastAbs*1.6+12); }
    WL.lastT=now; WL.lastAbs=abs;
    if(WL.locked) return;
  }
  if(now-WL.lastT>200){ WL.acc=0; WL.fresh=true; }
  const prevAbs=WL.lastAbs; WL.lastT=now; WL.lastAbs=abs;
  // cauda de inércia (deltas só diminuindo) não conta como nova rolada
  if(!WL.fresh && abs<prevAbs && abs<40) return;
  WL.fresh=false;
  if(atEnd() && dy>0){ overPush(dy); if(overAcc>=360){ WL.locked=true; WL.lockT=now; } return; }
  overReset();
  WL.acc+=dy;
  if(Math.abs(WL.acc)>=40){
    libStep(WL.acc>0?1:-1);
    WL.acc=0; WL.locked=true; WL.lockT=now;
  }
},{passive:false});

/* no último item, empurrar mais para frente leva à tela Sobre */
function LAST_T(){ return (N-1)*STEP; }
function atEnd(){ return target>=LAST_T()-0.5 && rot.v>=LAST_T()-2; }
let overAcc=0, overTimer=null;
function overPush(d){
  if(transitioning||current!=='library') return;
  overAcc+=Math.abs(d);
  const p=Math.min(overAcc/360,1);
  gsap.to('.lib-stage',{y:-p*46,duration:.25,overwrite:true});
  clearTimeout(overTimer);
  overTimer=setTimeout(overReset,450);
  if(overAcc>=360){ overReset(true); goTo('about'); }
}
function overReset(keep){
  overAcc=0; clearTimeout(overTimer);
  gsap.to('.lib-stage',{y:0,duration:keep?0:.5,ease:'expo.out',overwrite:true});
}
var hintEl=document.getElementById('scroll-hint'); var hintEnd=null;
function updateHint(){
  const e=rot.v>=LAST_T()-2;
  if(e===hintEnd) return; hintEnd=e;
  hintEl.textContent = e ? 'Role para Sobre ↓' : 'Role';
}

/* clique fora do card = um passo para frente (loop no fim) */
function stepForward(){
  clearTimeout(snapT);
  const last=(N-1)*STEP;
  target = Math.round(target/STEP)*STEP;
  if(target>=last){ goTo('about'); return; }
  target = target+STEP;
  gsap.to(rot,{v:target,duration:REDUCED?0:1.25,ease:'expo.out',onUpdate:layoutWheel,overwrite:true});
}

/* toque / arraste / clique */
let dragX=null, downX=0, downY=0, downTarget=null;
viewLib.addEventListener('pointerdown',e=>{
  if(panelOpen){ dragX=null; return; }
  dragX=e.clientX; downX=e.clientX; downY=e.clientY; downTarget=e.target;
});
addEventListener('pointermove',e=>{
  if(dragX===null||current!=='library'||panelOpen)return;
  const dx=dragX-e.clientX;
  if(atEnd() && dx>0){ overPush(dx*5); dragX=e.clientX; return; }
  nudge(dx*0.12); dragX=e.clientX;
});
addEventListener('pointerup',e=>{
  if(dragX===null) return;
  dragX=null;
  if(current!=='library'||panelOpen) return;
  if(Math.hypot(e.clientX-downX,e.clientY-downY)>6) return;
  const t=downTarget;
  if(!t||!t.closest) return;
  if(t.closest('a,button,.lib-detail,.lib-counter')) return;
  const card=t.closest('.polaroid');
  if(card) openPanel(cards.indexOf(card)); else stepForward();
});

/* ---------- painel de detalhe ---------- */
const panelEl=document.getElementById('lib-panel');
const closeBtn=document.getElementById('panel-close');
let panelOpen=false;
const FADE_UI='.lib-ui,.lib-detail,.lib-title-layer';
function panelSplit(el){
  const nodes=[...el.childNodes]; el.textContent='';
  nodes.forEach(n=>{
    if(n.nodeName==='BR'){ el.appendChild(document.createElement('br')); return; }
    n.textContent.split(/(\s+)/).forEach(t=>{
      if(!t) return;
      if(/^\s+$/.test(t)){ el.appendChild(document.createTextNode(' ')); return; }
      const w=document.createElement('span'); w.className='aw'; const i=document.createElement('span'); i.className='awi'; i.textContent=t; w.appendChild(i); el.appendChild(w);
    });
  });
}
function fillPanel(i){
  const it=ITEMS[i];
  document.getElementById('pn-num').textContent=it.num;
  const ph=document.getElementById('pn-ph');
  ph.className='ph '+it.g;
  ph.innerHTML = it.img ? `<img src="${it.img}" alt="${it.title}" draggable="false">` : `<span class="tag">${it.tag}</span>`;
  document.getElementById('pn-name').innerHTML=it.title+'<br>'+it.domain;
  document.getElementById('pn-desc').textContent=it.desc;
  panelSplit(document.getElementById('pn-name')); panelSplit(document.getElementById('pn-desc'));
  document.getElementById('pn-year').textContent='('+it.tags.join(', ')+')';
  const a=document.getElementById('pn-link'); a.textContent=it.cta+' →'; a.href=it.url;
}
function openPanel(i){
  if(panelOpen||transitioning) return;
  panelOpen=true;
  fillPanel(i);
  // leva a roda até o card clicado
  target=i*STEP; clearTimeout(snapT);
  gsap.to(rot,{v:target,duration:REDUCED?0:.7,ease:'expo.out',onUpdate:layoutWheel,overwrite:true});
  viewLib.classList.add('panel-open');
  panelEl.setAttribute('aria-hidden','false');
  gsap.killTweensOf([panelEl,'.pn-anim','.lib-stage',closeBtn,FADE_UI]);
  const poster=panelEl.querySelector('.panel-poster'), pimg=poster.querySelector('.ph img');
  const small=panelEl.querySelectorAll('.pn-anim:not(.panel-poster):not(.panel-name):not(.panel-desc)');
  const words=panelEl.querySelectorAll('.panel-name .awi,.panel-desc .awi');
  if(REDUCED){
    gsap.set(panelEl,{yPercent:0,visibility:'visible'});
    gsap.set(FADE_UI,{opacity:0});
    gsap.set('.lib-stage',{filter:'blur(10px)'});
    gsap.set(['.pn-anim',closeBtn],{opacity:1,yPercent:0,y:0});
    gsap.set(poster,{clipPath:'none'}); gsap.set(words,{yPercent:0}); if(pimg) gsap.set(pimg,{scale:1});
    return;
  }
  panelReady=true;
  const tl=gsap.timeline();
  tl.set(panelEl,{yPercent:-101,visibility:'visible'})
    .set(poster,{opacity:1,yPercent:0,clipPath:'inset(100% 0 0 0)'})
    .set(pimg||poster,{scale:1.35})
    .set(words,{yPercent:118})
    .set(small,{opacity:0,yPercent:40})
    .set(closeBtn,{opacity:0,y:16})
    .to(FADE_UI,{opacity:0,duration:.3},0)
    .to('.lib-stage',{filter:'blur(10px)',scale:1.04,duration:.95,ease:'expo.out'},0)
    .to(panelEl,{yPercent:0,duration:1.2,ease:'expo.inOut'},0)
    .to(poster,{clipPath:'inset(0% 0 0 0)',duration:1.5,ease:'expo.inOut'},.5)
    .to(pimg||poster,{scale:1,duration:2.2,ease:'expo.out'},.55)
    .to(words,{yPercent:0,duration:1.1,ease:'expo.out',stagger:{each:.018,from:'start'}},1.05)
    .to(small,{opacity:1,yPercent:0,duration:1,ease:'expo.out',stagger:.07},1.15)
    .to(closeBtn,{opacity:1,y:0,duration:.5,ease:'expo.out'},1.3);
}
function closePanel(){
  if(!panelOpen) return;
  panelReady=false;
  gsap.killTweensOf([panelEl,'.pn-anim','.lib-stage',closeBtn,FADE_UI]);
  panelFx.reset();
  const done=()=>{
    panelOpen=false;
    viewLib.classList.remove('panel-open');
    panelEl.setAttribute('aria-hidden','true');
    gsap.set(panelEl,{visibility:'hidden'});
  };
  if(REDUCED){
    gsap.set('.lib-stage',{filter:'none',scale:1});
    gsap.set(FADE_UI,{opacity:1});
    done(); return;
  }
  const tl=gsap.timeline({onComplete:done});
  tl.to(closeBtn,{opacity:0,y:16,duration:.25},0)
    .to(panelEl,{yPercent:-101,duration:.8,ease:'expo.inOut'},0)
    .to('.lib-stage',{filter:'blur(0px)',scale:1,duration:.8,ease:'expo.inOut'},0)
    .to(FADE_UI,{opacity:1,duration:.5},.45);
}

/* ---- painel: parallax bem sutil, ativo desde a entrada ---- */
let panelReady=false;
const panelFx=(()=>{
  const layers=[['.panel-name',6],['.panel-desc',9],['.panel-num',-11],['.panel-year',-8],['.panel-bl',5],['.panel-br',-7]];
  const q=new Map();
  function qt(el,prop,dur){ const k=el.__id||(el.__id=Math.random()); const key=k+prop; if(!q.has(key)) q.set(key,gsap.quickTo(el,prop,{duration:dur,ease:'power3.out'})); return q.get(key); }
  function move(e){
    if(!panelReady||REDUCED) return;
    const r=panelEl.getBoundingClientRect();
    const nx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width)*2-1)), ny=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height)*2-1));
    layers.forEach(([sel,d])=>{ const el=panelEl.querySelector(sel); if(!el) return; qt(el,'x',1.1)(nx*d); qt(el,'y',1.1)(ny*d*.6); });
    const p=panelEl.querySelector('.panel-poster'); if(!p) return;
    gsap.set(p,{transformPerspective:1800});
    qt(p,'rotationY',1)(nx*2); qt(p,'rotationX',1)(-ny*1.4);
  }
  function reset(){
    const p=panelEl.querySelector('.panel-poster'); const im=p&&p.querySelector('.ph img');
    const els=[p,im,...layers.map(([s])=>panelEl.querySelector(s))].filter(Boolean);
    q.clear();
    gsap.to(els,{x:0,y:0,rotationX:0,rotationY:0,duration:.6,ease:'power3.out',overwrite:'auto'});
  }
  panelEl.addEventListener('mousemove',move);
  panelEl.addEventListener('mouseleave',()=>{ if(panelReady) reset(); });
  return {reset};
})();
closeBtn.addEventListener('click',closePanel);
document.getElementById('panel-backdrop').addEventListener('click',closePanel);
addEventListener('keydown',e=>{ if(e.key==='Escape') closePanel(); });
addEventListener('resize',()=>{ if(built) layoutWheel(); });

/* =====================================================================
   START
===================================================================== */
function startSite(){
  if(START_VIEW === 'home'){ START_DONE = true; playIntro(); return; }
  // entrada direta em /portfolio/ ou /sobre/: sem a animação de abertura da home
  endStateShapes();
  gsap.set([homeUI, nav], {opacity: 1});
  swapViews(START_VIEW);
  if(START_VIEW === 'library') G.curtain = 1;
  history.replaceState({view: START_VIEW}, '', VIEW_ROUTES[START_VIEW]);
  START_DONE = true;
}
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(()=>setTimeout(startSite,120));
}else{
  setTimeout(startSite,300);
}

/* =====================================================================
   SOBRE (replica da tela /about)
===================================================================== */
const viewAbout = document.getElementById('view-about');
const veil = document.getElementById('page-veil');
const AB_SERV = [
  {n:'Criação de Websites',d:'Sites institucionais, landing pages e portfólios desenvolvidos com foco em conversão, performance e identidade visual.',
   b:['Design exclusivo e responsivo','Otimizado para mobile e velocidade','Integração com WhatsApp e redes sociais','Painel de edição fácil (quando aplicável)']},
  {n:'Registro & Gestão de Domínios',d:'Registro, renovação e gerenciamento completo do seu domínio .com.br ou .com, sem complicação.',
   b:['Busca e registro de domínios','Configuração de DNS e e-mail profissional','Alertas de renovação automáticos','Transferência e migração assistida']},
  {n:'Otimização & SEO Básico',d:'Fazemos seu site ser encontrado pelo Google com técnicas de SEO on-page e otimização de performance.',
   b:['Configuração de meta tags e estrutura','Google Analytics e Search Console','Velocidade e Core Web Vitals','SEO local (Google Business)']},
  {n:'Suporte & Manutenção',d:'Seu site sempre no ar, seguro e atualizado. Monitoramento contínuo e suporte ágil por WhatsApp.',
   b:['Monitoramento 24/7 de disponibilidade','Atualizações de conteúdo e plugins','Backups automáticos mensais','Suporte via WhatsApp em horário comercial']}
];
const AB_DIFF = [
  {t:'Design Exclusivo',d:'Nada de templates prontos. Cada site é projetado do zero, com identidade visual alinhada ao posicionamento da sua marca.'},
  {t:'Solução Ponta a Ponta',d:'Cuidamos de domínio, hospedagem, design, desenvolvimento e lançamento. Um único ponto de contato para tudo.'},
  {t:'Foco em Performance',d:'Sites rápidos, leves e otimizados para o Google. Medimos e entregamos resultados, não apenas pixels bonitos.'}
];
const AB_PROC = [
  {t:'Briefing',d:'Entendemos seu negócio, público-alvo, concorrência e objetivos em uma reunião estratégica.'},
  {t:'Planejamento',d:'Definimos arquitetura, wireframes, paleta de cores e estratégia de conteúdo.'},
  {t:'Desenvolvimento',d:'Codificamos e refinamos com feedbacks iterativos até você aprovar cada detalhe.'},
  {t:'Entrega & Lançamento',d:'Publicamos, configuramos domínio, analytics e entregamos o site pronto para converter.'}
];
const AB_PHOTO = {luis:'/assets/images/team/luis.jpg',joao:'/assets/images/team/joao.jpg'};
const AB_TEAM = [
  {r:'Back end',n:'Luis',f:'luis',t:'Desenvolvedor Back End & Co-fundador',
   d:'Cuida de tudo o que roda por trás do site: banco de dados, automações, domínios, hospedagem e integrações. Garante que cada projeto seja rápido, seguro e funcione sem dor de cabeça.',
   k:['Banco de Dados','Automações','Domínios & Hosting','Integrações','Performance']},
  {r:'Front end',n:'João',f:'joao',t:'Estratégia, Design & Co-fundador',
   d:'Pensa o negócio antes de qualquer pixel. Define a estratégia, conduz o design e a direção de arte e transforma o briefing em uma experiência que o cliente vê, entende e usa.',
   k:['Estratégia','Design','Direção de Arte','Front End','Gestão de Projetos']}
];
const AB_FAQ = [
  {q:'Quanto custa criar um site em Campo Grande?',
   a:'<p>Os sites da Céres Hub começam em R$ 800. O valor final depende do escopo: número de páginas, integrações necessárias, se inclui o registro do domínio e se haverá manutenção contínua depois do lançamento.</p><p>A Céres Hub monta o orçamento após uma reunião de descoberta, em que entende o negócio, o público-alvo e os objetivos. Fale pelo WhatsApp (67) 9 9247-3726 para receber uma estimativa do seu caso.</p>'},
  {q:'Quanto tempo leva para o site ficar pronto?',
   a:'<p>O prazo de entrega é de 30 dias, contados a partir da reunião de descoberta. Nesse período o projeto passa por quatro etapas:</p><ul><li>Descoberta: reunião estratégica sobre negócio, público-alvo, concorrência e objetivos.</li><li>Arquitetura e design: wireframes, paleta de cores e estratégia de conteúdo.</li><li>Desenvolvimento: codificação e refino com feedbacks iterativos até a aprovação.</li><li>Lançamento: publicação, configuração de domínio e analytics.</li></ul>'},
  {q:'A Céres Hub registra o domínio para mim?',
   a:'<p>Sim. O serviço de Registro & Gestão de Domínios cobre a busca e o registro do domínio, a configuração de DNS e e-mail profissional, alertas automáticos de renovação e a transferência ou migração assistida de domínios que já existem.</p>'},
  {q:'O site vai funcionar bem no celular?',
   a:'<p>Sim. Todo site entregue pela Céres Hub é responsivo e otimizado para mobile e velocidade, com acompanhamento dos Core Web Vitals, as métricas que o Google usa para medir a experiência de carregamento e estabilidade visual da página.</p>'},
  {q:'Vocês dão suporte depois que o site entra no ar?',
   a:'<p>Sim. O serviço de Suporte & Manutenção inclui monitoramento de disponibilidade, atualizações de conteúdo e plugins, backups automáticos mensais e atendimento via WhatsApp em horário comercial.</p>'},
  {q:'O que é SEO local e a Céres Hub faz esse serviço?',
   a:'<p>SEO local é o conjunto de otimizações que faz uma empresa aparecer nas buscas de quem procura serviços perto de si, como “agência digital em Campo Grande” ou “criação de sites em Campo Grande”, e também no mapa do Google.</p><p>A Céres Hub faz esse trabalho: configuração de meta tags e estrutura, Google Analytics e Search Console, ajustes de velocidade e Core Web Vitals e otimização do perfil no Google Business.</p>'},
  {q:'A Céres Hub atende empresas fora de Campo Grande?',
   a:'<p>Sim. A Céres Hub é sediada em Campo Grande, Mato Grosso do Sul, e atende empresas de outras cidades de MS e do restante do Brasil. Todo o processo (reunião de descoberta, aprovações de design e lançamento) é conduzido por videochamada e WhatsApp, sem necessidade de encontro presencial.</p>'}
];

/* ---- sanfona genérica ---- */
function makeAcc(listEl,hover){
  const items=[...listEl.children];
  function open(li){
    items.forEach(x=>{
      const bd=x.querySelector('.bd');
      if(x===li && !x.classList.contains('open')){
        x.classList.add('open');
        gsap.fromTo(bd,{height:0},{height:'auto',duration:REDUCED?0:.55,ease:'expo.out'});
      }else if(x!==li && x.classList.contains('open')){
        x.classList.remove('open');
        gsap.to(bd,{height:0,duration:REDUCED?0:.45,ease:'expo.out'});
      }
    });
  }
  items.forEach(li=>{
    li.addEventListener('click',e=>{
      if(e.target.closest('a')) return;
      if(li.classList.contains('open') && !hover){
        li.classList.remove('open'); gsap.to(li.querySelector('.bd'),{height:0,duration:REDUCED?0:.45,ease:'expo.out'});
      } else open(li);
    });
    if(hover) li.addEventListener('mouseenter',()=>open(li));
  });
  return items;
}

/* ---- serviços ---- */
const abRes = document.getElementById('ab-res');
AB_SERV.forEach((s,i)=>{
  const li=document.createElement('li');
  li.className='ab-res-item'+(i===0?' open':'');
  li.innerHTML=`<div class="hd"><span>(${String(i+1).padStart(2,'0')})</span><span>${s.n}</span></div><span class="go"><a href="https://wa.me/5567992473726" target="_blank" rel="noopener">Falar no WhatsApp →</a></span><div class="bd"><p>${s.d}</p><ul class="bl">${s.b.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  abRes.appendChild(li);
});
const abItems = makeAcc(abRes,true);
gsap.set(abItems[0].querySelector('.bd'),{height:'auto'});

/* ---- FAQ ---- */
const abFaq = document.getElementById('ab-faq');
AB_FAQ.forEach((f,i)=>{
  const li=document.createElement('li');
  li.className='ab-res-item';
  li.innerHTML=`<div class="hd"><span>(${String(i+1).padStart(2,'0')})</span><span>${f.q}</span></div><div class="bd"><div>${f.a}</div></div>`;
  abFaq.appendChild(li);
});
makeAcc(abFaq,false);

/* ---- processo ---- */
const abPc = document.getElementById('ab-pc');
AB_PROC.forEach((p,i)=>{
  const li=document.createElement('li');
  li.innerHTML=`<i class="ln"></i><span class="n">${String(i+1).padStart(2,'0')}</span><span class="t">${p.t}</span><span class="d">${p.d}</span>`;
  abPc.appendChild(li);
});

/* ---- equipe ---- */
const abTm = document.getElementById('ab-tm');
AB_TEAM.forEach(p=>{
  const c=document.createElement('article');
  c.className='ab-tm-c';
  c.innerHTML=`<div class="r"><span>${p.r}</span><span>CÉRES HUB®</span></div><i class="shd"></i><div class="ph"><img src="${AB_PHOTO[p.f]}" alt="${p.n}, ${p.t}" draggable="false"></div><div class="nm">${p.n}</div><div class="rl">${p.t}</div><p class="bio">${p.d}</p><div class="tg">${p.k.map(k=>`<span>${k}</span>`).join('')}</div>`;
  abTm.appendChild(c);
});

/* ---- diferenciais: trilha guiada pelo scroll ---- */
const trWrap = document.getElementById('ab-tr-wrap');
const trArea = document.getElementById('ab-tr-area');
const trBg = document.getElementById('ab-tr-bg');
const trFg = document.getElementById('ab-tr-fg');
const trCta = document.getElementById('ab-tr-cta');
const trCards=[], trDots=[];
AB_DIFF.forEach((p,i)=>{
  const c=document.createElement('article');
  c.className='ab-tr-card';
  c.innerHTML=`<span class="pn">${String(i+1).padStart(2,'0')}</span><span class="pt">${p.t}</span><p class="pd">${p.d}</p>`;
  trArea.appendChild(c); trCards.push(c);
  const d=document.createElement('span'); d.className='ab-tr-dot'; trArea.appendChild(d); trDots.push(d);
});
let trLen=1, trNodes=[0,.5,1], trStatic=false;
function trLayout(){
  trStatic = REDUCED || innerWidth<=760;
  trWrap.classList.toggle('is-static',trStatic);
  if(trStatic){ trCta.style.opacity=1; return; }
  const W=trArea.clientWidth, H=trArea.clientHeight;
  const step=Math.max(36,Math.min(150,H*0.16));
  const cw=W*0.30, gap=(W-cw*3)/2;
  const xs=[0,cw+gap,2*(cw+gap)], ys=[8,8+step,8+step*2];
  trCards.forEach((c,i)=>{ c.style.left=xs[i]+'px'; c.style.top=(ys[i]+16)+'px'; trDots[i].style.left=xs[i]+'px'; trDots[i].style.top=ys[i]+'px'; });
  const d=`M ${xs[0]} ${ys[0]} H ${xs[1]} V ${ys[1]} H ${xs[2]} V ${ys[2]} H ${W}`;
  trBg.setAttribute('d',d); trFg.setAttribute('d',d);
  trLen=trFg.getTotalLength();
  trFg.style.strokeDasharray=trLen;
  const l1=xs[1]-xs[0], l2=ys[1]-ys[0], l3=xs[2]-xs[1], l4=ys[2]-ys[1];
  trNodes=[0,(l1+l2)/trLen,(l1+l2+l3+l4)/trLen];
  trUpdate();
}
const clamp01=v=>Math.max(0,Math.min(1,v));
function trUpdate(){
  if(trStatic) return;
  const range=trWrap.offsetHeight-innerHeight;
  const top=trWrap.getBoundingClientRect().top-viewAbout.getBoundingClientRect().top;
  const p=clamp01(-top/range);
  const lead=.08, span=.86;                  // início e fim da trilha dentro do scroll
  const q=clamp01((p-lead)/span);            // 0..1 ao longo da linha
  trFg.style.strokeDashoffset=trLen*(1-q);
  trCards.forEach((c,i)=>{
    const a=clamp01((q-trNodes[i]+.01)/.12); // aparece quando a linha chega no nó
    c.style.opacity=a;
    c.style.transform=`translateY(${(1-a)*38}px)`;
    trDots[i].style.transform=`scale(${a})`;
  });
  trCta.style.opacity=clamp01((q-.93)/.07);
}
viewAbout.addEventListener('scroll',trUpdate,{passive:true});
addEventListener('resize',trLayout);

/* ---- índice do hero e links internos de rolagem ---- */
function abScrollTo(id){
  const el=document.getElementById(id); if(!el) return;
  viewAbout.scrollTo({top:el.offsetTop,behavior:REDUCED?'auto':'smooth'});
}
viewAbout.querySelectorAll('[data-sec]').forEach(li=>{ li.style.cursor='pointer'; li.addEventListener('click',()=>abScrollTo(li.dataset.sec)); });
viewAbout.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); abScrollTo(a.dataset.scroll); }));

/* ---- hero: letras cinza gigantes ---- */
const abHcv = document.getElementById('ab-hero-cv');
const abHx = abHcv.getContext('2d');
function drawAboutHero(){
  const dpr = Math.min(devicePixelRatio||1,2);
  const W = abHcv.clientWidth, H = abHcv.clientHeight;
  if(!W||!H) return;
  if(abHcv.width!==W*dpr||abHcv.height!==H*dpr){ abHcv.width=W*dpr; abHcv.height=H*dpr; }
  abHx.setTransform(dpr,0,0,dpr,0,0);
  abHx.clearRect(0,0,W,H);
  abHx.fillStyle='#aed2f0';
  const fs = Math.max(H*1.55, 520);
  abHx.font = `${fs}px "Archivo Black", sans-serif`;
  abHx.textBaseline='alphabetic';
  const sc = viewAbout.scrollTop;
  const word = ['C','É','R','E','S'];
  let x = -fs*0.38 - sc*0.12;
  const base = H*0.5 + fs*0.36;
  word.forEach(ch=>{ abHx.fillText(ch,x,base); x += abHx.measureText(ch).width*0.98; });
}
viewAbout.addEventListener('scroll',()=>{ if(current==='about') drawAboutHero(); },{passive:true});
addEventListener('resize',()=>{ if(current==='about'){ drawAboutHero(); } });
if(document.fonts&&document.fonts.load) document.fonts.load('100px "Archivo Black"').then(()=>{ if(current==='about') drawAboutHero(); });

/* ---- rodapé: letras caindo ---- */
const fcv = document.getElementById('ab-foot-cv');
const fcx = fcv.getContext('2d');
const FP = {letters:[],run:false,W:0,H:0,spawned:false,t0:0};
function footSize(){
  const dpr = Math.min(devicePixelRatio||1,2);
  FP.W = fcv.clientWidth; FP.H = fcv.clientHeight;
  fcv.width = FP.W*dpr; fcv.height = FP.H*dpr;
  fcx.setTransform(dpr,0,0,dpr,0,0);
}
function footSpawn(){
  footSize(); FP.letters = [];
  const word = ['C','É','R','E','S'];
  const n = innerWidth<760 ? 26 : 56;
  const base = Math.max(46, Math.min(FP.W/14, 118));
  for(let i=0;i<n;i++){
    const s = base*(0.75+Math.random()*0.5);
    FP.letters.push({ch:word[i%5],x:Math.random()*FP.W,y:-s*(1+i*0.55),vx:(Math.random()-.5)*2,vy:0,r:s*0.42,s,a:Math.random()*6.28,w:(Math.random()-.5)*0.08,delay:i*0.045});
  }
  FP.t0 = performance.now(); FP.spawned = true;
}
function footStep(now){
  if(!FP.run) return;
  const el = (now-FP.t0)/1000, L = FP.letters, G_ = 0.42, floor = FP.H;
  L.forEach(p=>{
    if(el<p.delay) return;
    p.vy += G_; p.x += p.vx; p.y += p.vy; p.a += p.w; p.w *= 0.985; if(Math.abs(p.w)<0.0015) p.w = 0;
    if(p.y+p.r>floor){ p.y = floor-p.r; p.vy *= -0.22; p.vx *= 0.9; p.w *= 0.85; }
    if(p.x-p.r<0){ p.x=p.r; p.vx*=-0.4; } else if(p.x+p.r>FP.W){ p.x=FP.W-p.r; p.vx*=-0.4; }
  });
  for(let k=0;k<2;k++) for(let i=0;i<L.length;i++){
    const a=L[i]; if(el<a.delay) continue;
    for(let j=i+1;j<L.length;j++){
      const b=L[j]; if(el<b.delay) continue;
      const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||.01, m=a.r+b.r;
      if(d<m){
        const o=(m-d)/2, nx=dx/d, ny=dy/d;
        a.x-=nx*o; a.y-=ny*o; b.x+=nx*o; b.y+=ny*o;
        const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(rv<0){ const j2=-rv*0.55; a.vx-=nx*j2; a.vy-=ny*j2; b.vx+=nx*j2; b.vy+=ny*j2; }
        a.vx*=.985; b.vx*=.985; a.w*=.9; b.w*=.9;
      }
    }
  }
  footDraw();
  requestAnimationFrame(footStep);
}
function footDraw(){
  fcx.clearRect(0,0,FP.W,FP.H);
  fcx.fillStyle='#fff'; fcx.textAlign='center'; fcx.textBaseline='middle';
  FP.letters.forEach(p=>{
    fcx.save(); fcx.translate(p.x,p.y); fcx.rotate(p.a);
    fcx.font=`${p.s}px "Archivo Black", sans-serif`;
    fcx.fillText(p.ch,0,p.s*0.04);
    fcx.restore();
  });
}
function footStart(){
  if(FP.run) return;
  if(!FP.spawned) footSpawn();
  if(REDUCED){
    // pilha estática no chão
    FP.letters.forEach((p,i)=>{ p.x=(i*37)%FP.W; p.y=FP.H-p.r-((i*53)%140); p.a=(i%7)*.5; });
    footDraw(); return;
  }
  FP.run = true; FP.t0 = performance.now(); requestAnimationFrame(footStep);
}
function footStop(){ FP.run = false; }
new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting) footStart(); else { footStop(); } });
},{root:viewAbout,threshold:.25}).observe(document.querySelector('.ab-foot-cv-wrap'));

/* ---- Sobre: sistema de animações ---- */
const abFx = !REDUCED;
const heroRoot = document.querySelector('.ab-sticky');

/* títulos viram palavras que sobem de uma máscara */
function abSplitWords(el){
  if(el.dataset.split) return; el.dataset.split='1';
  const txt=el.textContent.trim(); el.setAttribute('aria-label',txt); el.textContent='';
  txt.split(/\s+/).forEach((tok,i,arr)=>{
    const w=document.createElement('span'); w.className='aw'; w.setAttribute('aria-hidden','true');
    const n=document.createElement('span'); n.className='awi'; n.textContent=tok; w.appendChild(n); el.appendChild(w);
    if(i<arr.length-1) el.appendChild(document.createTextNode(' '));
  });
  el.classList.add('aw-host');
}

function abPlayCard(el,d){
  gsap.timeline({delay:d})
    .to(el,{clipPath:'inset(0% 0 0 0)',duration:1.4,ease:'expo.inOut'},0)
    .to(el.querySelector('.ph img'),{scale:1,duration:2,ease:'expo.out'},.1)
    .to(el.querySelector('.shd'),{'--k':1,duration:1.3,ease:'expo.out'},.85)
    .to(el.querySelectorAll('.nm,.rl,.bio,.tg'),{y:0,opacity:1,duration:1,ease:'expo.out',stagger:.09},.55);
}
function abPlay(el,d){
  if(el.classList.contains('aw-host')){
    gsap.to(el.querySelectorAll('.awi'),{yPercent:0,duration:1.15,ease:'expo.out',stagger:.05,delay:d});
  }else if(el.classList.contains('ab-res-item')){
    gsap.to(el,{y:0,opacity:1,duration:1.05,ease:'expo.out',delay:d,clearProps:'transform,opacity'});
  }else if(el.tagName==='LI' && el.parentElement.id==='ab-pc'){
    const q=sel=>el.querySelector(sel);
    gsap.timeline({delay:d})
      .to(q('.ln'),{scaleX:1,duration:1.2,ease:'expo.inOut'},0)
      .to(q('.n'),{clipPath:'inset(0% 0 0% 0)',y:0,duration:1.1,ease:'expo.out'},.15)
      .to([q('.t'),q('.d')],{y:0,opacity:1,duration:.9,ease:'expo.out',stagger:.1},.3);
  }else if(el.id==='ab-tm'){
    el.querySelectorAll('.ab-tm-c').forEach((c,i)=>abPlayCard(c,d+i*.18));
  }else if(el.classList.contains('ab-tm-c')){
    abPlayCard(el,d);
  }else if(false){
    gsap.timeline({delay:d})
      .to(el,{clipPath:'inset(0% 0 0 0)',duration:1.4,ease:'expo.inOut'},0)
      .to(el.querySelector('.ph img'),{scale:1,duration:2,ease:'expo.out'},.1)
      .to(el.querySelectorAll('.nm,.rl,.bio,.tg'),{y:0,opacity:1,duration:1,ease:'expo.out',stagger:.09},.55);
  }else{
    gsap.to(el,{opacity:1,y:0,duration:1,ease:'expo.out',delay:d,clearProps:'transform'});
  }
}

const abIO = new IntersectionObserver(es=>{
  let k=0;
  es.filter(e=>e.isIntersecting)
    .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left)
    .forEach(en=>{ abIO.unobserve(en.target); abPlay(en.target,k*.08); k++; });
},{root:viewAbout,threshold:.12,rootMargin:'0px 0px -5% 0px'});

let abReady=false;
function abPrepare(){
  if(abReady || !abFx) return; abReady=true;
  const targets=[];
  viewAbout.querySelectorAll('h1[data-rv],h2[data-rv]').forEach(abSplitWords);
  // estado inicial
  viewAbout.querySelectorAll('.aw-host').forEach(h=>{
    gsap.set(h.querySelectorAll('.awi'),{yPercent:118});
    if(!h.closest('.ab-sticky')) targets.push(h);
  });
  viewAbout.querySelectorAll('[data-rv]:not(.aw-host)').forEach(e=>{
    if(e.closest('.ab-sticky')) return;
    gsap.set(e,{opacity:0,y:28}); targets.push(e);
  });
  viewAbout.querySelectorAll('.ab-res-item').forEach(e=>{ gsap.set(e,{opacity:0,y:60}); targets.push(e); });
  viewAbout.querySelectorAll('#ab-pc li').forEach(e=>{
    gsap.set(e.querySelector('.ln'),{scaleX:0});
    gsap.set(e.querySelector('.n'),{clipPath:'inset(100% 0 0% 0)',y:50});
    gsap.set([e.querySelector('.t'),e.querySelector('.d')],{y:26,opacity:0});
    targets.push(e);
  });
  viewAbout.querySelectorAll('.ab-tm-c').forEach(e=>{
    gsap.set(e,{clipPath:'inset(100% 0 0 0)'});
    gsap.set(e.querySelector('.ph img'),{scale:1.3});
    gsap.set(e.querySelector('.shd'),{'--k':0});
    gsap.set(e.querySelectorAll('.nm,.rl,.bio,.tg'),{y:34,opacity:0});
  });
  targets.push(document.getElementById('ab-tm'));
  targets.forEach(t=>abIO.observe(t));
}

/* entrada do hero (toda vez que a tela Sobre abre) */
function heroIntro(){
  if(!abFx) return;
  const words=heroRoot.querySelectorAll('h1 .awi');
  const bits=heroRoot.querySelectorAll('.ab-hero-vol,.ab-hero-para,.ab-scroll');
  const lis=heroRoot.querySelectorAll('.ab-hero-list li');
  gsap.killTweensOf([...words,...bits,...lis,'#ab-hero-cv']);
  gsap.set(words,{yPercent:118});
  gsap.set(bits,{opacity:0,y:22});
  gsap.set('.ab-hero-list',{opacity:1,y:0,clearProps:'transform'});
  gsap.set(lis,{opacity:0,x:-18});
  gsap.timeline({delay:.55})
    .fromTo('#ab-hero-cv',{xPercent:-7,opacity:0},{xPercent:0,opacity:1,duration:1.7,ease:'expo.out'},0)
    .to(words,{yPercent:0,duration:1.2,ease:'expo.out',stagger:.045},.1)
    .to(bits,{opacity:1,y:0,duration:.9,ease:'expo.out',stagger:.1},.55)
    .to(lis,{opacity:1,x:0,duration:.8,ease:'expo.out',stagger:.07},.7);
}

/* transições entre seções: a seção sobe como um cartão e o hero recua */
const abSecs=['ab-s1','ab-s2','ab-s3','ab-s4','ab-band','ab-s5'].map(id=>document.getElementById(id));
function abSecFx(){
  if(!abFx || current!=='about') return;
  const vr=viewAbout.getBoundingClientRect(), H=innerHeight, mob=innerWidth<=760;
  let under=null;
  abSecs.forEach((sec,si)=>{
    const top=sec.getBoundingClientRect().top-vr.top;
    const e=clamp01(1-top/(H*.8));
    if(e>=1){ if(sec._fx!==1){ sec.style.clipPath='none'; sec._fx=1; } return; }
    sec._fx=0;
    if(si>0 && !under) under=abSecs[si-1];
    const k=Math.pow(1-e,2);
    const side=k*(mob?4:3.4), rad=k*(mob?26:48);
    sec.style.clipPath=`inset(0 ${side.toFixed(2)}% 0 ${side.toFixed(2)}% round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0 0)`;
  });
  viewAbout.style.background = under ? getComputedStyle(under).backgroundColor : '';
  const t1=abSecs[0].getBoundingClientRect().top-vr.top;
  const p=clamp01(1-t1/H);
  heroRoot.style.transform=`scale(${(1-.07*p).toFixed(4)})`;
  heroRoot.style.filter=p>0.001?`brightness(${(1-.32*p).toFixed(3)})`:'none';
}
viewAbout.addEventListener('scroll',abSecFx,{passive:true});
addEventListener('resize',abSecFx);

/* faixa em movimento: acelera com a rolagem */
const bandTracks=[...document.querySelectorAll('.ab-band-track')];
const BD={pos:[0,0],uw:[1,1],vis:false,last:0};
bandTracks.forEach(t=>{
  const unit=t.dataset.txt;
  for(let i=0;i<6;i++){ const sp=document.createElement('span'); sp.textContent=unit; t.appendChild(sp); }
});
function bandMeasure(){ bandTracks.forEach((t,i)=>{ BD.uw[i]=(t.scrollWidth/6)||1; }); }
new IntersectionObserver(es=>{ BD.vis=es[0].isIntersecting; if(BD.vis) bandMeasure(); },{root:viewAbout,threshold:0}).observe(document.getElementById('ab-band'));
addEventListener('resize',bandMeasure);

/* rolagem suave com inércia (só mouse/trackpad; toque segue nativo) */
const SM={cur:0,target:0,active:false};
viewAbout.addEventListener('wheel',e=>{
  if(!abFx||current!=='about'||e.ctrlKey) return;
  e.preventDefault();
  let dy=e.deltaY; if(e.deltaMode===1) dy*=34; else if(e.deltaMode===2) dy*=innerHeight;
  dy=Math.max(-110,Math.min(110,dy))*.7;
  if(!SM.active){ SM.cur=viewAbout.scrollTop; SM.target=SM.cur; }
  const max=viewAbout.scrollHeight-viewAbout.clientHeight;
  SM.target=Math.max(0,Math.min(max,SM.target+dy)); SM.active=true;
},{passive:false});
gsap.ticker.add((time,dt)=>{
  if(current!=='about') return;
  if(SM.active){
    SM.cur+=(SM.target-SM.cur)*.075;
    if(Math.abs(SM.target-SM.cur)<.4){ SM.cur=SM.target; SM.active=false; }
    viewAbout.scrollTop=SM.cur;
  }
  const st=viewAbout.scrollTop, vel=st-BD.last; BD.last=st;
  if(BD.vis && abFx){
    const step=Math.min(dt,50)/16.7;
    bandTracks.forEach((t,i)=>{
      BD.pos[i]+= (1.1+Math.abs(vel)*.55)*step;
      const m=BD.pos[i]%BD.uw[i];
      const dir=+t.dataset.dir;
      gsap.set(t,{x: dir<0 ? -m : -BD.uw[i]+m});
    });
  }
});

document.getElementById('ab-top').addEventListener('click',e=>{
  e.preventDefault(); viewAbout.scrollTo({top:0,behavior:REDUCED?'auto':'smooth'});
});

/* menu muda de cor conforme a seção que está por baixo dele */
function abNavTone(){
  if(current!=='about') return;
  const nv=document.getElementById('nav');
  const y=viewAbout.scrollTop+30;
  let dark=false;
  ['ab-s1','ab-s3','ab-band'].forEach(id=>{ const e=document.getElementById(id); if(y>=e.offsetTop && y<e.offsetTop+e.offsetHeight) dark=true; });
  const f=document.querySelector('.ab-foot-cv-wrap');
  if(f && y>=f.offsetTop+f.offsetParent.offsetTop-0 && viewAbout.scrollTop+30>=f.getBoundingClientRect().top+viewAbout.scrollTop-viewAbout.getBoundingClientRect().top) dark=true;
  nv.style.color = dark ? '#fff' : '#000';
}
viewAbout.addEventListener('scroll',abNavTone,{passive:true});

function enterAbout(){
  viewAbout.scrollTop = 0;
  abPrepare(); drawAboutHero(); abNavTone(); trLayout(); abSecFx(); bandMeasure(); heroIntro();
  document.getElementById('mi-about').classList.add('is-current');
}

