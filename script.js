/* ========================================================================= */
/* 1. CONFIGURACIÓN GLOBAL Y SISTEMA DE SONIDOS MEJORADO                     */
/* ========================================================================= */
const NUMERO_CAJEROS = "5491164763592"; 
let currentGameType = ''; 

const sfxClick = new Audio('click.mp3'); sfxClick.volume = 0.3;
const sfxCarta = new Audio('carta.mp3'); sfxCarta.volume = 0.6;
const sfxRuleta = new Audio('ruleta.mp3'); sfxRuleta.volume = 0.5;
const sfxPalanca = new Audio('palanca.mp3'); sfxPalanca.volume = 0.6;
const sfxPremio = new Audio('premio.mp3'); sfxPremio.volume = 0.6;
const bgMusic = new Audio('fondo-casino.mp3'); bgMusic.volume = 0.15; bgMusic.loop = true;

let bgStarted = false;

function syncMusic() {
    const savedTime = localStorage.getItem('casinoMusicTime');
    const wasPlaying = localStorage.getItem('casinoMusicPlaying');
    
    if (savedTime) {
        bgMusic.currentTime = parseFloat(savedTime);
    }
    
    if (wasPlaying === 'true') {
        bgMusic.play().then(() => {
            bgStarted = true;
        }).catch((e) => {
            console.log("El navegador bloqueó el autoplay.");
        });
    }
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('casinoMusicTime', bgMusic.currentTime);
    localStorage.setItem('casinoMusicPlaying', !bgMusic.paused);
});

function playSound(audioObj) {
    if(audioObj) {
        let clone = audioObj.cloneNode();
        clone.volume = audioObj.volume;
        clone.play().catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', () => {
    syncMusic(); 
});

document.addEventListener('click', () => {
    if(!bgStarted) {
        bgMusic.play().catch(()=>{});
        bgStarted = true;
    }
    playSound(sfxClick);
});

/* ========================================================================= */
/* 2. FONDOS ANIMADOS Y MENÚ                                                 */
/* ========================================================================= */
try {
    (function() {
      const canvas = document.getElementById('royal-casino-visuals');
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      let w, h;
      function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
      window.addEventListener('resize', resize); resize();
      
      const isMobile = window.innerWidth < 768;
      const purples = ['#1a0033', '#2d004d', '#000000', '#0a001a'];
      
      class Orb {
        constructor() {
          this.r = Math.random()*(w*1.2)+w*0.5; 
          this.x = Math.random()*w; this.y = Math.random()*h;
          this.vx = (Math.random()-.5)*1.5; this.vy = (Math.random()-.5)*1.5;
          this.color = purples[Math.floor(Math.random()*purples.length)];
          this.op = Math.random()*0.35 + 0.15; 
        }
        update() {
          this.x+=this.vx; this.y+=this.vy;
          if(this.x<-this.r||this.x>w+this.r) this.vx*=-1;
          if(this.y<-this.r||this.y>h+this.r) this.vy*=-1;
        }
        draw() {
          const g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
          const hex = parseInt(this.color.slice(1),16);
          const r=(hex>>16)&255, gr=(hex>>8)&255, b=hex&255;
          g.addColorStop(0,`rgba(${r},${gr},${b},${this.op})`);
          g.addColorStop(1,`rgba(${r},${gr},${b},0)`);
          ctx.save(); ctx.globalCompositeOperation='screen'; 
          ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill(); ctx.restore();
        }
      }
      const orbs = Array.from({length:isMobile?4:6},()=>new Orb());
      function animate() {
        ctx.clearRect(0,0,w,h); orbs.forEach(o=>{o.update();o.draw();});
        requestAnimationFrame(animate);
      }
      animate();
    })();
} catch (e) { console.error("Error visual:", e); }

(function() {
  const el = document.getElementById('bg-sparkles');
  if(!el) return;
  const count = window.innerWidth < 768 ? 60 : 150;
  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 'f-sparkle';
    s.style.left = Math.random()*100+'vw'; s.style.top = Math.random()*100+'vh';
    const sz = Math.random()*3+3;
    s.style.width = sz+'px'; s.style.height = sz+'px';
    s.style.animationDuration = (Math.random()*2+2)+'s';
    el.appendChild(s);
  }
})();

const btnMenu = document.getElementById('btn-menu');
const btnCerrar = document.getElementById('btn-cerrar');
const menuLateral = document.getElementById('menu-lateral');
if(btnMenu && btnCerrar && menuLateral) {
    btnMenu.addEventListener('click', () => { menuLateral.classList.add('activo'); });
    btnCerrar.addEventListener('click', () => { menuLateral.classList.remove('activo'); });
}

function getRotationDegrees(element) {
    const st = window.getComputedStyle(element, null);
    const tr = st.getPropertyValue("transform") || "none";
    if (tr === "none") return 0;
    const values = tr.split('(')[1].split(')')[0].split(',');
    return Math.round(Math.atan2(values[1], values[0]) * (180/Math.PI));
}

