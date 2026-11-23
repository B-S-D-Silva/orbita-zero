const assert=require('node:assert/strict');
const {Game,W,H,questions}=require('../game.js');
const finishQuiz=g=>{while(g.state==='quiz'){g.answerQuestion(g.quiz.questions[g.quiz.index].choices.findIndex(choice=>!choice.correct));g.continueQuiz();}};
const fresh=()=>{const g=new Game(()=>.4);g.start();finishQuiz(g);g.player.invincible=0;g.rocks=[];return g;};
{
  const g=fresh();g.step(.05,{dx:1,dy:1});assert.ok(g.player.x>W/2&&g.player.y>H*.65);
  g.player.x=W-25;g.player.y=H-25;g.step(.05,{dx:1,dy:1});assert.equal(g.player.x,W-25);assert.equal(g.player.y,H-25);
  const x=g.player.x;g.state='paused';g.step(.05,{dx:-1});assert.equal(g.player.x,x);assert.equal(g.time,.1);
}
{
  const g=fresh();g.damage(80);assert.equal(g.player.shield,0);assert.equal(g.player.hp,80);g.damage(80);assert.equal(g.player.hp,80);
  g.player.invincible=0;g.damage(100);assert.equal(g.state,'lost');g.start();assert.equal(g.player.hp,100);assert.equal(g.score,0);
}
{
  const g=fresh();assert.equal(g.boost(),true);assert.equal(g.boost(),false);assert.ok(g.player.invincible>0);
  g.hostile=[{x:g.player.x,y:g.player.y,life:1}];g.enemies=[{x:g.player.x+50,y:g.player.y,hp:120}];
  assert.equal(g.pulse(),true);assert.equal(g.hostile.length,0);assert.equal(g.enemies[0].hp,20);assert.equal(g.pulse(),false);
}
{
  const g=fresh();g.player.x=600;g.player.y=500;g.enemies=[{x:600,y:400,r:16,hp:20,maxHp:20,kind:'drone',speed:0,fire:10,phase:0}];
  g.step(.05,{fire:true,aim:{x:600,y:400}});g.step(.05,{});assert.equal(g.kills,1);assert.equal(g.score,100);assert.equal(g.pickups.length,1);
  g.pickups[0].x=g.player.x;g.pickups[0].y=g.player.y;g.step(.05,{});assert.equal(g.credits,8);assert.equal(g.pickups.length,0);
}
{
  const g=fresh();g.remaining=.01;g.step(.05,{});assert.equal(g.state,'upgrade');assert.equal(g.credits,20);
  g.credits=200;assert.equal(g.buy('weapon'),true);assert.equal(g.player.weapon,2);assert.equal(g.credits,160);
  g.player.hp=40;assert.equal(g.buy('repair'),true);assert.equal(g.player.hp,85);assert.equal(g.buy('shield'),true);assert.equal(g.player.maxShield,90);
  g.credits=0;assert.equal(g.buy('weapon'),false);g.next();assert.equal(g.sector,2);assert.equal(g.state,'quiz');finishQuiz(g);assert.equal(g.state,'playing');assert.equal(g.buy('weapon'),false);
  g.sector=4;g.state='upgrade';g.next();assert.equal(g.sector,5);assert.ok(g.enemies.some(e=>e.kind==='boss'));
  finishQuiz(g);
  g.enemies.forEach(e=>{e.hp=0;});g.step(.01,{});assert.equal(g.state,'won');assert.ok(g.score>=3500);
}
{
  const g=fresh();g.player.shield=0;g.damageAgo=5;g.step(.05);assert.ok(g.player.shield>0);g.reset();assert.equal(g.state,'ready');assert.equal(g.credits,0);
}
console.log('OK: movimento, limites, pausa, escudo, dano, reinício, propulsão, pulso, combate, coleta, oficina, progressão e vitória.');

