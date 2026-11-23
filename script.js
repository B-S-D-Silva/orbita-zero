(() => {
  const $=s=>document.querySelector(s),{Game,W,H,sectorNames}=SpaceGame,game=new Game();
  const canvas=$('#canvas'),ctx=canvas.getContext('2d'),keys=new Set();
  let aim={x:W/2,y:0},shoot=false,auto=false,touch=false,target=null,activePointer=null,sound=false,audio=null,best=0,last=0,uiTimer=0,shake=0,announcement=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars=Array.from({length:220},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.25,a:Math.random()*.6+.15}));
  const logs=[];
  try{best=Number(localStorage.getItem('orbita-zero-best'))||0;}catch{}
  const clock=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  const padded=n=>String(Math.floor(n)).padStart(5,'0');
  function log(text){logs.unshift({time:clock(game.time),text});logs.length=Math.min(3,logs.length);$('#log').replaceChildren(...logs.map(item=>{const li=document.createElement('li'),span=document.createElement('span');span.textContent=item.time;li.append(span,item.text);return li;}));}
  function tone(frequency,duration=.06,type='sine',volume=.025){if(!sound||!audio)return;try{const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
  function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
  new ResizeObserver(resize).observe(canvas);resize();
  function overlays(id){for(const key of ['start-screen','pause-screen','upgrade-screen','end-screen'])$('#'+key).hidden=key!==id;}
  function start(){keys.clear();shoot=false;target=null;activePointer=null;logs.length=0;game.start();overlays(null);$('#pause').disabled=false;$('#pause').setAttribute('aria-label','Pausar partida');ui();canvas.focus();}
  function pause(){if(game.state==='playing'){game.state='paused';keys.clear();shoot=false;target=null;activePointer=null;overlays('pause-screen');$('#pause').setAttribute('aria-label','Continuar partida');}else if(game.state==='paused'){game.state='playing';overlays(null);$('#pause').setAttribute('aria-label','Pausar partida');}}
  function offers(){const p=game.player;$('#wallet').textContent=game.credits;$('#weapon-offer').textContent=p.weapon===4?'Nível máximo atingido':`Nível ${p.weapon+1} · ${40*p.weapon} ◈`;$('#shield-offer').textContent=p.shieldLevel===3?'Nível máximo atingido':`+30 de capacidade · ${35*p.shieldLevel} ◈`;
    document.querySelector('[data-upgrade="weapon"]').disabled=p.weapon===4||game.credits<40*p.weapon;
    document.querySelector('[data-upgrade="shield"]').disabled=p.shieldLevel===3||game.credits<35*p.shieldLevel;
    document.querySelector('[data-upgrade="repair"]').disabled=p.hp===100||game.credits<30;
  }
  function ui(){const p=game.player;$('#hull').value=p.hp;$('#hull-text').textContent=`${Math.ceil(p.hp)}%`;$('#shield').max=p.maxShield;$('#shield').value=p.shield;$('#shield-text').textContent=Math.ceil(p.shield);$('#score').textContent=padded(game.score);$('#best').textContent=padded(best);$('#credits').textContent=`◈ ${game.credits}`;$('#weapon-level').textContent=`Nível ${p.weapon}`;$('#sector-number').innerHTML=`${String(game.sector).padStart(2,'0')}<span>/ 05</span>`;$('#sector-name').textContent=sectorNames[game.sector-1];
    $('#remaining').textContent=game.sector===5?'CHEFE':game.remaining>0?`${Math.ceil(game.remaining)}s`:`${game.enemies.length} alvos`;
    $('#objective').textContent=game.sector===5?'Destrua o Guardião para abrir a rota de fuga.':game.remaining>0?'Sobreviva e recolha fragmentos.':'Elimine os drones restantes para liberar o salto.';
    $('#remaining-label').textContent=game.sector===5?'ROTA BLOQUEADA':'PRÓXIMA JANELA DE SALTO';
    $('#boost-status').textContent=game.boostCooldown>0?`${game.boostCooldown.toFixed(1)}s`:'Pronta';$('#pulse-status').textContent=game.pulseCooldown>0?`${game.pulseCooldown.toFixed(1)}s`:'Pronto';
    for(const [id,cooldown] of [['boost',game.boostCooldown],['pulse',game.pulseCooldown]]){$('#'+id).disabled=game.state!=='playing'||cooldown>0;$('#'+id).classList.toggle('cooling',cooldown>0);}
    [...$('#route').children].forEach((node,i)=>{node.classList.toggle('current',i===game.sector-1);node.classList.toggle('done',i<game.sector-1);});
    $('#arena-status').textContent=game.state==='playing'?`SETOR ${String(game.sector).padStart(2,'0')} / EM COMBATE`:game.state==='paused'?'TRANSMISSÃO PAUSADA':game.state==='upgrade'?'MANUTENÇÃO EM ÓRBITA':game.state==='won'?'ROTA DE FUGA ABERTA':game.state==='lost'?'SINAL PERDIDO':'AGUARDANDO PILOTO';
  }
  function events(){for(const event of game.events.splice(0)){
    if(event.type==='shot')tone(470,.035,'triangle',.012);
    if(event.type==='pickup')tone(950,.045,'sine',.018);
    if(event.type==='kill')tone(100,.12,'sawtooth',.025);
    if(event.type==='damage'){shake=reduced?0:9;tone(60,.18,'sawtooth',.04);}
    if(event.type==='boost')tone(160,.2,'triangle',.03);
    if(event.type==='pulse'){shake=reduced?0:4;tone(80,.4,'sine',.06);}
    if(event.type==='sector'){$('#wave-announcement').textContent=`SETOR 0${game.sector} / ${sectorNames[game.sector-1].toUpperCase()}`;announcement=3;log(`Salto concluído. ${sectorNames[game.sector-1]}.`);}
    if(event.type==='sector-clear'){overlays('upgrade-screen');$('#upgrade-title').textContent=`Setor ${game.sector} atravessado.`;$('#upgrade-feedback').textContent='Bônus de travessia: +20 fragmentos e +250 pontos.';offers();log('Zona segura. Janela de manutenção aberta.');}
    if(event.type==='won'||event.type==='lost'){
      const won=event.type==='won';if(game.score>best){best=game.score;try{localStorage.setItem('orbita-zero-best',String(best));}catch{}}
      overlays('end-screen');$('#pause').disabled=true;$('#end-label').textContent=won?'TRANSMISSÃO RECEBIDA':'SINAL PERDIDO';$('#end-title').textContent=won?'Você encontrou o caminho.':'O vazio venceu.';$('#end-description').textContent=won?'O Guardião foi destruído. Sua nave atravessa a última órbita. Bem-vindo de volta, comandante.':`A Andorinha foi perdida no setor ${game.sector}. Cada expedição ensina uma nova rota.`;$('#end-score').textContent=padded(game.score);$('#end-kills').textContent=game.kills;$('#end-time').textContent=clock(game.time);log(won?'Rota de fuga aberta. Expedição concluída.':'Integridade crítica. Transmissão encerrada.');tone(won?660:90,.7,'triangle',.04);
    }
  }}
  function ship(x,y,angle,scale=1,preview=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.scale(scale,scale);
    const flame=preview?22:game.boostTime>0?48:15+Math.sin(performance.now()*.03)*5;
    ctx.shadowColor='#a294ff';ctx.shadowBlur=18;ctx.fillStyle='#ac9bff';ctx.beginPath();ctx.moveTo(-7,17);ctx.lineTo(-3,17+flame);ctx.lineTo(1,17);ctx.fill();ctx.beginPath();ctx.moveTo(3,17);ctx.lineTo(7,17+flame);ctx.lineTo(11,17);ctx.fill();ctx.shadowBlur=0;
    const metal=ctx.createLinearGradient(-20,0,20,20);metal.addColorStop(0,'#e2f2ff');metal.addColorStop(.5,'#93abc6');metal.addColorStop(1,'#556f8d');ctx.fillStyle=metal;ctx.strokeStyle='#b6d2eb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(25,21);ctx.lineTo(9,14);ctx.lineTo(0,24);ctx.lineTo(-9,14);ctx.lineTo(-25,21);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#79e0f0';ctx.shadowColor='#79e0f0';ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(5,7);ctx.lineTo(0,3);ctx.lineTo(-5,7);ctx.closePath();ctx.fill();ctx.restore();
  }
  function background(t){ctx.fillStyle='#080f20';ctx.fillRect(0,0,W,H);
    const nebula=ctx.createRadialGradient(890,240,20,890,240,620);nebula.addColorStop(0,'#44326665');nebula.addColorStop(.5,'#242f503a');nebula.addColorStop(1,'#080f2000');ctx.fillStyle=nebula;ctx.fillRect(0,0,W,H);
    const cloud=ctx.createRadialGradient(300,640,10,300,640,450);cloud.addColorStop(0,'#21576528');cloud.addColorStop(1,'#080f2000');ctx.fillStyle=cloud;ctx.fillRect(0,0,W,H);
    for(const star of stars){const y=(star.y+(reduced?0:t*(star.r*2)))%H;ctx.globalAlpha=star.a;ctx.fillStyle='#c3dafc';ctx.beginPath();ctx.arc(star.x,y,star.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    ctx.save();ctx.translate(910,267);ctx.rotate(-.25);ctx.strokeStyle='#acb7e42a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,252,68,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,258,70,0,0,Math.PI*2);ctx.stroke();
    const planet=ctx.createRadialGradient(-65,-65,5,10,10,174);planet.addColorStop(0,'#9a9bb8');planet.addColorStop(.35,'#5a647f');planet.addColorStop(.7,'#27334f');planet.addColorStop(1,'#090f20');ctx.shadowColor='#a9beff33';ctx.shadowBlur=30;ctx.fillStyle=planet;ctx.beginPath();ctx.arc(0,0,165,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#9cb6e044';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,166,Math.PI*.78,Math.PI*1.68);ctx.stroke();ctx.restore();
    ctx.strokeStyle='#5c78960c';ctx.lineWidth=1;for(let x=0;x<W;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }
  function enemy(e){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.kind==='boss'?e.phase*.15:Math.atan2(game.player.y-e.y,game.player.x-e.x)+Math.PI/2);const boss=e.kind==='boss';ctx.strokeStyle=boss?'#f5a77b':e.kind==='shooter'?'#efa6d9':'#d28af4';ctx.fillStyle=boss?'#512f39':'#342548';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;ctx.lineWidth=2;ctx.beginPath();if(boss){for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=Math.cos(a)*e.r,y=Math.sin(a)*e.r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}else{ctx.moveTo(0,-e.r);ctx.lineTo(e.r,e.r*.65);ctx.lineTo(0,e.r*.25);ctx.lineTo(-e.r,e.r*.65);ctx.closePath();}ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=boss?'#ffd6a0':'#f0bbff';ctx.beginPath();ctx.arc(0,0,boss?17:5,0,Math.PI*2);ctx.fill();if(boss){ctx.strokeStyle='#d8876650';ctx.beginPath();ctx.arc(0,0,e.r+15,0,Math.PI*2);ctx.stroke();}ctx.restore();if(boss||e.hp<e.maxHp){ctx.fillStyle='#382d3d';ctx.fillRect(e.x-e.r,e.y-e.r-13,e.r*2,3);ctx.fillStyle=boss?'#efa477':'#cf94f0';ctx.fillRect(e.x-e.r,e.y-e.r-13,e.r*2*Math.max(0,e.hp/e.maxHp),3);}}
  function draw(t,dt){ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);background(t);ctx.save();if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake=Math.max(0,shake-dt*25);}
    if(game.state==='ready'){ship(840,500,-.55,2.7,true);ctx.restore();return;}
    for(const rock of game.rocks){ctx.save();ctx.translate(rock.x,rock.y);ctx.rotate(rock.angle);ctx.fillStyle='#32374a';ctx.strokeStyle='#636780';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=rock.r*(i%2?.8:1);i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#202738';ctx.beginPath();ctx.arc(rock.r*.2,-rock.r*.2,rock.r*.25,0,Math.PI*2);ctx.fill();ctx.restore();}
    for(const pickup of game.pickups){ctx.save();ctx.translate(pickup.x,pickup.y);ctx.rotate(t*2);ctx.fillStyle='#f1c38d';ctx.shadowBlur=14;ctx.shadowColor='#eab77e';ctx.fillRect(-4,-4,8,8);ctx.restore();}
    for(const e of game.enemies)enemy(e);
    for(const [list,color] of [[game.bullets,'#a2f3f3'],[game.hostile,'#ff92ae']]){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.lineWidth=3;for(const b of list){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.017,b.y-b.vy*.017);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;}
    const p=game.player;if(game.state!=='lost'&&(p.invincible<=0||Math.floor(t*16)%2)){ship(p.x,p.y,p.angle);if(p.shield>0){ctx.strokeStyle=`rgba(125,202,247,${.08+p.shield/p.maxShield*.18})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,29,0,Math.PI*2);ctx.stroke();}}
    for(const e of game.effects){ctx.globalAlpha=Math.max(0,e.life/e.max);if(e.type==='pulse'){ctx.strokeStyle='#9feced';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,Math.PI*2);ctx.stroke();}else{ctx.fillStyle=e.color;ctx.fillRect(e.x,e.y,e.r,e.r);}}ctx.globalAlpha=1;
    if(target&&touch){ctx.strokeStyle='#8de8ed55';ctx.beginPath();ctx.arc(target.x,target.y,24,0,Math.PI*2);ctx.stroke();}
    if(!touch&&game.state==='playing'){ctx.strokeStyle='#b5dcf17a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(aim.x,aim.y,8,0,Math.PI*2);ctx.moveTo(aim.x-13,aim.y);ctx.lineTo(aim.x-5,aim.y);ctx.moveTo(aim.x+5,aim.y);ctx.lineTo(aim.x+13,aim.y);ctx.moveTo(aim.x,aim.y-13);ctx.lineTo(aim.x,aim.y-5);ctx.moveTo(aim.x,aim.y+5);ctx.lineTo(aim.x,aim.y+13);ctx.stroke();}
    ctx.restore();
  }
  function frame(ms){const dt=Math.min(.05,last?(ms-last)/1000:0);last=ms;if(game.state==='playing'){game.step(dt,{dx:(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dy:(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0),target:touch?target:null,aim,autoAim:touch,fire:shoot||auto||keys.has('Space')||touch});}events();draw(ms/1000,dt);announcement=Math.max(0,announcement-dt);$('#wave-announcement').classList.toggle('show',announcement>0&&game.state==='playing');uiTimer+=dt;if(uiTimer>.1){ui();uiTimer=0;}requestAnimationFrame(frame);}
  function position(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width*W,y:(event.clientY-r.top)/r.height*H};}
  canvas.addEventListener('pointerdown',event=>{if(game.state!=='playing')return;canvas.setPointerCapture(event.pointerId);activePointer=event.pointerId;touch=event.pointerType!=='mouse';if(touch)target=position(event);else{aim=position(event);shoot=true;}event.preventDefault();});
  canvas.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){aim=position(event);touch=false;}else if(event.pointerId===activePointer)target=position(event);});
  const release=event=>{if(event.pointerId===activePointer){shoot=false;target=null;activePointer=null;}};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  window.addEventListener('keydown',event=>{if($('#help-dialog').open)return;const supported=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','ShiftLeft','ShiftRight','KeyE','KeyP','Escape'];if(!supported.includes(event.code))return;if(game.state==='playing'||game.state==='paused')event.preventDefault();keys.add(event.code);if(!event.repeat){if(event.code==='KeyP'||event.code==='Escape')pause();if(event.code.startsWith('Shift'))game.boost();if(event.code==='KeyE')game.pulse();}});
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{keys.clear();shoot=false;if(game.state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state==='playing')pause();});
  $('#start').addEventListener('click',start);$('#restart').addEventListener('click',start);$('#restart-pause').addEventListener('click',start);$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',pause);$('#boost').addEventListener('click',()=>game.boost());$('#pulse').addEventListener('click',()=>game.pulse());
  $('#auto-fire').addEventListener('click',()=>{auto=!auto;$('#auto-fire').textContent=`Disparo automático: ${auto?'on':'off'}`;$('#auto-fire').setAttribute('aria-pressed',String(auto));});
  $('#sound').addEventListener('click',()=>{sound=!sound;if(sound){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{sound=false;}}$('#sound').textContent=`Som: ${sound?'on':'off'}`;$('#sound').setAttribute('aria-pressed',String(sound));if(sound)tone(600,.1);});
  $('#help').addEventListener('click',()=>{if(game.state==='playing')pause();$('#help-dialog').showModal();});for(const id of ['close-help','help-done'])$('#'+id).addEventListener('click',()=>$('#help-dialog').close());
  document.querySelectorAll('[data-upgrade]').forEach(button=>button.addEventListener('click',()=>{if(game.buy(button.dataset.upgrade)){$('#upgrade-feedback').textContent='Melhoria instalada. A Andorinha está pronta para o próximo salto.';log('Melhoria de equipamento instalada.');tone(700,.12);offers();ui();}}));
  $('#next-sector').addEventListener('click',()=>{game.next();keys.clear();shoot=false;overlays(null);ui();});
  canvas.setAttribute('tabindex','0');ui();requestAnimationFrame(frame);
})();