/* ========================================================================= */
/* 3. LÓGICA DE MODALES Y REDIRECCIONES A WHATSAPP                           */
/* ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('.btn-captura').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalBox = this.closest('.modal-box-neon');
            if(!modalBox) return;
            const btnContainer = modalBox.querySelector('.botones-modal-container');
            const btnCerrar = modalBox.querySelector('.btn-cerrar-modal') || modalBox.querySelector('#btn-cerrar-modal-super');
            const instCap = modalBox.querySelector('.instruccion-captura');
            const prevDisp = btnContainer ? btnContainer.style.display : '';
            const prevCerrar = btnCerrar ? btnCerrar.style.display : '';
            const prevInst = instCap ? instCap.style.display : '';
            if(btnContainer) btnContainer.style.display = 'none';
            if(btnCerrar) btnCerrar.style.display = 'none';
            if(instCap) instCap.style.display = 'none';
            
            html2canvas(modalBox, { backgroundColor: '#050011', scale: 2, useCORS: true, logging: false }).then(canvas => {
                if(btnContainer) btnContainer.style.display = prevDisp;
                if(btnCerrar) btnCerrar.style.display = prevCerrar;
                if(instCap) instCap.style.display = prevInst;
                const link = document.createElement('a');
                link.download = 'Premio-Jackpot-Realeza.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                if(btnContainer) btnContainer.style.display = prevDisp;
                if(btnCerrar) btnCerrar.style.display = prevCerrar;
                if(instCap) instCap.style.display = prevInst;
            });
        });
    });

    document.querySelectorAll('[onclick*="window.location.href"]').forEach(el => {
        const code = el.getAttribute('onclick');
        el.removeAttribute('onclick'); 
        el.addEventListener('click', function(e) {
            e.preventDefault();
            setTimeout(() => { eval(code); }, 300); 
        });
    });

    document.querySelectorAll('.menu-lateral a').forEach(el => {
        const href = el.getAttribute('href');
        el.addEventListener('click', function(e) {
            e.preventDefault();
            setTimeout(() => { window.location.href = href; }, 300);
        });
    });

    document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if(modal) modal.classList.add('hidden');
        });
    });

    const btnCerrarSuper = document.getElementById('btn-cerrar-modal-super');
    if (btnCerrarSuper) {
        btnCerrarSuper.addEventListener('click', () => {
            const modal = document.getElementById('modal-ganador-super');
            if (modal) modal.classList.add('hidden');
        });
    }

    // REDIRECCIÓN A WHATSAPP
    document.querySelectorAll('.btn-reclamar-premio').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalBox = this.closest('.modal-box-neon');
            let codigoText = "";
            if(modalBox) {
                const codigoEl = modalBox.querySelector('#texto-codigo-usado') || modalBox.querySelector('#texto-codigo-usado-super');
                if(codigoEl) codigoText = codigoEl.innerText.replace('CÓDIGO: ', '').replace(' USADO', '').trim();
            }
            const mensaje = `¡Gané este extra con las Reinas del Jackpot! 👑🎁🎉 Código: ${codigoText}`;
            window.location.href = `https://wa.me/5491125793546?text=${encodeURIComponent(mensaje)}`; 
        });
    });

    document.querySelectorAll('.dynamic-subtitle-fullwidth').forEach(subtitle => {
        if (!subtitle.querySelector('.sub-contenedor-lineas')) {
            const cSub = document.createElement('div'); cSub.className = 'sub-contenedor-lineas';
            cSub.innerHTML = `<span class="sub-neon sub-neon-arriba"></span><span class="sub-neon sub-neon-derecha"></span><span class="sub-neon sub-neon-abajo"></span><span class="sub-neon sub-neon-izquierda"></span>`;
            subtitle.appendChild(cSub);
        }
    });

    document.querySelectorAll('.contact-card').forEach(card => {
        let colorClass = 'marco-linea-wpp';
        if(card.classList.contains('card-telegram')) colorClass = 'marco-linea-tel';
        if(card.classList.contains('card-instagram')) colorClass = 'marco-linea-ig';
        if(card.classList.contains('card-facebook')) colorClass = 'marco-linea-fb';
        if(card.classList.contains('card-tiktok')) colorClass = 'marco-linea-tk';
        if(card.classList.contains('card-grupos')) colorClass = 'marco-linea-grupos'; 
        const cL = document.createElement('div'); cL.className = 'marco-contenedor-lineas';
        cL.innerHTML = `<span class="${colorClass} linea-arriba"></span><span class="${colorClass} linea-derecha"></span><span class="${colorClass} linea-abajo"></span><span class="${colorClass} linea-izquierda"></span>`;
        card.appendChild(cL);
    });

    const jackpotCards = document.querySelectorAll('.game-card');
    jackpotCards.forEach((card, index) => {
        const colors = ['#B200FF', '#FF0000', '#00E5FF'];
        const cColor = colors[index] || '#FFD700';
        const cL = document.createElement('div'); cL.className = 'marco-contenedor-lineas';
        cL.innerHTML = `<span class="marco-linea-neon-card linea-arriba" style="color:${cColor}; background-color:${cColor};"></span><span class="marco-linea-neon-card linea-derecha" style="color:${cColor}; background-color:${cColor};"></span><span class="marco-linea-neon-card linea-abajo" style="color:${cColor}; background-color:${cColor};"></span><span class="marco-linea-neon-card linea-izquierda" style="color:${cColor}; background-color:${cColor};"></span>`;
        card.appendChild(cL);
    });

    const marcoRuleta = document.querySelector('.marco-ruleta');
    if (marcoRuleta) {
        const c1 = document.createElement('div'); c1.className = 'marco-contenedor-lineas';
        c1.innerHTML = `<span class="marco-linea-dorada linea-arriba"></span><span class="marco-linea-dorada linea-derecha"></span><span class="marco-linea-dorada linea-abajo"></span><span class="marco-linea-dorada linea-izquierda"></span>`;
        marcoRuleta.appendChild(c1);
    }

    const marcoCartas = document.querySelector('.marco-cartas');
    if (marcoCartas) {
        let delay = 0; const offset = '-7.5px'; 
        const addLight = (top, left, right, bottom, d) => {
            let f = document.createElement('div'); f.className = 'foquito-secuencia'; 
            if(top) f.style.top = top; if(left) f.style.left = left; if(right) f.style.right = right; if(bottom) f.style.bottom = bottom;
            f.style.animationDelay = d + 's'; marcoCartas.appendChild(f); delay += 0.1;
        };
        const numLuces = 12; 
        for(let i=0; i<numLuces; i++) { addLight(offset, `calc(${i*(100/numLuces)}%)`, null, null, delay); }
        for(let i=0; i<numLuces; i++) { addLight(`calc(${i*(100/numLuces)}%)`, null, offset, null, delay); }
        for(let i=numLuces; i>0; i--) { addLight(null, `calc(${i*(100/numLuces)}%)`, null, offset, delay); }
        for(let i=numLuces; i>0; i--) { addLight(`calc(${i*(100/numLuces)}%)`, offset, null, null, delay); }
    }

    const marcoSuperSlot = document.querySelector('.marco-super-slot');
    if (marcoSuperSlot) {
        let delayS = 0; const offsetS = '-7.5px'; 
        const addLightSuper = (top, left, right, bottom, d) => {
            let f = document.createElement('div'); f.className = 'foquito-secuencia';
            if(top) f.style.top = top; if(left) f.style.left = left; if(right) f.style.right = right; if(bottom) f.style.bottom = bottom;
            f.style.animationDelay = d + 's'; marcoSuperSlot.appendChild(f); delayS += 0.1;
        };
        const numLucesS = 12;
        for(let i=0; i<numLucesS; i++) { addLightSuper(offsetS, `calc(${i*(100/numLucesS)}%)`, null, null, delayS); }
        for(let i=0; i<numLucesS; i++) { addLightSuper(`calc(${i*(100/numLucesS)}%)`, null, offsetS, null, delayS); }
        for(let i=numLucesS; i>0; i--) { addLightSuper(null, `calc(${i*(100/numLucesS)}%)`, null, offsetS, delayS); }
        for(let i=numLucesS; i>0; i--) { addLightSuper(`calc(${i*(100/numLucesS)}%)`, offsetS, null, null, delayS); }
    }

    if (jackpotCards.length >= 2 && !document.getElementById('ruleta-canvas')) {
        const miniRuleta = document.createElement('div'); miniRuleta.className = 'mini-ruleta-wrapper';
        miniRuleta.innerHTML = `<div class="mini-ring-override" id="mini-ruleta-ring"></div><canvas class="mini-ruleta-canvas"></canvas><div class="mini-ruleta-pointer"></div><div class="mini-ruleta-btn"></div>`;
        jackpotCards[0].appendChild(miniRuleta);
        const mcvs = miniRuleta.querySelector('canvas');
        if(mcvs) {
            mcvs.width = 190; mcvs.height = 190;
            const cctx = mcvs.getContext('2d'); const cx = 95, cy = 95, r = 89; 
            const cols = ["#C0392B","#8E44AD","#2980B9","#27AE60","#E67E22","#16A085","#D35400","#2C3E50","#8E44AD","#C0392B"];
            const stp = (Math.PI*2)/10;
            for(let i=0; i<10; i++){
                const start = i*stp - Math.PI/2; const end = start + stp;
                cctx.beginPath(); cctx.moveTo(cx,cy); cctx.arc(cx,cy,r,start,end); cctx.closePath();
                cctx.fillStyle = cols[i]; cctx.fill(); cctx.strokeStyle = 'rgba(0,0,0,0.4)'; cctx.lineWidth = 1; cctx.stroke();
                cctx.save(); cctx.translate(cx,cy); cctx.rotate(start+stp/2);
                cctx.textAlign = 'right'; cctx.textBaseline = 'middle'; cctx.fillStyle = '#FFFFFF'; cctx.font = "bold 9px 'Montserrat', 'Oswald', sans-serif";
                cctx.strokeText('JACKPOT', r-12, 0); cctx.fillText('JACKPOT', r-12, 0); cctx.restore();
            }
            cctx.beginPath(); cctx.arc(cx,cy,190*0.12,0,Math.PI*2); cctx.fillStyle='#000'; cctx.fill(); cctx.strokeStyle='#300050'; cctx.lineWidth=2; cctx.stroke();
        }
        const mRing = miniRuleta.querySelector('.mini-ring-override');
        if(mRing) {
            let centroF = 95, radioF = 91; 
            for(let i=0; i<24; i++){
                let f = document.createElement('div'); f.className = 'foquito ' + (i%2===0 ? 'foquito-dorado' : 'foquito-morado'); f.style.width = '8px'; f.style.height = '8px';
                const ang = (i/24)*Math.PI*2; f.style.left = (centroF + radioF*Math.cos(ang) - 4) + 'px'; f.style.top  = (centroF + radioF*Math.sin(ang) - 4) + 'px';
                mRing.appendChild(f);
            }
        }
        const miniCartas = document.createElement('div'); miniCartas.className = 'mini-cartas-container';
        miniCartas.innerHTML = `<div class="mini-carta roja m-carta-1"></div><div class="mini-carta roja m-carta-2"></div><div class="mini-carta roja m-carta-3"></div><div class="mini-carta dorada m-carta-gold"></div>`;
        jackpotCards[1].appendChild(miniCartas);
        const miniCardsRed = miniCartas.querySelectorAll('.mini-carta.roja');
        miniCardsRed.forEach(mc => {
            for(let i=0; i<5; i++) {
                let sp = document.createElement('div'); sp.className = 'f-sparkle-mini'; sp.style.left = (Math.random() * 80 + 10) + '%'; sp.style.animationDelay = (Math.random() * 2) + 's'; sp.style.animationDuration = (Math.random() * 1 + 1.5) + 's'; mc.appendChild(sp);
            }
        });
    }

    if (jackpotCards && jackpotCards.length >= 3 && !document.getElementById('codigo-super')) {
        const miniSlot = document.createElement('div'); miniSlot.className = 'mini-slot-scale-wrapper';
        miniSlot.innerHTML = `<div class="mini-s-machine"><div class="mini-s-window"><div class="mini-s-reel" id="mini-reel-1"></div><div class="mini-s-reel" id="mini-reel-2"></div><div class="mini-s-reel" id="mini-reel-3"></div><div class="mini-s-payline" id="mini-payline"></div></div></div><div class="mini-s-lever-container"><div class="mini-s-lever-stick" id="mini-lever"><div class="mini-s-lever-knob"></div></div><div class="mini-s-lever-base"></div></div>`;
        jackpotCards[2].appendChild(miniSlot);
        const miniReels = [document.getElementById('mini-reel-1'), document.getElementById('mini-reel-2'), document.getElementById('mini-reel-3')];
        const miniSymbolsArray = ['🍒', '🔔', '🍋', '🍉', '🍇', '⭐', '💎', '7️⃣']; const miniTotalSymbols = 15; const miniSymbolHeight = 40;
        miniReels.forEach(reel => {
            for(let i=0; i<miniTotalSymbols; i++) {
                let div = document.createElement('div'); div.className = 'mini-s-symbol'; div.textContent = miniSymbolsArray[Math.floor(Math.random()*miniSymbolsArray.length)]; reel.appendChild(div);
            }
        });
        const miniLever = document.getElementById('mini-lever'); const miniPayline = document.getElementById('mini-payline');
        function runMiniSlot() {
            miniReels.forEach(reel => {
                reel.style.transition = 'none'; reel.style.transform = 'translateY(0px)';
                for(let i=0; i<miniTotalSymbols; i++) reel.children[i].textContent = miniSymbolsArray[Math.floor(Math.random()*miniSymbolsArray.length)];
            });
            if(miniPayline) miniPayline.classList.remove('active');
            setTimeout(() => {
                miniLever.classList.add('pulled');
                miniReels.forEach(reel => { reel.children[miniTotalSymbols - 2].textContent = '💎'; });
                miniReels.forEach((reel, index) => {
                    setTimeout(() => { reel.style.transition = `transform ${1.5 + index * 0.3}s cubic-bezier(0.15, 0.85, 0.15, 1)`; reel.style.transform = `translateY(-${(miniTotalSymbols - 3) * miniSymbolHeight}px)`; }, 50); 
                });
                setTimeout(() => miniLever.classList.remove('pulled'), 400);
                setTimeout(() => { if(miniPayline) miniPayline.classList.add('active'); }, 2200);
            }, 500); 
        }
        runMiniSlot(); setInterval(runMiniSlot, 4500); 
    }

    const formCajeros = document.getElementById('formulario-cajeros');
    if(formCajeros) {
        formCajeros.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('c-nombre').value; const dni = document.getElementById('c-dni').value; const redes = document.getElementById('c-redes').value; const exp = document.getElementById('c-exp').value; const motivo = document.getElementById('c-motivo').value;
            let texto = `Hola buenas, quiero pertenecer a Red Jackpot Queen's, estos son mis datos:\n\n👤 Nombre y Apellido: ${nombre}\n🪪 DNI: ${dni}\n🔗 Redes Sociales: ${redes}\n💼 Experiencia: ${exp}\n`;
            if(motivo.trim() !== '') texto += `🔄 Motivo de cambio: ${motivo}\n`;
            texto += `\n*(Nota: Ya preparé las fotos solicitadas para enviártelas por acá)*`;
            window.location.href = `https://wa.me/${NUMERO_CAJEROS}?text=${encodeURIComponent(texto)}`;
        });
    }

    const containerSorteo = document.getElementById('countdown-sorteo');
    if (containerSorteo) {
        const targetDate = new Date(2026, 7, 15, 21, 0, 0).getTime();
        const timerInterval = setInterval(function() {
            const now = new Date().getTime(); const distance = targetDate - now;
            if (distance < 0 || isNaN(distance)) {
                clearInterval(timerInterval); containerSorteo.innerHTML = "<h3 style='color:#00E5FF; text-shadow:0 0 10px #00E5FF; font-family:Montserrat, sans-serif; font-size:24px; text-align:center;'>¡EL SORTEO HA COMENZADO!</h3>"; return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24)); const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if(document.getElementById('cd-days')) document.getElementById('cd-days').innerText = days < 10 ? '0' + days : days;
            if(document.getElementById('cd-hours')) document.getElementById('cd-hours').innerText = hours < 10 ? '0' + hours : hours;
            if(document.getElementById('cd-mins')) document.getElementById('cd-mins').innerText = minutes < 10 ? '0' + minutes : minutes;
            if(document.getElementById('cd-secs')) document.getElementById('cd-secs').innerText = seconds < 10 ? '0' + seconds : seconds;
        }, 1000);
    }

    const telonOverlay = document.getElementById('btn-abrir-telon');
    const escenario = document.getElementById('escenario-ganadores');
    if (telonOverlay && escenario) telonOverlay.addEventListener('click', () => { escenario.classList.toggle('abierto'); });
});

/* ========================================================================= */
/* 4. CARTAS JACKPOT (30 CÓDIGOS NUEVOS DE 5 DÍGITOS)                        */
/* ========================================================================= */
if (document.getElementById('tablero-cartas')) {
    const CODIGOS_CARTAS = [
        "10293", "29485", "38574", "47692", "58710", "69821", "71932", "82043", "93154", "14265",
        "25376", "36487", "47598", "58609", "69710", "70821", "81932", "92043", "13154", "24265",
        "35376", "46487", "57598", "68609", "79710", "80821", "91932", "12043", "23154", "34265"
    ];
    const LISTA_MINI = ["$300", "$500", "$750"]; const LISTA_MINOR = ["$400", "$650", "$700"]; const LISTA_MAJOR = ["$800", "5% EXTRA", "10% EXTRA"]; const LISTA_GRAND = ["25% EXTRA", "20% EXTRA"];

    function getPrizePool() {
        let pool;
        try { pool = JSON.parse(localStorage.getItem('cartasPrizePool')); if (!Array.isArray(pool) || pool.length === 0) throw new Error(); } 
        catch(e) {
            pool = [];
            for(let i=0; i<25; i++) pool.push('MINI'); for(let i=0; i<15; i++) pool.push('MINOR'); for(let i=0; i<8; i++) pool.push('MAJOR'); for(let i=0; i<2; i++) pool.push('GRAND');
            for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
            localStorage.setItem('cartasPrizePool', JSON.stringify(pool));
        } return pool;
    }
    function popPrize() { let pool = getPrizePool(); let prize = pool.pop(); localStorage.setItem('cartasPrizePool', JSON.stringify(pool)); return prize; }
    const obtenerPremioTier = (tier) => {
        let list, key;
        switch(tier) { case 'MINI': list = LISTA_MINI; key = 'cMiniIdx'; break; case 'MINOR': list = LISTA_MINOR; key = 'cMinorIdx'; break; case 'MAJOR': list = LISTA_MAJOR; key = 'cMajorIdx'; break; case 'GRAND': list = LISTA_GRAND; key = 'cGrandIdx'; break; default: list = LISTA_MINI; key = 'cMiniIdx'; }
        let idx = parseInt(localStorage.getItem(key) || '0'); let prize = list[idx]; localStorage.setItem(key, (idx + 1) % list.length); return prize;
    }

    const inputC = document.getElementById('codigo-cartas'); const msgC = document.getElementById('mensaje-codigo'); const tablero = document.getElementById('tablero-cartas'); const modalC = document.getElementById('modal-ganador'); const textoPremioC = document.getElementById('texto-premio'); const textoCodigoUsadoC = document.getElementById('texto-codigo-usado'); 
    let jackpotAsignado = ''; let cartasVolteadas = 0; let coincidenciaCount = 0; let juegoTerminado = false; let juegoActivo = false; 

    function getUsadosC() { try { return JSON.parse(localStorage.getItem('codigosCartas') || '[]'); } catch(e) { return []; } }
    function setUsadosC(c) { const u = getUsadosC(); u.push(c); localStorage.setItem('codigosCartas', JSON.stringify(u)); }

    if(tablero) generarTablero();

    if(inputC) {
        inputC.addEventListener('input', function() {
            const c = this.value.trim().toUpperCase(); if(!c){ msgC.textContent=''; return; }
            if(CODIGOS_CARTAS.includes(c) && !getUsadosC().includes(c)){
                msgC.innerHTML='¡CÓDIGO VÁLIDO!<br>BÚSQUEDA ACTIVADA'; msgC.style.color='#39FF14'; jackpotAsignado = popPrize(); setUsadosC(c);
                if(textoCodigoUsadoC) textoCodigoUsadoC.textContent = `CÓDIGO: ${c} USADO`; inputC.disabled = true; juegoActivo = true; document.querySelectorAll('.carta-premio').forEach(carta => carta.classList.remove('latido-mistico'));
            } else { msgC.textContent='CÓDIGO INVÁLIDO O YA USADO'; msgC.style.color='#FF0000'; }
        });
    }

    function generarTablero() {
        tablero.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const carta = document.createElement('div'); carta.className = 'carta-premio latido-mistico'; carta.innerHTML = `<div class="carta-cara carta-front"></div><div class="carta-cara carta-back"></div>`;
            carta.addEventListener('click', voltearCarta); tablero.appendChild(carta);
        }
    }
    function crearDestello(contenedor) {
        for(let i=0; i<10; i++){ let p = document.createElement('div'); p.className = 'sparkle-burst'; p.style.left = '50%'; p.style.top = '50%'; let ang = (Math.PI*2/10)*i; let dist = 30 + Math.random()*30; p.style.setProperty('--tx', Math.cos(ang)*dist+'px'); p.style.setProperty('--ty', Math.sin(ang)*dist+'px'); p.style.animation = 'burst 0.5s ease-out forwards'; contenedor.appendChild(p); setTimeout(() => p.remove(), 500); }
    }
    function voltearCarta(e) {
        if(!juegoActivo || juegoTerminado) return; const carta = e.currentTarget; if(carta.classList.contains('volteada')) return;
        cartasVolteadas++; crearDestello(carta); playSound(sfxCarta); 
        const reverso = carta.querySelector('.carta-back'); let simboloRevelado = ''; const tipos = ['MINI', 'MINOR', 'MAJOR', 'GRAND'];
        if(cartasVolteadas === 1 || cartasVolteadas === 2) { simboloRevelado = tipos.filter(t => t !== jackpotAsignado)[Math.floor(Math.random()*3)]; } else if(cartasVolteadas >= 3 && cartasVolteadas <= 5) { simboloRevelado = jackpotAsignado; coincidenciaCount++; }
        let textoAjustado = simboloRevelado.replace(' EXTRA', ' EXTRA').replace('%', '%'); reverso.innerHTML = `<span class="simbolo-premio simbolo-${simboloRevelado.toLowerCase()}">${textoAjustado}</span>`; carta.classList.add('volteada');
        if(coincidenciaCount === 3) {
            juegoTerminado = true; tablero.style.opacity = '0.9';
            setTimeout(() => {
                let specificPrizeText = obtenerPremioTier(jackpotAsignado); let premioStr = specificPrizeText;
                if (!premioStr.includes('EXTRA') && !premioStr.includes('%')) premioStr += " EXTRA";
                if(textoPremioC) textoPremioC.textContent = premioStr; currentGameType = 'CARTAS'; 
                if(modalC) { playSound(sfxPremio); modalC.classList.remove('hidden'); }
            }, 400); 
        }
    }
}

