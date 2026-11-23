(() => {
  const $=s=>document.querySelector(s),{Game,W,H,sectorNames}=SpaceGame,game=new Game();
  const canvas=$('#canvas'),ctx=canvas.getContext('2d'),keys=new Set();
  let aim={x:W/2,y:0},shoot=false,auto=false,touch=false,target=null,activePointer=null,sound=false,audio=null,best=0,last=0,uiTimer=0,shake=0,announcement=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars=Array.from({length:220},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.25,a:Math.random()*.6+.15}));
  const logs=[];
  let wasPlayingBeforePractice=false;
  const quizSummary=()=>`Acertos: ${game.questionsCorrect} / Respondidas: ${game.questionsAnswered}`;
  try{best=Number(localStorage.getItem('orbita-zero-best'))||0;}catch{}
  const clock=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  const padded=n=>String(Math.floor(n)).padStart(5,'0');
  function log(text){logs.unshift({time:clock(game.time),text});logs.length=Math.min(3,logs.length);$('#log').replaceChildren(...logs.map(item=>{const li=document.createElement('li'),span=document.createElement('span');span.textContent=item.time;li.append(span,item.text);return li;}));}
  function tone(frequency,duration=.06,type='sine',volume=.025){if(!sound||!audio)return;try{const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
  function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
  new ResizeObserver(resize).observe(canvas);resize();
  function overlays(id){for(const key of ['start-screen','pause-screen','upgrade-screen','end-screen','quiz-screen'])$('#'+key).hidden=key!==id;$('#arena').classList.toggle('question-mode',id==='quiz-screen');}
  function showQuestion(){
    const quiz=game.quiz,question=quiz.questions[quiz.index];
    overlays('quiz-screen');keys.clear();shoot=false;target=null;activePointer=null;
    $('#quiz-round').textContent=game.quizOnly?`SOLO · ${quiz.index+1}/16`:`FASE ${game.sector} · ${quiz.index+1}/${quiz.questions.length}`;
    $('#quiz-screen h2').textContent=game.quizOnly?'16 DESAFIOS. UM NOVO RECORDE.':'ACERTOU? SUA NAVE AGRADECE.';
    $('.quiz-instruction').textContent=game.quizOnly?'16 perguntas, sem combate. +100 pontos por acerto. Aprenda com cada explicação.':'+100 pontos e +15 fragmentos por acerto. Três seguidos liberam OVERDRIVE.';
    $('#quiz-question').textContent=question.prompt;
    $('#quiz-dots').replaceChildren(...quiz.questions.map((_,i)=>{const dot=document.createElement('i');dot.className=i<quiz.index?'done':i===quiz.index?'active':'';return dot;}));
    $('#quiz-explanation').hidden=true;$('#quiz-explanation').textContent='';
    $('#quiz-next').disabled=true;$('#quiz-next').textContent=quiz.index===quiz.questions.length-1?(game.quizOnly?'VER RESULTADO →':'LIBERAR NAVE →'):'PRÓXIMA PERGUNTA →';
    $('#quiz-options').replaceChildren(...question.choices.map((choice,index)=>{
      const button=document.createElement('button');button.type='button';
      const number=document.createElement('span');number.textContent=String.fromCharCode(65+index);
      button.append(number,choice.text);button.addEventListener('click',()=>answerQuestion(index));return button;
    }));
    $('#quiz-total').textContent=quizSummary();
    $('.quiz-content').focus({preventScroll:true});$('#quiz-screen').scrollIntoView({block:'start',behavior:'auto'});ui();
  }
  function answerQuestion(index){
    const correct=game.answerQuestion(index);if(correct===null)return;
    const question=game.quiz.questions[game.quiz.index];
    [...$('#quiz-options').children].forEach((button,i)=>{button.disabled=true;button.classList.toggle('answer-correct',question.choices[i].correct);button.classList.toggle('answer-wrong',i===index&&!correct);
      if(question.choices[i].correct)button.append(' ✓ Resposta correta');else if(i===index)button.append(' × Sua resposta');
    });
    const explanation=$('#quiz-explanation');explanation.hidden=false;explanation.classList.toggle('incorrect',!correct);
    explanation.textContent=`${correct?'ACERTOU! +100 pontos e +15 fragmentos.':'QUASE! Confira a resposta correta, sem penalidade.'} ${question.explanation}${correct&&game.quizStreak%3===0&&!game.quizOnly?' OVERDRIVE LIBERADO: 8 segundos de disparo rápido na arena!':''}`;
    $('#quiz-next').disabled=false;$('#quiz-total').textContent=quizSummary();
    log(`${question.topic}: ${correct?'resposta correta, +15 fragmentos.':'revisão registrada.'}`);tone(correct?780:190,.12);ui();$('#quiz-next').focus({preventScroll:true});
  }
  function start(){keys.clear();shoot=false;target=null;activePointer=null;logs.length=0;game.start();overlays(null);$('#pause').disabled=false;$('#pause').setAttribute('aria-label','Pausar partida');ui();canvas.focus();}
  function startPractice(){keys.clear();shoot=false;target=null;activePointer=null;logs.length=0;game.startQuizOnly();overlays(null);ui();}
  function requestPractice(){
    if(['playing','paused','upgrade','quiz'].includes(game.state)){
      wasPlayingBeforePractice=game.state==='playing';if(wasPlayingBeforePractice)pause();$('#practice-dialog').showModal();
    }else startPractice();
  }
  function dash(){
    const dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
    const dy=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
    game.boost(target?{x:target.x-game.player.x,y:target.y-game.player.y}:dx||dy?{x:dx,y:dy}:game.lastMove);
  }
  function pause(){if(game.state==='playing'){game.state='paused';keys.clear();shoot=false;target=null;activePointer=null;overlays('pause-screen');$('#pause').setAttribute('aria-label','Continuar partida');}else if(game.state==='paused'){game.state='playing';overlays(null);$('#pause').setAttribute('aria-label','Pausar partida');}}
  function offers(){const p=game.player;$('#wallet').textContent=game.credits;$('#weapon-offer').textContent=p.weapon===4?'Nível máximo atingido':`Nível ${p.weapon+1} · ${40*p.weapon} ◈`;$('#shield-offer').textContent=p.shieldLevel===3?'Nível máximo atingido':`+30 de capacidade · ${35*p.shieldLevel} ◈`;
    document.querySelector('[data-upgrade="weapon"]').disabled=p.weapon===4||game.credits<40*p.weapon;
    document.querySelector('[data-upgrade="shield"]').disabled=p.shieldLevel===3||game.credits<35*p.shieldLevel;
    document.querySelector('[data-upgrade="repair"]').disabled=p.hp===100||game.credits<30;
  }
  function ui(){const p=game.player;$('#hull').value=p.hp;$('#hull-text').textContent=`${Math.ceil(p.hp)}%`;$('#shield').max=p.maxShield;$('#shield').value=p.shield;$('#shield-text').textContent=Math.ceil(p.shield);$('#score').textContent=padded(game.score);$('#best').textContent=padded(best);$('#credits').textContent=`◈ ${game.credits}`;$('#weapon-level').textContent=`Nível ${p.weapon}`;$('#sector-number').innerHTML=`${String(game.sector).padStart(2,'0')}<span>/ 05</span>`;$('#sector-name').textContent=sectorNames[game.sector-1];
    $('#knowledge-score').textContent=quizSummary();
    $('#arcade-correct').replaceChildren(document.createTextNode(String(game.questionsCorrect).padStart(2,'0')),Object.assign(document.createElement('span'),{textContent:'/16'}));
    $('#combo').textContent=`×${game.multiplier}`;
    $('#quiz-streak').textContent=`SEQUÊNCIA: ${game.quizStreak} ★`;
    const streakCells=game.quizStreak>0?(game.quizStreak%3||3):0;
    [...$('#streak-track').children].forEach((node,i)=>node.classList.toggle('active',i<streakCells));
    $('#overdrive-banner').hidden=game.overdrive<=0||game.state!=='playing';$('#overdrive-time').textContent=`${Math.ceil(game.overdrive)}s`;
    $('#dash-count').textContent=`${game.dashCharges}/2`;$('#dash-button-count').textContent=`${game.dashCharges}/2`;
    [...$('#dash-cells').children].forEach((node,i)=>node.classList.toggle('charged',i<game.dashCharges));
    $('#dash-cells').setAttribute('aria-label',`${game.dashCharges} de 2 cargas de dash`);
    $('#pause').disabled=!['playing','paused'].includes(game.state);
    $('#end-quiz').textContent=`QUIZ / ${quizSummary()} · Melhor sequência: ${game.bestQuizStreak}`;
    $('#remaining').textContent=game.sector===5?'CHEFE':game.remaining>0?`${Math.ceil(game.remaining)}s`:`${game.enemies.length} alvos`;
    $('#objective').textContent=game.sector===5?'Destrua o Guardião para abrir a rota de fuga.':game.remaining>0?'Sobreviva e recolha fragmentos.':'Elimine os drones restantes para liberar o salto.';
    $('#remaining-label').textContent=game.sector===5?'ROTA BLOQUEADA':'PRÓXIMA JANELA DE SALTO';
    $('#boost-status').textContent=game.boostCooldown>0?`${game.dashCharges}/2 · +1 em ${game.boostCooldown.toFixed(1)}s`:'2/2 · pronto';$('#pulse-status').textContent=game.pulseCooldown>0?`${game.pulseCooldown.toFixed(1)}s`:'Pronto';
    for(const [id,cooldown] of [['boost',game.boostCooldown],['pulse',game.pulseCooldown]]){$('#'+id).disabled=game.state!=='playing'||cooldown>0;$('#'+id).classList.toggle('cooling',cooldown>0);}
    $('#boost').disabled=game.state!=='playing'||game.dashCharges<=0||game.boostTime>0;
    [...$('#route').children].forEach((node,i)=>{node.classList.toggle('current',i===game.sector-1);node.classList.toggle('done',i<game.sector-1);});
    $('#arena-status').textContent=game.state==='playing'?`SETOR ${String(game.sector).padStart(2,'0')} / EM COMBATE`:game.state==='paused'?'TRANSMISSÃO PAUSADA':game.state==='upgrade'?'MANUTENÇÃO EM ÓRBITA':game.state==='won'?'ROTA DE FUGA ABERTA':game.state==='lost'?'SINAL PERDIDO':'AGUARDANDO PILOTO';
    if(game.state==='quiz'){$('#arena-status').textContent='★ QUIZ CHALLENGE / COMBATE PAUSADO';$('#objective').textContent=game.quizOnly?'MODO SOLO: encare as 16 perguntas, sem combate.':'Responda ao quiz. Três acertos seguidos liberam OVERDRIVE!';}
    $('#route').hidden=game.quizOnly;
    if(game.quizOnly){
      $('#sector-number').replaceChildren(document.createTextNode(String(game.questionsAnswered).padStart(2,'0')),Object.assign(document.createElement('span'),{textContent:'/16'}));
      $('#sector-name').textContent='Quiz Challenge';$('#remaining').textContent='SEM LIMITE';$('#remaining-label').textContent='RESPONDA NO SEU RITMO';
    }
  }
  function events(){for(const event of game.events.splice(0)){
    if(event.type==='quiz')showQuestion();
    if(event.type==='overdrive'&&!game.quizOnly){log('TRIPLO ACERTO! OVERDRIVE pronto para a arena.');tone(1000,.3,'triangle',.03);}
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
      overlays('end-screen');$('#pause').disabled=true;$('#end-label').textContent=game.quizOnly?'QUIZ CHALLENGE / RESULTADO':won?'MISSION COMPLETE!':'GAME OVER';$('#end-title').textContent=game.quizOnly?(game.questionsCorrect===16?'PERFECT SCORE!':'CONHECIMENTO ADQUIRIDO!'):won?'VOCÊ ZEROU O VAZIO.':'MAIS UMA FICHA?';$('#end-description').textContent=game.quizOnly?'Você respondeu às 16 perguntas. Jogue novamente para superar sua marca.':won?'O Guardião caiu. A Andorinha está voltando para casa.':`Sua nave caiu na fase ${game.sector}. Novo recorde na próxima tentativa?`;$('#end-score').textContent=padded(game.score);$('#end-kills').textContent=game.quizOnly?game.bestQuizStreak:game.kills;$('#end-kills-label').textContent=game.quizOnly?'SEQUÊNCIA':'ALVOS';$('#end-time').textContent=game.quizOnly?'SEM PRESSA':clock(game.time);log(game.quizOnly?'Quiz concluído. Conhecimento registrado.':won?'Rota de fuga aberta. Expedição concluída.':'Integridade crítica. Transmissão encerrada.');tone(won?660:90,.7,'triangle',.04);
    }
  }}
  // Sprites originais: cada caractere corresponde a um pixel colorido.
  const sprites={
    ship:['......1......','.....111.....','.....121.....','....11211....','....12221....','...1122211...','1..1122211..1','11.1133311.11','1111133311111','1441111111441','1444111114441','111..111..111','.....4.4.....'],
    drone:['..1.....1..','...1...1...','..1222221..','.122222221.','12232223221','12222222221','1.2222222.1','1.1.....1.1','...11.11...'],
    shooter:['....11....','..112211..','.12222221.','1223443221','1223443221','.12222221.','..112211..','...1..1...','..11..11..'],
    heavy:['..1111111..','.122222221.','12222222221','12332223321','12332223321','12222222221','.122222221.','..11...11..','.11.....11.'],
    boss:['..11.......11..','.1221.....1221.','122221111122221','122222222222221','.122233322221.','..12233333221..','..12344444321..','..12233333221..','.122233322221.','122222222222221','12221.....12221','.121.......121.','..1.........1..']
  };
  const shipPalette={'1':'#fdf1d3','2':'#f994b1','3':'#5bf0de','4':'#6e4b94'};
  function pixels(pattern,palette,size=3){
    const width=Math.max(...pattern.map(row=>row.length)),height=pattern.length;
    pattern.forEach((row,y)=>[...row].forEach((pixel,x)=>{if(palette[pixel]){ctx.fillStyle=palette[pixel];ctx.fillRect((x-width/2)*size,(y-height/2)*size,size+.1,size+.1);}}));
  }
  function ship(x,y,angle,scale=1,preview=false){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.scale(scale,scale);
    ctx.shadowColor=game.overdrive>0?'#ffd45b':'#61f4d4';ctx.shadowBlur=preview?12:5;
    const flame=preview?13:game.boostTime>0?32:8+Math.floor(performance.now()/90)%3*3;
    ctx.fillStyle=game.boostTime>0?'#61f4d4':'#ffd45b';ctx.fillRect(-8,18,5,flame);ctx.fillRect(3,18,5,flame);
    ctx.fillStyle='#fff2b0';ctx.fillRect(-7,18,3,flame*.55);ctx.fillRect(4,18,3,flame*.55);
    pixels(sprites.ship,shipPalette,3.3);ctx.restore();
  }
  function background(t){
    ctx.fillStyle='#0b0920';ctx.fillRect(0,0,W,H);
    const haze=ctx.createRadialGradient(940,230,20,940,230,570);haze.addColorStop(0,'#64326b50');haze.addColorStop(1,'#140d2a00');ctx.fillStyle=haze;ctx.fillRect(0,0,W,H);
    for(const star of stars){const y=(star.y+(reduced?0:t*(star.r*5)))%H;ctx.globalAlpha=star.a;ctx.fillStyle=star.r>1?'#ffbfda':'#a8f1e9';const size=star.r>1?3:2;ctx.fillRect(Math.floor(star.x),Math.floor(y),size,size);}
    ctx.globalAlpha=1;
    ctx.save();ctx.translate(910,230);ctx.rotate(-.25);
    ctx.strokeStyle='#bb83b480';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,230,55,0,0,Math.PI*2);ctx.stroke();
    const planet=ctx.createLinearGradient(-100,-120,100,120);planet.addColorStop(0,'#f7a9b2');planet.addColorStop(.4,'#a863a0');planet.addColorStop(1,'#321d52');
    ctx.fillStyle=planet;ctx.beginPath();ctx.arc(0,0,130,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(0,0,130,0,Math.PI*2);ctx.clip();ctx.fillStyle='#ecc1bb22';for(let y=-110;y<130;y+=27)ctx.fillRect(-140,y,280,8);ctx.restore();
    ctx.strokeStyle='#eeaec4';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,230,55,0,0,Math.PI);ctx.stroke();ctx.restore();
    ctx.strokeStyle='#8e62d817';ctx.lineWidth=1;
    for(let x=-W;x<W*2;x+=120){ctx.beginPath();ctx.moveTo(W/2+(x-W/2)*.15,H*.8);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=H*.8;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }
  function enemy(e){
    ctx.save();ctx.translate(e.x,e.y);const boss=e.kind==='boss';
    if(!boss)ctx.rotate(Math.atan2(game.player.y-e.y,game.player.x-e.x)+Math.PI/2);
    const primary=boss?'#ffae77':e.kind==='shooter'?'#b59aff':e.kind==='heavy'?'#ffd45b':'#ef85be';
    ctx.shadowColor=primary;ctx.shadowBlur=7;
    const pattern=sprites[e.kind]||sprites.drone;
    pixels(pattern,{'1':primary,'2':'#523266','3':'#fff5d9','4':'#ff6f82'},e.r*2/Math.max(...pattern.map(row=>row.length)));
    ctx.restore();
    if(boss||e.hp<e.maxHp){ctx.fillStyle='#382440';ctx.fillRect(e.x-e.r,e.y-e.r-12,e.r*2,4);ctx.fillStyle=primary;ctx.fillRect(e.x-e.r,e.y-e.r-12,e.r*2*Math.max(0,e.hp/e.maxHp),4);}
  }
  function draw(t,dt){ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);background(t);ctx.save();if(shake>0){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake=Math.max(0,shake-dt*25);}
    if(game.state==='ready'){ship(840,500,-.55,2.7,true);ctx.restore();return;}
    for(const rock of game.rocks){ctx.save();ctx.translate(rock.x,rock.y);ctx.rotate(rock.angle);ctx.fillStyle='#32374a';ctx.strokeStyle='#636780';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=rock.r*(i%2?.8:1);i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#202738';ctx.beginPath();ctx.arc(rock.r*.2,-rock.r*.2,rock.r*.25,0,Math.PI*2);ctx.fill();ctx.restore();}
    for(const pickup of game.pickups){ctx.save();ctx.translate(pickup.x,pickup.y);ctx.rotate(t*2);ctx.fillStyle='#f1c38d';ctx.shadowBlur=14;ctx.shadowColor='#eab77e';ctx.fillRect(-4,-4,8,8);ctx.restore();}
    for(const e of game.enemies)enemy(e);
    for(const [list,color] of [[game.bullets,'#a2f3f3'],[game.hostile,'#ff92ae']]){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.lineWidth=3;for(const b of list){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.017,b.y-b.vy*.017);ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,2.5,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;}
    const p=game.player;if(game.state!=='lost'&&(p.invincible<=0||Math.floor(t*16)%2)){ship(p.x,p.y,p.angle);if(p.shield>0){ctx.strokeStyle=`rgba(125,202,247,${.08+p.shield/p.maxShield*.18})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,29,0,Math.PI*2);ctx.stroke();}}
    for(const e of game.effects){ctx.globalAlpha=Math.max(0,e.life/e.max);if(e.type==='pulse'){ctx.strokeStyle='#9feced';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,Math.PI*2);ctx.stroke();}else if(e.type==='trail'){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle+Math.PI/2);pixels(sprites.ship,{'1':'#61f4d4','2':'#61f4d4','3':'#fff9cc','4':'#61f4d4'},3.3);ctx.restore();}else if(e.type==='text'){ctx.fillStyle='#ffd45b';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText(e.text,e.x,e.y);}else{ctx.fillStyle=e.color;ctx.fillRect(e.x,e.y,e.r,e.r);}}ctx.globalAlpha=1;
    if(target&&touch){ctx.strokeStyle='#8de8ed55';ctx.beginPath();ctx.arc(target.x,target.y,24,0,Math.PI*2);ctx.stroke();}
    if(!touch&&game.state==='playing'){ctx.strokeStyle='#b5dcf17a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(aim.x,aim.y,8,0,Math.PI*2);ctx.moveTo(aim.x-13,aim.y);ctx.lineTo(aim.x-5,aim.y);ctx.moveTo(aim.x+5,aim.y);ctx.lineTo(aim.x+13,aim.y);ctx.moveTo(aim.x,aim.y-13);ctx.lineTo(aim.x,aim.y-5);ctx.moveTo(aim.x,aim.y+5);ctx.lineTo(aim.x,aim.y+13);ctx.stroke();}
    ctx.restore();
  }
  function frame(ms){const dt=Math.min(.05,last?(ms-last)/1000:0);last=ms;if(game.state==='playing'){game.step(dt,{dx:(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dy:(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0),target:touch?target:null,aim,autoAim:touch||auto,fire:shoot||auto||keys.has('Space')||touch});}events();draw(ms/1000,dt);announcement=Math.max(0,announcement-dt);$('#wave-announcement').classList.toggle('show',announcement>0&&game.state==='playing');uiTimer+=dt;if(uiTimer>.1){ui();uiTimer=0;}requestAnimationFrame(frame);}
  function position(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width*W,y:(event.clientY-r.top)/r.height*H};}
  canvas.addEventListener('pointerdown',event=>{if(game.state!=='playing')return;canvas.setPointerCapture(event.pointerId);activePointer=event.pointerId;touch=event.pointerType!=='mouse';if(touch)target=position(event);else{aim=position(event);shoot=true;}event.preventDefault();});
  canvas.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){aim=position(event);touch=false;}else if(event.pointerId===activePointer)target=position(event);});
  const release=event=>{if(event.pointerId===activePointer){shoot=false;target=null;activePointer=null;}};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  window.addEventListener('keydown',event=>{
    if($('#help-dialog').open||$('#practice-dialog').open)return;
    if(game.state==='quiz'){
      const choices={KeyA:0,KeyB:1,KeyC:2,KeyD:3,Digit1:0,Digit2:1,Digit3:2,Digit4:3};
      if(Object.hasOwn(choices,event.code)){event.preventDefault();if(!event.repeat)answerQuestion(choices[event.code]);}return;
    }
    const supported=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','ShiftLeft','ShiftRight','KeyE','KeyP','Escape'];if(!supported.includes(event.code))return;
    if(game.state==='playing'||game.state==='paused')event.preventDefault();keys.add(event.code);
    if(!event.repeat){if(event.code==='KeyP'||event.code==='Escape')pause();if(event.code.startsWith('Shift'))dash();if(event.code==='KeyE')game.pulse();}
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{keys.clear();shoot=false;if(game.state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state==='playing')pause();});
  $('#start').addEventListener('click',start);$('#restart').addEventListener('click',()=>game.quizOnly?startPractice():start());$('#restart-pause').addEventListener('click',start);$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',pause);$('#boost').addEventListener('click',dash);$('#pulse').addEventListener('click',()=>game.pulse());
  for(const id of ['practice','practice-side','end-practice'])$('#'+id).addEventListener('click',requestPractice);
  $('#confirm-practice').addEventListener('click',()=>{$('#practice-dialog').close();startPractice();});
  $('#cancel-practice').addEventListener('click',()=>$('#practice-dialog').close());
  $('#practice-dialog').addEventListener('close',()=>{if(wasPlayingBeforePractice&&game.state==='paused')pause();wasPlayingBeforePractice=false;});
  $('#auto-fire').addEventListener('click',()=>{auto=!auto;$('#auto-fire').textContent=`AUTO FIRE: ${auto?'ON':'OFF'}`;$('#auto-fire').setAttribute('aria-pressed',String(auto));});
  $('#sound').addEventListener('click',()=>{sound=!sound;if(sound){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{sound=false;}}$('#sound').textContent=`Som: ${sound?'on':'off'}`;$('#sound').setAttribute('aria-pressed',String(sound));if(sound)tone(600,.1);});
  $('#help').addEventListener('click',()=>{if(game.state==='playing')pause();$('#help-dialog').showModal();});for(const id of ['close-help','help-done'])$('#'+id).addEventListener('click',()=>$('#help-dialog').close());
  document.querySelectorAll('[data-upgrade]').forEach(button=>button.addEventListener('click',()=>{if(game.buy(button.dataset.upgrade)){$('#upgrade-feedback').textContent='Melhoria instalada. A Andorinha está pronta para o próximo salto.';log('Melhoria de equipamento instalada.');tone(700,.12);offers();ui();}}));
  $('#next-sector').addEventListener('click',()=>{game.next();keys.clear();shoot=false;overlays(null);ui();});
  $('#quiz-next').addEventListener('click',()=>{if(game.continueQuiz()){overlays(game.state==='quiz'?'quiz-screen':null);keys.clear();shoot=false;ui();if(game.state==='playing')canvas.focus();}});
  canvas.setAttribute('tabindex','0');ui();requestAnimationFrame(frame);
})();
