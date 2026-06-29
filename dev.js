(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches, doc=document.documentElement;

  /* live stats: refreshed daily by GitHub Action into /dev-stats.json (CSP connect-src 'self') */
  fetch('/dev-stats.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(s){
    if(!s||typeof s!=='object')return;
    document.querySelectorAll('.stat').forEach(function(card){
      var v=card.querySelector('.v'),l=card.querySelector('.l');if(!v||!l)return;
      var k=l.textContent.toLowerCase(),val=null;
      if(k.indexOf('commit')>=0)val=s.commits;
      else if(k.indexOf('contrib')>=0)val=s.contributions;
      else if(k.indexOf('repo')>=0)val=s.repos;
      else if(k.indexOf('year')>=0)val=s.years;
      if(val!=null&&isFinite(val)){v.setAttribute('data-to',String(val));if(typeof countUp==='function')countUp(v);}
    });
  }).catch(function(){});
  var IC={
    code:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 6 2 12l6 6M16 6l6 6-6 6"/>',
    layers:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 3 2 8l10 5 10-5-10-5ZM2 16l10 5 10-5"/>',
    ai:'<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    chip:'<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/>',
    tools:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 2.9 2.9 6-6a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.9-2.9 2.6-2.6Z"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="m3 6 9 7 9-7"/>',
    link:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    linkedin:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="2"/>',
    cam:'<rect x="2" y="7" width="20" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" d="M8 7l2-3h4l2 3"/>',
    discord:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M5 5.5h14v11H9l-4 3.5V5.5Z"/><circle cx="9.6" cy="11" r="1.3" fill="currentColor"/><circle cx="14.4" cy="11" r="1.3" fill="currentColor"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    check:'<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M4 12l5 5L20 6"/>'
  };

  var stack=[
    {cat:'Languages',ic:IC.code,items:['Python','TypeScript','C++','C','Java','JavaScript','SQL','HTML','CSS']},
    {cat:'Web & Realtime',ic:IC.layers,items:['Next.js','React','WebRTC','WebSocket','LiveKit','Svelte','Node.js','Tailwind CSS','Deck.gl','Mapbox','Vite','Zod']},
    {cat:'AI / ML & Agents',ic:IC.ai,items:['PyTorch','CUDA','Claude','GPT','Gemini','AWS Bedrock','Groq','Depth Anything v2','Fetch.ai uAgents','Agent S','Devin','Deepgram','ElevenLabs','Streamlit']},
    {cat:'Backends & Data',ic:IC.cpu,items:['PostgreSQL','Redis','FastAPI','NumPy','pandas','MongoDB','Supabase','Express','Flask','Prisma','Drizzle','SQLite','tRPC','Auth0','NextAuth','World ID']},
    {cat:'Cloud & Infra',ic:IC.tools,items:['AWS','Google Cloud','Docker','Kubernetes','Cloudflare','Vercel','Firebase','OpenTelemetry','Arize Phoenix','Browserbase','Sentry','Linux']},
    {cat:'Robotics & Hardware',ic:IC.chip,items:['roboRIO','WPILib','FPGA','STM32','Talon FX','SPARK MAX','Raspberry Pi','Arduino Uno','HX711']}
  ];
  var sEl=document.getElementById('stack');
  stack.forEach(function(s){
    var p=document.createElement('div');p.className='panel rise';
    p.innerHTML='<div class="cat"><svg viewBox="0 0 24 24">'+s.ic+'</svg>'+s.cat+'</div><div class="chips">'+
      s.items.map(function(t){return '<span class="chip">'+t+'</span>';}).join('')+'</div>';
    sEl.appendChild(p);
  });

  var ints=['Writing','Board Games','Stargazing','Philosophy','Travel','Trivia','History & Geography','Civic Engagement','Film & TV'];
  var iEl=document.getElementById('ints');
  ints.forEach(function(t){var c=document.createElement('span');c.className='chip';c.textContent=t;iEl.appendChild(c);});

  /* email shown obfuscated (non-scrapable); real address assembled at click time */
  function deobf(s){return s.replace(/ \[dot\] /g,'.').replace(/ \[at\] /g,'@');}
  var contacts=[
    {ic:IC.mail,lab:'Email',val:'karthik [dot] subramanian [at] berkeley [dot] edu',email:true,copy:true},
    {ic:IC.linkedin,lab:'LinkedIn',val:'/in/karthik-subramanian-07',href:'https://www.linkedin.com/in/karthik-subramanian-07',ext:true},
    {ic:IC.cam,lab:'Instagram',val:'@winner.karthik',href:'https://www.instagram.com/winner.karthik',ext:true},
    {ic:IC.discord,lab:'Discord',val:'karthik07',copy:'karthik07'}
  ];
  var cEl=document.getElementById('contact');
  function esc(s){return s.replace(/"/g,'&quot;');}
  contacts.forEach(function(c){
    var item=document.createElement('div');item.className='contact-item';
    var inner='<span class="ic"><svg viewBox="0 0 24 24">'+c.ic+'</svg></span><span class="tx"><span class="lab">'+c.lab+'</span><span class="val">'+c.val+'</span></span>';
    var main;
    if(c.href){main='<a class="cmain" href="'+c.href+'"'+(c.ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+inner+'</a>';}
    else if(c.email){main='<button type="button" class="cmain email-open" data-email="'+esc(c.val)+'" aria-label="Email Karthik (opens mail app)">'+inner+'</button>';}
    else{main='<span class="cmain">'+inner+'</span>';}
    var copy=c.copy?'<button type="button" class="copybtn"'+(c.email?' data-copy-email':' data-copy="'+esc(c.copy)+'"')+' aria-label="Copy '+c.lab+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+IC.copy+'</svg></button>':'';
    item.innerHTML=main+copy;
    cEl.appendChild(item);
  });
  function clip(t){try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t);}catch(e){}}
  function flash(btn){btn.classList.add('copied');btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+IC.check+'</svg>';
    setTimeout(function(){btn.classList.remove('copied');btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+IC.copy+'</svg>';},1300);}
  cEl.addEventListener('click',function(e){
    var cb=e.target.closest('.copybtn');
    if(cb){var item=cb.closest('.contact-item'),em=item&&item.querySelector('[data-email]');
      var val=cb.hasAttribute('data-copy')?cb.getAttribute('data-copy'):(em?deobf(em.getAttribute('data-email')):'');
      clip(val);flash(cb);return;}
    var open=e.target.closest('.email-open');
    if(open){window.location.href='mailto:'+deobf(open.getAttribute('data-email'));}
  });

  /* live age + clock */
  var birth=new Date(2007,5,19);
  function pl(n,w){return n+' '+w+(n===1?'':'s');}
  function tickAge(){var now=new Date(),y=now.getFullYear()-birth.getFullYear(),m=now.getMonth()-birth.getMonth(),d=now.getDate()-birth.getDate();
    if(d<0){m--;d+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}if(m<0){y--;m+=12;}
    document.getElementById('age').textContent=pl(y,'year')+', '+pl(m,'month')+', '+pl(d,'day');}
  tickAge();setInterval(tickAge,60000);
  function tickClock(){try{var t=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
    document.getElementById('clock').textContent='Berkeley · '+t;}catch(e){document.getElementById('clock').textContent='Berkeley';}}
  tickClock();setInterval(tickClock,1000);

  function countUp(el){var to=parseFloat(el.getAttribute('data-to'));
    if(reduce){el.textContent=to.toLocaleString();return;}
    var start=null,dur=2800;
    function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/dur,1),e=1-Math.pow(1-p,3);
      el.textContent=Math.round(to*e).toLocaleString();if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);}

  /* reveal */
  function reveal(el){el.classList.add('in');el.addEventListener('animationend',function(){el.classList.remove('rise','in');},{once:true});}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;
    if(t.id==='stats'){t.querySelectorAll('.stat').forEach(function(s,i){setTimeout(function(){reveal(s);},i*90);});
      t.querySelectorAll('.v').forEach(function(v,i){setTimeout(function(){countUp(v);},i*90);});}
    else reveal(t);
    io.unobserve(t);});},{threshold:.2});
  document.querySelectorAll('.rise:not(.stat),.chip,.panel,.sec-h .rule').forEach(function(el){io.observe(el);});
  io.observe(document.getElementById('stats'));
  document.querySelectorAll('.chips').forEach(function(g){g.querySelectorAll('.chip').forEach(function(c,i){c.style.transitionDelay=(i*32)+'ms';});});
  window.addEventListener('load',function(){document.querySelectorAll('.hero .rise,.topbar.rise').forEach(function(e,i){setTimeout(function(){reveal(e);},i*70);});});

  /* interactions: tilt + magnetic + craft parallax */
  if(!reduce){
    document.querySelectorAll('.stat').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();
        card.style.transform='translateY(-4px) rotateX('+(-((e.clientY-r.top)/r.height-.5)*9)+'deg) rotateY('+(((e.clientX-r.left)/r.width-.5)*9)+'deg)';});
      card.addEventListener('mouseleave',function(){card.style.transform='';});});
    document.querySelectorAll('.contact a,.contact button').forEach(function(a){
      a.addEventListener('mousemove',function(e){var r=a.getBoundingClientRect();
        a.style.transform='translate('+((e.clientX-r.left)/r.width-.5)*10+'px,'+(((e.clientY-r.top)/r.height-.5)*8-3)+'px)';});
      a.addEventListener('mouseleave',function(){a.style.transform='';});});
  }


  /* ===== orbiting ring dust ===== */
  var dustG=document.getElementById('dust'),dust=[],boost=0,craft=document.getElementById('craft'),craftSvg=craft&&craft.querySelector('svg');
  (function(){var N=reduce?10:16;for(var i=0;i<N;i++){
    var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    var d={a:Math.random()*6.283,sp:(Math.random()*.4+.5)*(Math.random()<.5?1:1),r:Math.random()*1.6+.7,
      rx:90+Math.random()*24,ry:23+Math.random()*8,o:Math.random()*.5+.45};
    c.setAttribute('r',d.r);c.setAttribute('fill',i%4===0?'#F2B093':'#E08A6B');c.setAttribute('opacity',d.o);
    dustG.appendChild(c);d.el=c;dust.push(d);}})();
  if(craft&&!reduce){craft.addEventListener('mouseenter',function(){boost=1;});craft.addEventListener('mouseleave',function(){boost=0;});}

  /* ===== interactive constellation starfield ===== */
  var cv=document.getElementById('sky'),ctx=cv.getContext('2d'),W,H,DPR,stars=[],neb=[],shoot=null,mx=-999,my=-999,tx=0,ty=0,pmx=0,pmy=0;
  function cssv(n){return getComputedStyle(doc).getPropertyValue(n).trim();}
  function isDark(){return doc.getAttribute('data-theme')!=='light';}
  function hexA(hex,a){hex=(hex||'#fff').replace('#','');if(hex.length===3)hex=hex.replace(/./g,'$&$&');
    var n=parseInt(hex,16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
  function size(){DPR=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;
    cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    var n=Math.min(220,Math.round(W*H/8000));stars=[];
    for(var i=0;i<n;i++){var z=Math.random();stars.push({x:Math.random()*W,y:Math.random()*H,r:z*1.6+.35,z:z*.9+.2,p:Math.random()*6.28,s:Math.random()*.02+.004});}
    neb=[{x:W*.22,y:H*.32,r:Math.max(W,H)*.42,h:'#E08A6B'},{x:W*.8,y:H*.72,r:Math.max(W,H)*.46,h:'#6C5CE0'}];}
  var t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    if(document.hidden)return;
    /* dust orbit (parametric; group rotation tilts it) */
    var bs=1+boost*1.6;
    for(var di=0;di<dust.length;di++){var d=dust[di];d.a+=0.006*d.sp*bs;
      d.el.setAttribute('cx',(125+d.rx*Math.cos(d.a)).toFixed(1));
      d.el.setAttribute('cy',(266+d.ry*Math.sin(d.a)).toFixed(1));}
    if(reduce)return;
    tx+=(pmx-tx)*.045;ty+=(pmy-ty)*.045;
    /* craft stays fixed; no cursor-follow */
    ctx.clearRect(0,0,W,H);
    var dark=isDark();
    for(var k=0;k<neb.length;k++){var nb=neb[k],g=ctx.createRadialGradient(nb.x+tx*10,nb.y+ty*10,0,nb.x+tx*10,nb.y+ty*10,nb.r);
      g.addColorStop(0,hexA(nb.h,dark?.10:.05));g.addColorStop(1,hexA(nb.h,0));ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
    var col=cssv('--star')||'#fff',base=parseFloat(cssv('--starA'))||.85,near=[];
    for(var i=0;i<stars.length;i++){var st=stars[i],tw=.35+.65*(.5+.5*Math.sin(st.p+(now-t0)*st.s)),px=st.x+tx*st.z*26,py=st.y+ty*st.z*26;
      ctx.beginPath();ctx.arc(px,py,st.r,0,6.283);ctx.fillStyle=hexA(col,base*tw*st.z);ctx.fill();
      var dx=px-mx,dy=py-my;if(dx*dx+dy*dy<20000)near.push([px,py]);}
    if(near.length){ctx.lineWidth=.7;
      for(var a=0;a<near.length;a++){var d2=(near[a][0]-mx)*(near[a][0]-mx)+(near[a][1]-my)*(near[a][1]-my);
        ctx.strokeStyle=hexA(col,Math.max(0,(1-d2/20000)*(dark?.5:.4)));ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(near[a][0],near[a][1]);ctx.stroke();
        for(var b=a+1;b<near.length;b++){var ddx=near[a][0]-near[b][0],ddy=near[a][1]-near[b][1],dd=ddx*ddx+ddy*ddy;
          if(dd<7200){ctx.strokeStyle=hexA(col,Math.max(0,(1-dd/7200)*(dark?.32:.26)));ctx.beginPath();ctx.moveTo(near[a][0],near[a][1]);ctx.lineTo(near[b][0],near[b][1]);ctx.stroke();}}}
      ctx.fillStyle=hexA(cssv('--coral')||'#E08A6B',dark?.9:.7);ctx.beginPath();ctx.arc(mx,my,2,0,6.283);ctx.fill();}
    if(shoot){shoot.t+=.014;var p=shoot.t/shoot.dur;if(p>=1)shoot=null;
      else{var a2=p<.15?p/.15:(p>.75?(1-p)/.25:1),sx=shoot.x+shoot.vx*p,sy=shoot.y+shoot.vy*p,
        grd=ctx.createLinearGradient(sx,sy,sx-shoot.vx*.05,sy-shoot.vy*.05);
        grd.addColorStop(0,hexA('#E08A6B',a2));grd.addColorStop(1,hexA('#E08A6B',0));
        ctx.strokeStyle=grd;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-shoot.vx*.05,sy-shoot.vy*.05);ctx.stroke();}}
  }
  function maybeShoot(){if(!shoot&&!document.hidden&&Math.random()<.6)shoot={x:Math.random()*W*.6,y:Math.random()*H*.35,vx:W*.55+Math.random()*W*.3,vy:H*.3+Math.random()*H*.2,t:0,dur:1.0};
    setTimeout(maybeShoot,3800+Math.random()*4200);}
  size();window.addEventListener('resize',size);
  if(!reduce){
    var cg=document.getElementById('cglow');
    window.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;pmx=(e.clientX/innerWidth-.5)*2;pmy=(e.clientY/innerHeight-.5)*2;
      if(cg){cg.style.opacity='1';cg.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';}});
    window.addEventListener('mouseout',function(){mx=-999;my=-999;});
    setTimeout(maybeShoot,2200);
  }else{var col=cssv('--star')||'#fff';for(var i=0;i<stars.length;i++){var st=stars[i];ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,6.283);ctx.fillStyle=hexA(col,.45);ctx.fill();}}
  requestAnimationFrame(frame);
})();