/* ========================================================================= */
/* 5. RULETA JACKPOT (30 CÓDIGOS NUEVOS DE 5 DÍGITOS)                        */
/* ========================================================================= */
if (document.getElementById('ruleta-canvas')) {
    const CODIGOS_RULETA = [
        "50192", "61203", "72314", "83425", "94536", "15647", "26758", "37869", "48970", "59081",
        "60192", "71203", "82314", "93425", "14536", "25647", "36758", "47869", "58970", "69081",
        "70192", "81203", "92314", "13425", "24536", "35647", "46758", "57869", "68970", "79081"
    ];
    const PREMIOS_RULETA = ["$400 EXTRA","$350 EXTRA","$300 EXTRA","$500 EXTRA","5% EXTRA","10% EXTRA","15% EXTRA","20% EXTRA","25% EXTRA","$1.000 EXTRA"];
    const COLORES_RULETA = ["#C0392B","#8E44AD","#2980B9","#27AE60","#E67E22","#16A085","#D35400","#2C3E50","#8E44AD","#C0392B"];
    const canvasR = document.getElementById('ruleta-canvas'); const ctxR = canvasR.getContext('2d'); const sizeR = 340; canvasR.width = sizeR; canvasR.height = sizeR; const cx = sizeR/2, cy = sizeR/2, rR = sizeR/2 - 2; const totalR = 10; const stepR = (Math.PI*2)/totalR;

    for(let i=0;i<totalR;i++){
        const start = i*stepR - Math.PI/2; const end = start + stepR;
        ctxR.beginPath(); ctxR.moveTo(cx,cy); ctxR.arc(cx,cy,rR,start,end); ctxR.closePath(); ctxR.fillStyle = COLORES_RULETA[i]; ctxR.fill(); ctxR.strokeStyle = 'rgba(0,0,0,0.4)'; ctxR.lineWidth = 1.5; ctxR.stroke();
        ctxR.save(); ctxR.translate(cx,cy); ctxR.rotate(start+stepR/2); ctxR.textAlign = 'right'; ctxR.textBaseline = 'middle'; ctxR.fillStyle = '#FFFFFF'; ctxR.font = "bold 15px 'Montserrat', 'Oswald', sans-serif"; ctxR.strokeStyle = 'rgba(0,0,0,0.4)'; ctxR.lineWidth = 1.5; ctxR.strokeText('JACKPOT', rR-15, 0); ctxR.fillText('JACKPOT', rR-15, 0); ctxR.restore();
    }
    ctxR.beginPath(); ctxR.arc(cx,cy,sizeR*0.12,0,Math.PI*2); ctxR.fillStyle='#000'; ctxR.fill(); ctxR.strokeStyle='#300050'; ctxR.lineWidth=3; ctxR.stroke();

    const ring = document.getElementById('ruleta-outer-ring');
    if(ring) {
        const isMobile = window.innerWidth < 768; const isTiny = window.innerWidth < 400; let centroF, radioF;
        if (isTiny) { centroF = 145; radioF = 138; } else if (isMobile) { centroF = 160; radioF = 152; } else { centroF = 185; radioF = 175; }
        const totalFocos = isMobile ? 28 : 36;
        for(let i=0; i<totalFocos; i++){
            const f = document.createElement('div'); f.className = 'foquito ' + (i%2===0 ? 'foquito-dorado' : 'foquito-morado'); const ang = (i/totalFocos)*Math.PI*2; f.style.left = (centroF + radioF*Math.cos(ang)) + 'px'; f.style.top  = (centroF + radioF*Math.sin(ang)) + 'px'; ring.appendChild(f);
        }
    }

    const inputR = document.getElementById('codigo-ruleta'); const msgR   = document.getElementById('mensaje-codigo'); const btnSpin = document.getElementById('btn-spin-ruleta'); const idleWrapper = document.getElementById('ruleta-idle'); const modalR = document.getElementById('modal-ganador'); const textoPremioR = document.getElementById('texto-premio'); const textoCodigoUsadoR = document.getElementById('texto-codigo-usado');
    let premioRuleta = ''; let girando = false;
    function getUsadosR() { try { return JSON.parse(localStorage.getItem('codigosRuleta') || '[]'); } catch(e) { return []; } }
    function setUsadosR(c) { const u = getUsadosR(); u.push(c); localStorage.setItem('codigosRuleta', JSON.stringify(u)); }

    if(inputR) {
        inputR.addEventListener('input', function() {
            const c = this.value.trim().toUpperCase(); if(!c){ msgR.textContent=''; btnSpin.disabled=true; return; }
            if(CODIGOS_RULETA.includes(c) && !getUsadosR().includes(c)){ msgR.innerHTML='¡CÓDIGO VÁLIDO!<br>TOCA GIRAR'; msgR.style.color='#39FF14'; btnSpin.disabled=false; } else { msgR.textContent='CÓDIGO INVÁLIDO O YA USADO'; msgR.style.color='#FF0000'; btnSpin.disabled=true; }
        });
    }

    if(btnSpin) {
        btnSpin.addEventListener('click', function() {
            if(girando) return; girando = true; playSound(sfxRuleta);
            const c = inputR.value.trim().toUpperCase(); setUsadosR(c); if(textoCodigoUsadoR) textoCodigoUsadoR.textContent = `CÓDIGO: ${c} USADO`;
            let idx = parseInt(localStorage.getItem('idxRuleta') || '0'); premioRuleta = PREMIOS_RULETA[idx]; localStorage.setItem('idxRuleta', (idx+1 >= PREMIOS_RULETA.length) ? 0 : idx+1);
            btnSpin.disabled=true; inputR.disabled=true; msgR.innerHTML='¡GIRANDO...<br>MUCHA SUERTE!'; msgR.style.color='#FFD700';
            const anguloActual = getRotationDegrees(idleWrapper); idleWrapper.style.animation = 'none'; idleWrapper.style.transform = `rotate(${anguloActual}deg)`;
            const gradosFinales = anguloActual + 3600 + (Math.floor(Math.random()*10)*36) + 18; canvasR.style.transition='transform 5.5s cubic-bezier(0.15,0.85,0.15,1)'; canvasR.style.transform=`rotate(${gradosFinales}deg)`;
            setTimeout(function(){ girando=false; if(sfxRuleta) sfxRuleta.pause(); playSound(sfxPremio); if(textoPremioR) textoPremioR.textContent=premioRuleta; currentGameType = 'RULETA'; if(modalR) modalR.classList.remove('hidden'); }, 5500);
        });
    }
}

