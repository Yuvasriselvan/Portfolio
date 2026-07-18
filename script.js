/* =================================================================
   YUVASRI.S — PORTFOLIO SCRIPT
   - ambient starfield/grid background
   - hero radar sweep (signature element)
   - project "scan grid" canvas (echoes satellite-imagery project)
   - typed role text
   - nav scroll state + mobile toggle + active link
   - scroll reveal + skill bar fill
   ================================================================= */

(function(){

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 1. Ambient background grid ---------------- */
  const bgCanvas = document.getElementById('bgGrid');
  const bgCtx = bgCanvas.getContext('2d');
  let bgDots = [];

  function sizeCanvas(canvas){
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function initBg(){
    sizeCanvas(bgCanvas);
    const dpr = window.devicePixelRatio;
    const cols = Math.ceil(window.innerWidth / 64) + 1;
    const rows = Math.ceil(window.innerHeight / 64) + 1;
    bgDots = [];
    for(let y=0; y<rows; y++){
      for(let x=0; x<cols; x++){
        bgDots.push({
          x: x*64*dpr,
          y: y*64*dpr,
          phase: Math.random()*Math.PI*2,
          speed: 0.4 + Math.random()*0.6
        });
      }
    }
  }

  function drawBg(t){
    bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
    bgCtx.fillStyle = 'rgba(94,234,212,0.55)';
    bgDots.forEach(d=>{
      const a = 0.08 + 0.10 * (0.5 + 0.5*Math.sin(t*0.0006*d.speed + d.phase));
      bgCtx.globalAlpha = a;
      bgCtx.beginPath();
      bgCtx.arc(d.x, d.y, 1.4*window.devicePixelRatio, 0, Math.PI*2);
      bgCtx.fill();
    });
    bgCtx.globalAlpha = 1;
    if(!reduceMotion) requestAnimationFrame(drawBg);
  }

  initBg();
  drawBg(0);

  /* ---------------- 2. Hero radar sweep ---------------- */
  const radarCanvas = document.getElementById('radarCanvas');
  const radarCtx = radarCanvas.getContext('2d');

  function sizeRadar(){
    const hero = document.querySelector('.hero');
    radarCanvas.width = hero.offsetWidth * window.devicePixelRatio;
    radarCanvas.height = hero.offsetHeight * window.devicePixelRatio;
    radarCanvas.style.width = hero.offsetWidth + 'px';
    radarCanvas.style.height = hero.offsetHeight + 'px';
  }

  function drawRadar(angle){
    const w = radarCanvas.width, h = radarCanvas.height;
    const cx = w/2, cy = h*0.42;
    const maxR = Math.max(w,h)*0.55;

    radarCtx.clearRect(0,0,w,h);

    /* concentric rings */
    radarCtx.strokeStyle = 'rgba(94,234,212,0.12)';
    radarCtx.lineWidth = 1*window.devicePixelRatio;
    for(let i=1;i<=4;i++){
      radarCtx.beginPath();
      radarCtx.arc(cx, cy, (maxR/4)*i, 0, Math.PI*2);
      radarCtx.stroke();
    }

    /* cross hairs */
    radarCtx.beginPath();
    radarCtx.moveTo(cx-maxR, cy); radarCtx.lineTo(cx+maxR, cy);
    radarCtx.moveTo(cx, cy-maxR); radarCtx.lineTo(cx, cy+maxR);
    radarCtx.stroke();

    /* sweep gradient */
    const grad = radarCtx.createConicGradient
      ? radarCtx.createConicGradient(angle, cx, cy)
      : null;

    if(grad){
      grad.addColorStop(0, 'rgba(94,234,212,0.0)');
      grad.addColorStop(0.04, 'rgba(94,234,212,0.35)');
      grad.addColorStop(0.12, 'rgba(94,234,212,0.0)');
      grad.addColorStop(1, 'rgba(94,234,212,0.0)');
      radarCtx.save();
      radarCtx.beginPath();
      radarCtx.arc(cx, cy, maxR, 0, Math.PI*2);
      radarCtx.fillStyle = grad;
      radarCtx.fill();
      radarCtx.restore();
    }

    /* sweep line */
    radarCtx.strokeStyle = 'rgba(94,234,212,0.55)';
    radarCtx.lineWidth = 1.5*window.devicePixelRatio;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + Math.cos(angle)*maxR, cy + Math.sin(angle)*maxR);
    radarCtx.stroke();
  }

  let radarAngle = 0;
  function radarLoop(){
    radarAngle += 0.008;
    drawRadar(radarAngle);
    if(!reduceMotion) requestAnimationFrame(radarLoop);
  }

  sizeRadar();
  if(reduceMotion){ drawRadar(0); } else { radarLoop(); }

  /* ---------------- 3. Project scan-grid canvas ---------------- */
  const scanCanvas = document.getElementById('scanCanvas');
  const scanCtx = scanCanvas.getContext('2d');
  let scanCells = [];
  const GRID_COLS = 12, GRID_ROWS = 9;

  function sizeScan(){
    const box = scanCanvas.parentElement;
    scanCanvas.width = box.offsetWidth * window.devicePixelRatio;
    scanCanvas.height = box.offsetHeight * window.devicePixelRatio;
    scanCanvas.style.width = box.offsetWidth + 'px';
    scanCanvas.style.height = box.offsetHeight + 'px';
  }

  function initScanCells(){
    scanCells = [];
    for(let r=0;r<GRID_ROWS;r++){
      for(let c=0;c<GRID_COLS;c++){
        const forest = Math.random() < 0.55;
        scanCells.push({
          r, c,
          forest,
          alert: forest && Math.random() < 0.08
        });
      }
    }
  }

  function drawScan(sweepY){
    const w = scanCanvas.width, h = scanCanvas.height;
    const cw = w/GRID_COLS, ch = h/GRID_ROWS;
    scanCtx.clearRect(0,0,w,h);

    scanCells.forEach(cell=>{
      const x = cell.c*cw, y = cell.r*ch;
      const scanned = y < sweepY;
      let fill = 'rgba(232,241,245,0.03)';
      if(cell.forest) fill = scanned ? 'rgba(94,234,212,0.16)' : 'rgba(94,234,212,0.06)';
      if(cell.alert && scanned) fill = 'rgba(255,180,84,0.35)';
      scanCtx.fillStyle = fill;
      scanCtx.fillRect(x+1, y+1, cw-2, ch-2);
    });

    /* grid lines */
    scanCtx.strokeStyle = 'rgba(94,234,212,0.08)';
    scanCtx.lineWidth = 1;
    for(let c=0;c<=GRID_COLS;c++){
      scanCtx.beginPath(); scanCtx.moveTo(c*cw,0); scanCtx.lineTo(c*cw,h); scanCtx.stroke();
    }
    for(let r=0;r<=GRID_ROWS;r++){
      scanCtx.beginPath(); scanCtx.moveTo(0,r*ch); scanCtx.lineTo(w,r*ch); scanCtx.stroke();
    }

    /* sweep beam */
    const beamGrad = scanCtx.createLinearGradient(0, sweepY-30, 0, sweepY+4);
    beamGrad.addColorStop(0, 'rgba(94,234,212,0)');
    beamGrad.addColorStop(1, 'rgba(94,234,212,0.55)');
    scanCtx.fillStyle = beamGrad;
    scanCtx.fillRect(0, sweepY-30, w, 34);
    scanCtx.fillStyle = 'rgba(94,234,212,0.9)';
    scanCtx.fillRect(0, sweepY, w, 2);
  }

  let sweepPos = 0;
  function scanLoop(){
    const h = scanCanvas.height;
    sweepPos += h*0.0035;
    if(sweepPos > h + 30){
      sweepPos = -30;
      initScanCells();
    }
    drawScan(sweepPos);
    if(!reduceMotion) requestAnimationFrame(scanLoop);
  }

  if(scanCanvas){
    sizeScan();
    initScanCells();
    if(reduceMotion){ drawScan(scanCanvas.height); } else { scanLoop(); }
  }

  /* ---------------- 4. Typed role text ---------------- */
  const roles = [
    'Software Developer',
    'Web Application Builder',
    'Logical Problem Solver'
  ];
  const typedEl = document.getElementById('typedRole');
  let roleIdx = 0, charIdx = 0, deleting = false;

  function typeLoop(){
    if(!typedEl) return;
    const current = roles[roleIdx];
    if(!deleting){
      charIdx++;
      typedEl.textContent = current.slice(0, charIdx);
      if(charIdx === current.length){
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    } else {
      charIdx--;
      typedEl.textContent = current.slice(0, charIdx);
      if(charIdx === 0){
        deleting = false;
        roleIdx = (roleIdx+1) % roles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 65);
  }

  if(typedEl){
    if(reduceMotion){
      typedEl.textContent = roles[0];
    } else {
      typeLoop();
    }
  }

  /* ---------------- 5. Nav: scroll state, toggle, active link ---------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navAnchors = document.querySelectorAll('[data-nav]');

  window.addEventListener('scroll', ()=>{
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navAnchors.forEach(a=> a.addEventListener('click', ()=>{
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
    }));
  }

  const sections = document.querySelectorAll('main section[id]');
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navAnchors.forEach(a=>{
          a.classList.toggle('active', a.getAttribute('href') === '#'+entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s=> navObserver.observe(s));

  /* ---------------- 6. Reveal on scroll + skill bar fill ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el=> revealObserver.observe(el));

  const skillFills = document.querySelectorAll('.skill-fill');
  const skillObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.style.width = entry.target.dataset.fill + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillFills.forEach(el=> skillObserver.observe(el));

  /* ---------------- 7. Resize handling ---------------- */
  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      initBg();
      sizeRadar();
      if(scanCanvas) sizeScan();
    }, 150);
  });

})();
