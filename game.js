/* Simulação independente do desenho e do navegador. Coordenadas em um mundo 1200 × 760. */
const SpaceGame = (() => {
  const W=1200,H=760, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const sectorNames=['Cinturão exterior','Ecos da estação','Zona de interferência','Fronteira vermelha','O Guardião'];
  const questions = [
    {topic:'CPU',prompt:'Qual componente busca, interpreta e executa as instruções dos programas?',options:['CPU','RAM','Flash','DMA'],answer:0,explanation:'A CPU executa as instruções dos programas. Memórias armazenam dados, enquanto DMA é um mecanismo de transferência.'},
    {topic:'ULA',prompt:'Que parte do processador realiza cálculos e operações lógicas?',options:['Cache','UC','ULA','ROM'],answer:2,explanation:'A ULA realiza operações aritméticas e lógicas, como somar e comparar valores.'},
    {topic:'UC',prompt:'Qual circuito decodifica instruções e emite os sinais que coordenam a execução?',options:['DMA','UC','ULA','RAM'],answer:1,explanation:'A Unidade de Controle coordena a execução das instruções por meio de sinais de controle.'},
    {topic:'RAM',prompt:'Qual memória principal de trabalho normalmente perde seu conteúdo quando a energia acaba?',options:['ROM','Flash','EEPROM','RAM'],answer:3,explanation:'A RAM é volátil: precisa de alimentação para manter os dados usados pelos programas em execução.'},
    {topic:'ROM',prompt:'Qual memória, em sua forma tradicional, recebe o conteúdo na fabricação para posterior leitura?',options:['ROM','RAM','Cache','Registradores'],answer:0,explanation:'A ROM tradicional é gravada na fabricação. Existem outras tecnologias de memória não volátil que permitem regravação.'},
    {topic:'CACHE',prompt:'Que memória rápida reduz o tempo de acesso a dados e instruções usados frequentemente?',options:['Memória de massa','EEPROM','Cache','ROM'],answer:2,explanation:'A cache mantém cópias de dados e instruções para reduzir acessos à memória principal, mais lenta.'},
    {topic:'EEPROM',prompt:'Qual memória não volátil permite apagar e regravar eletricamente bytes individuais?',options:['RAM','EEPROM','Cache','Registradores'],answer:1,explanation:'A EEPROM pode ser regravada eletricamente em pequenas unidades, tipicamente bytes, sem perder dados ao desligar.'},
    {topic:'FLASH',prompt:'Qual memória não volátil, comum em pendrives, apaga dados em blocos?',options:['RAM','ROM tradicional','Registradores','Flash'],answer:3,explanation:'A Flash permite apagar blocos de memória e conserva o conteúdo sem energia. É usada em pendrives, cartões e SSDs.'},
    {topic:'MEMORIADEMASSA',prompt:'Em qual categoria entram SSDs e discos rígidos que guardam arquivos de forma persistente?',options:['Memória de massa','Registradores','Cache','ULA'],answer:0,explanation:'A memória de massa oferece armazenamento persistente de grande capacidade para arquivos e programas.'},
    {topic:'REGISTRADORES',prompt:'Onde o processador mantém operandos e resultados imediatos em pequenos espaços internos?',options:['Memória de massa','ROM','Registradores','Flash'],answer:2,explanation:'Registradores são pequenas áreas de armazenamento dentro do processador, usadas diretamente na execução de instruções.'},
    {topic:'DMA',prompt:'Que mecanismo transfere dados entre periféricos e memória sem intervenção contínua da CPU?',options:['ULA','DMA','Cache','UC'],answer:1,explanation:'O DMA permite transferências diretas entre dispositivos e memória. A CPU ainda participa da configuração e do controle geral.'},
    {topic:'DATABUS',prompt:'Qual barramento transporta os valores transferidos entre processador, memória e dispositivos?',options:['Address bus','Barramento de controle','Clock','Data bus'],answer:3,explanation:'O data bus transporta os dados. O address bus indica o endereço, enquanto linhas de controle coordenam a operação.'},
    {topic:'ADDRESSBUS',prompt:'Qual barramento indica a posição de memória ou o dispositivo que será acessado?',options:['Address bus','Data bus','ULA','Cache'],answer:0,explanation:'O address bus transporta os endereços usados para selecionar posições de memória ou dispositivos endereçáveis.'},
    {topic:'MICROCONTROLADOR',prompt:'Qual chip integra processador, memória e periféricos para controlar um sistema embarcado?',options:['Módulo de RAM','Microcontrolador','SSD','Barramento'],answer:1,explanation:'Microcontroladores reúnem CPU, memórias e periféricos em um chip, sendo comuns no controle de equipamentos.'},
    {topic:'DUALCORE',prompt:'Quantos núcleos físicos de processamento possui um processador dual core?',options:['Um','Quatro','Dois','Oito'],answer:2,explanation:'Dual core indica dois núcleos físicos. Núcleos não devem ser confundidos com threads de execução.'},
    {topic:'QUADCORE',prompt:'Quantos núcleos físicos de processamento possui um processador quad core?',options:['Dois','Oito','Dezesseis','Quatro'],answer:3,explanation:'Quad core indica quatro núcleos físicos de processamento, independentemente da quantidade de threads suportadas.'}
  ];
  class Game {
    constructor(random=Math.random){this.random=random;this.reset();}
    reset(){
      this.player={x:W/2,y:H*.65,r:16,hp:100,shield:60,maxShield:60,weapon:1,shieldLevel:1,angle:-Math.PI/2,invincible:0};
      this.enemies=[];this.bullets=[];this.hostile=[];this.rocks=[];this.pickups=[];this.effects=[];
      this.score=0;this.credits=0;this.kills=0;this.time=0;this.sector=1;this.remaining=25;this.spawnTimer=1;
      this.cooldown=0;this.boostCooldown=0;this.pulseCooldown=0;this.boostTime=0;this.damageAgo=10;this.state='ready';this.events=[];
      this.quiz=null;this.questionsAnswered=0;this.questionsCorrect=0;
      this.quizOnly=false;this.quizStreak=0;this.bestQuizStreak=0;this.overdrive=0;
      this.dashCharges=2;this.dashDirection={x:0,y:-1};this.lastMove={x:0,y:-1};
      this.combo=0;this.comboTime=0;this.multiplier=1;
    }
    emit(type,data={}){this.events.push({type,...data});}
    start(){this.reset();this.makeRocks();this.beginQuiz();}
    startQuizOnly(){this.reset();this.quizOnly=true;this.beginQuiz();}
    beginQuiz(){
      const start=(this.sector-1)*3;
      const round=(this.quizOnly?questions:questions.slice(start,this.sector===5?16:start+3)).map(question=>{
        const choices=question.options.map((text,index)=>({text,correct:index===question.answer}));
        for(let i=choices.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
        return {...question,choices};
      });
      this.quiz={questions:round,index:0,selected:null,correct:null};this.state='quiz';this.emit('quiz');
    }
    answerQuestion(index){
      if(this.state!=='quiz'||!this.quiz||this.quiz.selected!==null)return null;
      const question=this.quiz.questions[this.quiz.index];
      if(!Number.isInteger(index)||index<0||index>=question.choices.length)return null;
      const correct=question.choices[index].correct;this.quiz.selected=index;this.quiz.correct=correct;this.questionsAnswered++;
      if(correct){this.questionsCorrect++;this.score+=100;this.credits+=15;this.quizStreak++;this.bestQuizStreak=Math.max(this.bestQuizStreak,this.quizStreak);if(this.quizStreak%3===0){this.overdrive=8;this.emit('overdrive');}}
      else this.quizStreak=0;
      return correct;
    }
    continueQuiz(){
      if(this.state!=='quiz'||this.quiz.selected===null)return false;
      if(this.quiz.index+1<this.quiz.questions.length){this.quiz.index++;this.quiz.selected=null;this.quiz.correct=null;this.emit('quiz');}
      else if(this.quizOnly){this.quiz=null;this.state='won';this.emit('won');}
      else{this.quiz=null;this.state='playing';this.player.invincible=2;this.emit('sector');}
      return true;
    }
    makeRocks(){for(let i=0;i<5;i++)this.rocks.push({x:60+this.random()*(W-120),y:40+this.random()*230,r:20+this.random()*22,hp:65,vx:(this.random()-.5)*24,vy:10+this.random()*12,angle:this.random()*6,spin:(this.random()-.5)*.3});}
    next(){if(this.state!=='upgrade')return;this.sector++;this.remaining=25+this.sector*3;this.spawnTimer=1;this.hostile=[];this.bullets=[];this.pickups=[];this.rocks=[];this.makeRocks();if(this.sector===5)this.spawn('boss');this.beginQuiz();}
    spawn(kind){
      const edge=Math.floor(this.random()*3),x=edge===0?-35:edge===1?W+35:80+this.random()*(W-160),y=edge===2?-35:this.random()*H*.6;
      const boss=kind==='boss', heavy=kind==='heavy';
      this.enemies.push({x:boss?W/2:x,y:boss?110:y,r:boss?65:heavy?26:kind==='shooter'?19:16,hp:boss?1400:heavy?100:kind==='shooter'?60:35,maxHp:boss?1400:heavy?100:kind==='shooter'?60:35,kind,speed:boss?30:heavy?48:kind==='shooter'?65:85+this.sector*9,fire:boss?1.5:2+this.random()*2,phase:this.random()*6});
    }
    boost(direction=this.lastMove){
      if(this.state!=='playing'||this.dashCharges<=0||this.boostTime>0)return false;
      let {x,y}=direction;const length=Math.hypot(x,y);
      if(!Number.isFinite(length)||length===0){x=Math.cos(this.player.angle);y=Math.sin(this.player.angle);}else{x/=length;y/=length;}
      this.dashDirection={x,y};this.dashCharges--;if(this.boostCooldown<=0)this.boostCooldown=4;
      this.boostTime=.18;this.player.invincible=.3;this.emit('boost');return true;
    }
    pulse(){if(this.state!=='playing'||this.pulseCooldown>0)return false;this.pulseCooldown=12;const p=this.player;this.hostile=this.hostile.filter(b=>distance(b,p)>230);for(const e of this.enemies)if(distance(e,p)<230)e.hp-=100;this.effects.push({x:p.x,y:p.y,r:230,life:.55,max:.55,type:'pulse'});this.emit('pulse');return true;}
    buy(type){
      if(this.state!=='upgrade')return false;const p=this.player;
      if(type==='weapon'&&p.weapon<4){const cost=40*p.weapon;if(this.credits<cost)return false;this.credits-=cost;p.weapon++;}
      else if(type==='shield'&&p.shieldLevel<3){const cost=35*p.shieldLevel;if(this.credits<cost)return false;this.credits-=cost;p.shieldLevel++;p.maxShield+=30;p.shield=p.maxShield;}
      else if(type==='repair'&&p.hp<100){if(this.credits<30)return false;this.credits-=30;p.hp=Math.min(100,p.hp+45);}
      else return false;this.emit('upgrade',{item:type});return true;
    }
    damage(amount){const p=this.player;if(p.invincible>0||this.state!=='playing')return;const absorbed=Math.min(p.shield,amount);p.shield-=absorbed;p.hp=Math.max(0,p.hp-(amount-absorbed));p.invincible=.65;this.damageAgo=0;this.combo=0;this.multiplier=1;this.comboTime=0;this.emit('damage');if(p.hp<=0){this.state='lost';this.emit('lost');}}
    burst(x,y,color='#83e5ff',count=15){for(let i=0;i<count;i++){const angle=this.random()*Math.PI*2,speed=35+this.random()*160;this.effects.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:1+this.random()*3,color,life:.3+this.random()*.6,max:.9,type:'spark'});}}
    step(dt,input={}){
      if(this.state!=='playing')return;dt=clamp(dt,0,.05);this.time+=dt;this.remaining=Math.max(0,this.remaining-dt);this.damageAgo+=dt;
      this.cooldown-=dt;this.pulseCooldown=Math.max(0,this.pulseCooldown-dt);
      if(this.dashCharges<2){this.boostCooldown=Math.max(0,this.boostCooldown-dt);if(this.boostCooldown<=0){this.dashCharges++;this.boostCooldown=this.dashCharges<2?4:0;}}
      this.overdrive=Math.max(0,this.overdrive-dt);this.comboTime=Math.max(0,this.comboTime-dt);if(!this.comboTime){this.combo=0;this.multiplier=1;}
      const p=this.player;p.invincible=Math.max(0,p.invincible-dt);if(this.damageAgo>4)p.shield=Math.min(p.maxShield,p.shield+10*dt);
      let dx=input.dx||0,dy=input.dy||0;if(input.target){dx=input.target.x-p.x;dy=input.target.y-p.y;const len=Math.hypot(dx,dy);if(len<8){dx=0;dy=0;}else{dx/=Math.max(60,len);dy/=Math.max(60,len);}}
      const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length>0)this.lastMove={x:dx,y:dy};
      if(this.boostTime>0){dx=this.dashDirection.x;dy=this.dashDirection.y;this.effects.push({x:p.x,y:p.y,angle:p.angle,r:20,life:.24,max:.24,type:'trail'});}
      const speed=this.boostTime>0?1200:275;p.x=clamp(p.x+dx*speed*dt,25,W-25);p.y=clamp(p.y+dy*speed*dt,25,H-25);this.boostTime=Math.max(0,this.boostTime-dt);
      let aim=input.aim;if(input.autoAim){let nearest=null;for(const e of this.enemies)if(!nearest||distance(e,p)<distance(nearest,p))nearest=e;aim=nearest||{x:p.x,y:p.y-300};}if(aim)p.angle=Math.atan2(aim.y-p.y,aim.x-p.x);
      if(input.fire&&this.cooldown<=0){this.cooldown=(.23-p.weapon*.025)*(this.overdrive>0?.5:1);const spreads=p.weapon>=3?[-.12,0,.12]:[0];for(const spread of spreads){const angle=p.angle+spread;this.bullets.push({x:p.x+Math.cos(angle)*23,y:p.y+Math.sin(angle)*23,vx:Math.cos(angle)*720,vy:Math.sin(angle)*720,r:4,life:1.8,damage:20+p.weapon*7});}this.emit('shot');}
      this.spawnTimer-=dt;
      if(this.spawnTimer<=0&&this.remaining>0){this.spawnTimer=Math.max(.65,2.5-this.sector*.3);this.spawn(this.sector>=3&&this.random()<.25?'heavy':this.sector>=2&&this.random()<.45?'shooter':'drone');}
      for(const e of this.enemies){
        const angle=Math.atan2(p.y-e.y,p.x-e.x),d=distance(p,e);e.phase+=dt;
        if(e.kind==='boss'){e.x=W/2+Math.sin(e.phase*.5)*280;e.y=125+Math.sin(e.phase)*32;}
        else if(e.kind!=='shooter'||d>290){e.x+=Math.cos(angle)*e.speed*dt;e.y+=Math.sin(angle)*e.speed*dt;}
        else{e.x+=Math.cos(angle+Math.PI/2)*e.speed*dt;e.y+=Math.sin(angle+Math.PI/2)*e.speed*dt;}
        e.fire-=dt;
        if((e.kind==='shooter'||e.kind==='boss')&&e.fire<=0){e.fire=e.kind==='boss'?.95:2.2;const count=e.kind==='boss'?12:1;for(let i=0;i<count;i++){const a=count===1?angle:i/count*Math.PI*2+e.phase;this.hostile.push({x:e.x,y:e.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,r:5,life:7});}}
        if(d<e.r+p.r)this.damage(e.kind==='boss'?45:25);
      }
      for(const rock of this.rocks){rock.x+=rock.vx*dt;rock.y+=rock.vy*dt;rock.angle+=rock.spin*dt;if(rock.y>H+rock.r){rock.y=-rock.r;rock.x=this.random()*W;}if(distance(rock,p)<rock.r+p.r)this.damage(22);}
      for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const target of [...this.enemies,...this.rocks]){if(target.hp>0&&b.life>0&&distance(b,target)<target.r+b.r){target.hp-=b.damage;b.life=0;this.burst(b.x,b.y,'#77dfee',3);}}}
      for(const b of this.hostile){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(distance(b,p)<p.r+b.r){this.damage(18);b.life=0;}}
      let bossDead=false;
      this.enemies=this.enemies.filter(e=>{if(e.hp>0)return true;this.kills++;this.combo++;this.comboTime=3;this.multiplier=Math.min(4,1+Math.floor((this.combo-1)/3));const reward=(e.kind==='boss'?1500:e.kind==='heavy'?150:100)*this.multiplier;this.score+=reward;this.effects.push({x:e.x,y:e.y-25,vx:0,vy:-35,life:1,max:1,type:'text',text:`+${reward}`});this.burst(e.x,e.y,e.kind==='boss'?'#f1ad70':'#b193ff',e.kind==='boss'?80:20);this.pickups.push({x:e.x,y:e.y,r:8,value:e.kind==='boss'?100:8,life:14});if(e.kind==='boss')bossDead=true;this.emit('kill');return false;});
      this.rocks=this.rocks.filter(e=>{if(e.hp>0)return true;this.burst(e.x,e.y,'#a5a7b5');this.score+=25;this.pickups.push({x:e.x,y:e.y,r:7,value:5,life:14});return false;});
      for(const pickup of this.pickups){pickup.life-=dt;const d=distance(pickup,p);if(d<130){const a=Math.atan2(p.y-pickup.y,p.x-pickup.x);pickup.x+=Math.cos(a)*300*dt;pickup.y+=Math.sin(a)*300*dt;}if(d<25){this.credits+=pickup.value;this.score+=pickup.value*2;pickup.life=0;this.emit('pickup');}}
      this.pickups=this.pickups.filter(e=>e.life>0);this.bullets=this.bullets.filter(b=>b.life>0);this.hostile=this.hostile.filter(b=>b.life>0&&b.x>-100&&b.x<W+100&&b.y>-100&&b.y<H+100);
      for(const e of this.effects){e.life-=dt;if(Number.isFinite(e.vx)){e.x+=e.vx*dt;e.y+=e.vy*dt;}}this.effects=this.effects.filter(e=>e.life>0);
      if(this.state!=='playing')return;
      if(bossDead){this.state='won';this.score+=2000;this.emit('won');}
      else if(this.remaining<=0&&this.enemies.length===0&&this.sector<5){this.credits+=20;this.score+=250;this.state='upgrade';this.emit('sector-clear');}
    }
  }
  return {Game,W,H,sectorNames,questions};
})();
if(typeof module!=='undefined')module.exports=SpaceGame;