/* ========================================================================= */
/* 6. SÚPER JACKPOT (SLOTS - 30 CÓDIGOS NUEVOS DE 5 DÍGITOS)                 */
/* ========================================================================= */
if (document.getElementById('codigo-super')) {
    const CODIGOS_SUPER = [
        "90182", "81293", "72304", "63415", "54526", "45637", "36748", "27859", "18960", "29071",
        "30182", "41293", "52304", "63415", "74526", "85637", "96748", "17859", "28960", "39071",
        "40182", "51293", "62304", "73415", "84526", "95637", "16748", "27859", "38960", "49071"
    ];
    const PREMIOS_SUPER = ["$700", "$800", "10%", "5%", "15%", "$400", "$500", "$600", "20%"];

    function getSuperPrizePool() {
        let pool;
        try { pool = JSON.parse(localStorage.getItem('superPrizePool')); if (!Array.isArray(pool) || pool.length === 0) throw new Error(); } catch(e) {
            pool = [...PREMIOS_SUPER]; for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; } localStorage.setItem('superPrizePool', JSON.stringify(pool));
        } return pool;
    }
    function popSuperPrize() { let pool = getSuperPrizePool(); let prize = pool.pop(); localStorage.setItem('superPrizePool', JSON.stringify(pool)); return prize; }

    const inputS = document.getElementById('codigo-super'); const msgS = document.getElementById('mensaje-codigo-super'); const lever = document.getElementById('slot-lever'); const reels = [document.getElementById('reel-1'), document.getElementById('reel-2'), document.getElementById('reel-3')]; const modalS = document.getElementById('modal-ganador-super'); const payline = document.getElementById('slot-payline'); 
    let superActivo = false; let superTerminado = false; let premioAsignado = ''; let codigoActual = '';
    const symbolHeight = 60; const totalSymbols = 40; const symbolsArray = ['🍒', '🔔', '🍋', '🍉', '🍇', '⭐', '💎', '7️⃣'];

    if (reels[0] && reels[1] && reels[2]) {
        reels.forEach(reel => {
            reel.innerHTML = ''; for(let i=0; i<totalSymbols; i++) { let div = document.createElement('div'); div.className = 'slot-symbol'; div.textContent = symbolsArray[Math.floor(Math.random()*symbolsArray.length)]; reel.appendChild(div); } reel.style.transition = 'none'; reel.style.transform = 'translateY(0px)'; void reel.offsetWidth;
        });
    }

    function getUsadosS() { try { return JSON.parse(localStorage.getItem('codigosSuper') || '[]'); } catch(e) { return []; } }
    function setUsadosS(c) { const u = getUsadosS(); u.push(c); localStorage.setItem('codigosSuper', JSON.stringify(u)); }

    if(inputS) {
        inputS.addEventListener('input', function() {
            const c = this.value.trim().toUpperCase(); if(!c){ msgS.textContent=''; return; }
            if(CODIGOS_SUPER.includes(c) && !getUsadosS().includes(c)){ msgS.innerHTML='¡CÓDIGO VÁLIDO!<br>TIRA DE LA PALANCA'; msgS.style.color='#00E5FF'; premioAsignado = popSuperPrize(); codigoActual = c; inputS.disabled = true; superActivo = true; } else { msgS.textContent='CÓDIGO INVÁLIDO O YA USADO'; msgS.style.color='#FF0000'; }
        });
    }

    if(lever) {
        lever.addEventListener('click', function() {
            if(!superActivo || superTerminado) return; superTerminado = true; playSound(sfxPalanca); setUsadosS(codigoActual);
            const textoCodigoS = document.getElementById('texto-codigo-usado-super'); if(textoCodigoS) textoCodigoS.textContent = `CÓDIGO: ${codigoActual} USADO`;
            this.classList.add('pulled'); setTimeout(() => this.classList.remove('pulled'), 500);
            reels.forEach(reel => { if(reel.children[38]) reel.children[38].textContent = '💎'; });
            if(payline) payline.classList.remove('active');
            reels.forEach((reel, index) => { reel.style.transition = `transform ${3 + index * 0.5}s cubic-bezier(0.15, 0.85, 0.15, 1)`; setTimeout(() => { reel.style.transform = `translateY(-${37 * symbolHeight}px)`; }, 50); });
            setTimeout(() => { if(payline) payline.classList.add('active'); }, 4000);
            setTimeout(() => { playSound(sfxPremio); const textoPremioS = document.getElementById('texto-premio-super'); if(textoPremioS) textoPremioS.textContent = premioAsignado + (premioAsignado.includes('%') ? "" : " EXTRA"); currentGameType = 'SUPER'; if(modalS) modalS.classList.remove('hidden'); }, 4800); 
        });
    }
}