// Perguntas fazem parte do fluxo real de início e progressão, sem recompensas repetidas.
{
  assert.equal(questions.length,16);assert.equal(new Set(questions.map(q=>q.topic)).size,16);
  for(const q of questions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.explanation.length>30);}
  const g=new Game(()=>.4);g.start();assert.equal(g.state,'quiz');assert.equal(g.quiz.questions.length,3);
  const oldX=g.player.x;g.step(.05,{dx:1,fire:true});g.damage(200);assert.equal(g.time,0);assert.equal(g.player.x,oldX);assert.equal(g.player.hp,100);assert.equal(g.bullets.length,0);
  assert.equal(g.continueQuiz(),false);assert.equal(g.answerQuestion(-1),null);assert.equal(g.answerQuestion(4),null);assert.equal(g.questionsAnswered,0);
  const index=g.quiz.questions[0].choices.findIndex(c=>c.correct);
  assert.equal(g.answerQuestion(index),true);assert.equal(g.score,100);assert.equal(g.credits,15);assert.equal(g.questionsCorrect,1);
  assert.equal(g.answerQuestion(index),null);assert.equal(g.score,100);assert.equal(g.questionsAnswered,1);
  g.continueQuiz();assert.equal(g.quiz.index,1);const wrong=g.quiz.questions[1].choices.findIndex(c=>!c.correct);
  assert.equal(g.answerQuestion(wrong),false);assert.equal(g.score,100);assert.equal(g.questionsAnswered,2);assert.equal(g.questionsCorrect,1);
  g.continueQuiz();finishQuiz(g);assert.equal(g.state,'playing');assert.equal(g.questionsAnswered,3);assert.ok(g.player.invincible>0);
  g.start();assert.equal(g.questionsAnswered,0);assert.equal(g.questionsCorrect,0);assert.equal(g.score,0);assert.equal(g.credits,0);
}
{
  const g=new Game(()=>.4);g.start();const seen=[];
  for(let sector=1;sector<=5;sector++){
    assert.equal(g.state,'quiz');assert.equal(g.quiz.questions.length,sector===5?4:3);
    while(g.state==='quiz'){
      const question=g.quiz.questions[g.quiz.index];seen.push(question.topic);
      assert.equal(question.choices.filter(c=>c.correct).length,1);
      g.answerQuestion(question.choices.findIndex(c=>c.correct));g.continueQuiz();
    }
    if(sector<5){g.state='upgrade';g.next();}
  }
  assert.equal(new Set(seen).size,16);assert.equal(g.questionsAnswered,16);assert.equal(g.questionsCorrect,16);assert.equal(g.score,1600);assert.equal(g.credits,240);assert.equal(g.state,'playing');assert.ok(g.enemies.some(e=>e.kind==='boss'));
}
console.log('OK: 16 temas únicos, questões obrigatórias por setor, pausa segura, explicações, erros sem penalidade, bônus único, reinício e calibração final.');

// O dash funciona parado, mantém uma direção estável e regenera cargas em sequência.
{
  const g=fresh();g.spawnTimer=100;g.remaining=100;
  const x=g.player.x;assert.equal(g.boost({x:1,y:0}),true);assert.equal(g.dashCharges,1);
  for(let i=0;i<4;i++)g.step(.05,{dx:-1});
  assert.ok(g.player.x>x+180,'Dash não depende de manter uma tecla e não muda de direção no meio');
  assert.equal(g.boost({x:-1,y:0}),true);assert.equal(g.dashCharges,0);assert.equal(g.boost(),false);
  for(let i=0;i<81;i++)g.step(.05);
  assert.equal(g.dashCharges,1);
  g.state='paused';const timer=g.boostCooldown;g.step(.05);assert.equal(g.boostCooldown,timer);
  g.state='playing';for(let i=0;i<81;i++)g.step(.05);assert.equal(g.dashCharges,2);
  g.start();assert.equal(g.dashCharges,2);assert.equal(g.boost(),false,'Dash bloqueado no quiz');
}
{
  const g=new Game(()=>.4);g.startQuizOnly();
  assert.equal(g.quiz.questions.length,16);assert.equal(g.quizOnly,true);
  for(let i=0;i<16;i++){
    const q=g.quiz.questions[g.quiz.index];g.answerQuestion(q.choices.findIndex(c=>c.correct));
    if(i===2)assert.equal(g.overdrive,8);
    g.continueQuiz();
  }
  assert.equal(g.state,'won');assert.equal(g.questionsCorrect,16);assert.equal(g.bestQuizStreak,16);assert.equal(g.score,1600);assert.equal(g.time,0);assert.equal(g.enemies.length,0);
  g.start();assert.equal(g.quizOnly,false);assert.equal(g.quizStreak,0);assert.equal(g.overdrive,0);
}
{
  const g=fresh();g.spawnTimer=100;g.remaining=100;
  for(let i=0;i<4;i++){g.spawn('drone');Object.assign(g.enemies.at(-1),{hp:0,x:100,y:100});}
  g.step(.01);assert.equal(g.combo,4);assert.equal(g.multiplier,2);assert.equal(g.score,500);
  g.player.invincible=0;g.damage(1);assert.equal(g.combo,0);assert.equal(g.multiplier,1);
  g.quizStreak=2;g.beginQuiz();g.answerQuestion(g.quiz.questions[0].choices.findIndex(c=>!c.correct));assert.equal(g.quizStreak,0);
}
{
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),script=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
  for(const match of script.matchAll(/\$\('#([a-z-]+)'\)/g))assert.ok(ids.includes(match[1]),`Elemento da interface ausente: ${match[1]}`);
}
console.log('OK: dash direcional e cargas, modo só quiz, overdrive, combo de combate e elementos da interface.');
