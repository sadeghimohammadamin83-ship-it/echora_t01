(function(){
  document.querySelectorAll('img[data-img]').forEach(im=>{im.src=IMGS[im.dataset.img];});
  const lb=document.getElementById('lb'),lbi=lb.querySelector('img');
  document.querySelectorAll('.fig').forEach(p=>p.addEventListener('click',e=>{
    const im=p.querySelector('img'); lbi.src=im.src; lb.classList.add('on');}));
  lb.addEventListener('click',()=>lb.classList.remove('on'));
  const slides=[...document.querySelectorAll('.slide')],N=slides.length,stage=document.getElementById('stage');
  let i=0; const pad=n=>String(n).padStart(2,'0');
  function fit(){
    const vp=document.getElementById('viewport').getBoundingClientRect();
    const s=Math.min(vp.width/1920,vp.height/1080);
    stage.style.transform='scale('+s+')';
    stage.style.margin=((1080*s-1080)/2)+'px '+((1920*s-1920)/2)+'px';
  }
  function show(n){
    i=Math.max(0,Math.min(N-1,n));
    slides.forEach((s,k)=>s.classList.toggle('active',k===i));
    const t=pad(i+1)+' / '+pad(N);
    cnt.textContent=t; pgmini.textContent=t;
    const w=((i+1)/N*100)+'%'; progI.style.width=w; barI.style.width=w;
    try{history.replaceState(null,'','#'+(i+1));}catch(e){}
  }
  const next=()=>show(i+1),prev=()=>show(i-1);
  function togglePres(on){document.body.classList.toggle('present',on===undefined?!document.body.classList.contains('present'):on);setTimeout(fit,280);}
  function toggleFull(){ if(!document.fullscreenElement){document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().then(()=>togglePres(true)).catch(()=>{});}else{document.exitFullscreen&&document.exitFullscreen();togglePres(false);} }
  document.addEventListener('keydown',e=>{
    if(lb.classList.contains('on')){if(['Escape',' ','Enter'].includes(e.key)){e.preventDefault();lb.classList.remove('on');}return;}
    if(e.target&&e.target.isContentEditable)return;
    switch(e.key){
      case 'ArrowRight':case 'ArrowDown':case 'PageDown':case ' ':e.preventDefault();next();break;
      case 'ArrowLeft':case 'ArrowUp':case 'PageUp':e.preventDefault();prev();break;
      case 'Home':show(0);break;case 'End':show(N-1);break;
      case 'p':case 'P':togglePres();break;case 'f':case 'F':toggleFull();break;
      case '?':help.classList.toggle('on');break;
      case 'Escape':help.classList.remove('on');togglePres(false);break;
    }
  });
  bNext.onclick=next;bPrev.onclick=prev;bPres.onclick=()=>togglePres();bFull.onclick=toggleFull;
  bHelp.onclick=()=>help.classList.add('on');help.onclick=()=>help.classList.remove('on');
  let sx=null;document.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  document.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60){dx<0?next():prev();}sx=null;});
  let hideT;document.addEventListener('mousemove',()=>{if(!document.body.classList.contains('present'))return;document.body.classList.add('showbar');clearTimeout(hideT);hideT=setTimeout(()=>document.body.classList.remove('showbar'),1800);});
  window.addEventListener('resize',fit);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)togglePres(false);setTimeout(fit,150);});
  fit();
  const h=parseInt(location.hash.slice(1),10);show(isNaN(h)?0:h-1);
  window.__deck={show,next,prev,togglePres,N};
})();