/* ========================================================================= */
/* 7. LÓGICA DE REGISTRO ADMIN SORTEOS (NUBE CON EDICIÓN Y BORRADO)          */
/* ========================================================================= */
const formRegistro = document.getElementById('form-registro-sorteo');
const cuerpoTabla = document.getElementById('cuerpo-tabla-registros');
const btnDescargarExcel = document.getElementById('btn-descargar-excel');
const btnLock = document.getElementById('btn-lock-planilla');
const panelPlanilla = document.getElementById('panel-planilla');

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxzp4u-QWeEjrRYaRLO63a6-I5V_3Ds95QVnThC6EqE1z-gnMjtU8fEzDaZ28HiJhnzFA/exec";

window.registrosSorteoGlobal = [];

function cargarPlanillaDesdeGoogle() {
    cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando planilla de la nube... <i class="fa-solid fa-spinner fa-spin"></i></td></tr>';
    
    // El GET para cargar la tabla NO necesita no-cors porque Google Apps Script permite leer GET públicos
    fetch(GOOGLE_SHEETS_URL)
    .then(res => res.json())
    .then(data => {
        window.registrosSorteoGlobal = data; 
        cuerpoTabla.innerHTML = '';
        if(data.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#FFD700;">La planilla está vacía todavía.</td></tr>';
            return;
        }
        
        data.forEach((registro, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${registro.admin}</td>
                <td>${registro.usuario}</td>
                <td><strong style="color:#FFD700;">${registro.numero}</strong></td>
                <td>
                    <button class="btn-accion-tabla btn-editar" onclick="editarRegistro(${index})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-accion-tabla btn-borrar" onclick="borrarRegistro(${index})" title="Borrar"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            cuerpoTabla.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Error al cargar datos:", err);
        cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">No se pudo conectar a la nube. Actualizá la página.</td></tr>';
    });
}

if(btnLock && panelPlanilla) {
    btnLock.addEventListener('click', () => {
        const password = prompt("Ingrese contraseña para desbloquear la planilla:");
        if(password === "123456") {
            panelPlanilla.style.display = "block";
            btnLock.style.color = "#39FF14"; 
            btnLock.classList.replace('fa-lock', 'fa-lock-open');
            cargarPlanillaDesdeGoogle();
        } else if (password !== null) {
            alert("Contraseña incorrecta. Acceso denegado.");
        }
    });
}

if(formRegistro && cuerpoTabla) {
    const ADMINS_AUTORIZADOS = ["mariacajera9903", "alecajerah002", "fabicajera9930", "marcecajera58gan", "paulacajera038", "antonellacajera0037", "brisacajera1745", "aguscajera0037", "yamicajera71gan", "luisacajera0376", "adminjackpotsqueen"];
    
    function mostrarNotificacionExito() {
        let notif = document.getElementById('notif-exito');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'notif-exito';
            notif.className = 'notificacion-exito';
            notif.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>¡OPERACIÓN EXITOSA!</span>';
            document.body.appendChild(notif);
        }
        void notif.offsetWidth;
        notif.classList.add('mostrar');
        setTimeout(() => { notif.classList.remove('mostrar'); }, 3000);
    }

    formRegistro.addEventListener('submit', function(e) {
        e.preventDefault();
        const btnSubmit = formRegistro.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        
        const adminInput = document.getElementById('admin-nombre').value.trim().toLowerCase();
        const userInput = document.getElementById('user-nombre').value.trim();
        const numInput = document.getElementById('numero-sorteo').value.trim();
        const fechaActual = new Date().toLocaleDateString();
        
        if(!ADMINS_AUTORIZADOS.includes(adminInput)) {
            alert("Error: Usuario no autorizado. Solo los cajeros de la lista oficial pueden registrar números.");
            return;
        }
        
        btnSubmit.innerHTML = 'ENVIANDO A LA NUBE... <i class="fa-solid fa-spinner fa-spin"></i>';
        btnSubmit.disabled = true;

        const formData = new FormData();
        formData.append("action", "insert"); 
        formData.append("admin", adminInput);
        formData.append("usuario", userInput);
        formData.append("numero", numInput);
        formData.append("fecha", fechaActual);

        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
            document.getElementById('user-nombre').value = '';
            document.getElementById('numero-sorteo').value = '';
            
            mostrarNotificacionExito();
            cargarPlanillaDesdeGoogle(); 
        })
        .catch(error => {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
            alert("Hubo un error de conexión al guardar el registro. Volvé a intentarlo.");
        });
    });

    window.borrarRegistro = function(index) {
        if(confirm("¿Estás seguro de que querés borrar este registro DEFINITIVAMENTE de la nube?")) {
            const reg = window.registrosSorteoGlobal[index];
            const btn = document.querySelectorAll('.btn-borrar')[index];
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            const formData = new FormData();
            formData.append("action", "delete");
            formData.append("numero", reg.numero);
            formData.append("usuario", reg.usuario);

            fetch(GOOGLE_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: formData })
            .then(() => {
                mostrarNotificacionExito();
                cargarPlanillaDesdeGoogle();
            })
            .catch(() => {
                btn.innerHTML = originalHtml;
                alert("Error al borrar en la nube.");
            });
        }
    };

    window.editarRegistro = function(index) {
        const reg = window.registrosSorteoGlobal[index];
        const nuevoAdmin = prompt("Editar Admin/Cajero:", reg.admin);
        const nuevoUsuario = prompt("Editar Usuario:", reg.usuario);
        const nuevoNum = prompt("Editar Número:", reg.numero);
        
        if(nuevoAdmin && nuevoUsuario && nuevoNum) {
            if(!ADMINS_AUTORIZADOS.includes(nuevoAdmin.toLowerCase())) {
                alert("Error: Ese Cajero no está en la lista de autorizados.");
                return;
            }

            const btn = document.querySelectorAll('.btn-editar')[index];
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            const formData = new FormData();
            formData.append("action", "edit");
            formData.append("numeroViejo", reg.numero);
            formData.append("usuarioViejo", reg.usuario);
            formData.append("admin", nuevoAdmin.toLowerCase());
            formData.append("usuario", nuevoUsuario);
            formData.append("numero", nuevoNum);
            formData.append("fecha", reg.fecha);

            fetch(GOOGLE_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: formData })
            .then(() => {
                mostrarNotificacionExito();
                cargarPlanillaDesdeGoogle();
            })
            .catch(() => {
                btn.innerHTML = originalHtml;
                alert("Error al editar en la nube.");
            });
        }
    };

    if (btnDescargarExcel) {
        btnDescargarExcel.addEventListener('click', function() {
            window.open("https://docs.google.com/spreadsheets/d/1Tus_datos_aqui", "_blank"); 
            alert("Todos los datos están guardados de forma centralizada en tu Excel oficial de Google Drive. Abrí tu Drive para ver o descargar la planilla.");
        });
    }
}