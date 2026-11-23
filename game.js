/* Simulação independente do desenho e do navegador. Coordenadas em um mundo 1200 × 760. */
const SpaceGame = (() => {
  const W=1200,H=760, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const sectorNames=['Cinturão exterior','Ecos da estação','Zona de interferência','Fronteira vermelha','O Guardião'];
  class Game {
    constructor(random=Math.random){this.random=random;this.reset();}
    reset(){
      this.player={x:W/2,y:H*.65,r:16,hp:100,shield:60,maxShield:60,weapon:1,shieldLevel:1,angle:-Math.PI/2,invincible:0};
      this.enemies=[];this.bullets=[];this.hostile=[];this.rocks=[];this.pickups=[];this.effects=[];
      this.score=0;this.credits=0;this.kills=0;this.time=0;this.sector=1;this.remaining=25;this.spawnTimer=1;
      this.cooldown=0;this.boostCooldown=0;this.pulseCooldown=0;this.boostTime=0;this.damageAgo=10;this.state='ready';this.events=[];
    }
    emit(type,data={}){this.events.push({type,...data});}
    start(){this.reset();this.state='playing';this.makeRocks();this.emit('sector');}
    makeRocks(){for(let i=0;i<5;i++)this.rocks.push({x:60+this.random()*(W-120),y:40+this.random()*230,r:20+this.random()*22,hp:65,vx:(this.random()-.5)*24,vy:10+this.random()*12,angle:this.random()*6,spin:(this.random()-.5)*.3});}
    next(){if(this.state!=='upgrade')return;this.sector++;this.remaining=25+this.sector*3;this.spawnTimer=1;this.hostile=[];this.bullets=[];this.pickups=[];this.rocks=[];this.makeRocks();this.player.invincible=2;this.state='playing';if(this.sector===5)this.spawn('boss');this.emit('sector');}
    spawn(kind){
      const edge=Math.floor(this.random()*3),x=edge===0?-35:edge===1?W+35:80+this.random()*(W-160),y=edge===2?-35:this.random()*H*.6;
      const boss=kind==='boss', heavy=kind==='heavy';
      this.enemies.push({x:boss?W/2:x,y:boss?110:y,r:boss?65:heavy?26:kind==='shooter'?19:16,hp:boss?1400:heavy?100:kind==='shooter'?60:35,maxHp:boss?1400:heavy?100:kind==='shooter'?60:35,kind,speed:boss?30:heavy?48:kind==='shooter'?65:85+this.sector*9,fire:boss?1.5:2+this.random()*2,phase:this.random()*6});
    }
    boost(){if(this.state!=='playing'||this.boostCooldown>0)return false;this.boostCooldown=5;this.boostTime=.38;this.player.invincible=.6;this.emit('boost');return true;}
    pulse(){if(this.state!=='playing'||this.pulseCooldown>0)return false;this.pulseCooldown=12;const p=this.player;this.hostile=this.hostile.filter(b=>distance(b,p)>230);for(const e of this.enemies)if(distance(e,p)<230)e.hp-=100;this.effects.push({x:p.x,y:p.y,r:230,life:.55,max:.55,type:'pulse'});this.emit('pulse');return true;}
    buy(type){
      if(this.state!=='upgrade')return false;const p=this.player;
      if(type==='weapon'&&p.weapon<4){const cost=40*p.weapon;if(this.credits<cost)return false;this.credits-=cost;p.weapon++;}
      else if(type==='shield'&&p.shieldLevel<3){const cost=35*p.shieldLevel;if(this.credits<cost)return false;this.credits-=cost;p.shieldLevel++;p.maxShield+=30;p.shield=p.maxShield;}
      else if(type==='repair'&&p.hp<100){if(this.credits<30)return false;this.credits-=30;p.hp=Math.min(100,p.hp+45);}
      else return false;this.emit('upgrade',{item:type});return true;
    }
    damage(amount){const p=this.player;if(p.invincible>0||this.state!=='playing')return;const absorbed=Math.min(p.shield,amount);p.shield-=absorbed;p.hp=Math.max(0,p.hp-(amount-absorbed));p.invincible=.65;this.damageAgo=0;this.emit('damage');if(p.hp<=0){this.state='lost';this.emit('lost');}}
    burst(x,y,color='#83e5ff',count=15){for(let i=0;i<count;i++){const angle=this.random()*Math.PI*2,speed=35+this.random()*160;this.effects.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:1+this.random()*3,color,life:.3+this.random()*.6,max:.9,type:'spark'});}}
    step(dt,input={}){
      if(this.state!=='playing')return;dt=clamp(dt,0,.05);this.time+=dt;this.remaining=Math.max(0,this.remaining-dt);this.damageAgo+=dt;
      this.cooldown-=dt;this.boostCooldown=Math.max(0,this.boostCooldown-dt);this.pulseCooldown=Math.max(0,this.pulseCooldown-dt);this.boostTime=Math.max(0,this.boostTime-dt);
      const p=this.player;p.invincible=Math.max(0,p.invincible-dt);if(this.damageAgo>4)p.shield=Math.min(p.maxShield,p.shield+10*dt);
      let dx=input.dx||0,dy=input.dy||0;if(input.target){dx=input.target.x-p.x;dy=input.target.y-p.y;const len=Math.hypot(dx,dy);if(len<8){dx=0;dy=0;}else{dx/=Math.max(60,len);dy/=Math.max(60,len);}}
      const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}const speed=this.boostTime>0?850:255;p.x=clamp(p.x+dx*speed*dt,25,W-25);p.y=clamp(p.y+dy*speed*dt,25,H-25);
      let aim=input.aim;if(input.autoAim){let nearest=null;for(const e of this.enemies)if(!nearest||distance(e,p)<distance(nearest,p))nearest=e;aim=nearest||{x:p.x,y:p.y-300};}if(aim)p.angle=Math.atan2(aim.y-p.y,aim.x-p.x);
      if(input.fire&&this.cooldown<=0){this.cooldown=.23-p.weapon*.025;const spreads=p.weapon>=3?[-.12,0,.12]:[0];for(const spread of spreads){const angle=p.angle+spread;this.bullets.push({x:p.x+Math.cos(angle)*23,y:p.y+Math.sin(angle)*23,vx:Math.cos(angle)*720,vy:Math.sin(angle)*720,r:4,life:1.8,damage:20+p.weapon*7});}this.emit('shot');}
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
      this.enemies=this.enemies.filter(e=>{if(e.hp>0)return true;this.kills++;const reward=e.kind==='boss'?1500:e.kind==='heavy'?150:100;this.score+=reward;this.burst(e.x,e.y,e.kind==='boss'?'#f1ad70':'#b193ff',e.kind==='boss'?80:20);this.pickups.push({x:e.x,y:e.y,r:8,value:e.kind==='boss'?100:8,life:14});if(e.kind==='boss')bossDead=true;this.emit('kill');return false;});
      this.rocks=this.rocks.filter(e=>{if(e.hp>0)return true;this.burst(e.x,e.y,'#a5a7b5');this.score+=25;this.pickups.push({x:e.x,y:e.y,r:7,value:5,life:14});return false;});
      for(const pickup of this.pickups){pickup.life-=dt;const d=distance(pickup,p);if(d<130){const a=Math.atan2(p.y-pickup.y,p.x-pickup.x);pickup.x+=Math.cos(a)*300*dt;pickup.y+=Math.sin(a)*300*dt;}if(d<25){this.credits+=pickup.value;this.score+=pickup.value*2;pickup.life=0;this.emit('pickup');}}
      this.pickups=this.pickups.filter(e=>e.life>0);this.bullets=this.bullets.filter(b=>b.life>0);this.hostile=this.hostile.filter(b=>b.life>0&&b.x>-100&&b.x<W+100&&b.y>-100&&b.y<H+100);
      for(const e of this.effects){e.life-=dt;if(e.vx){e.x+=e.vx*dt;e.y+=e.vy*dt;}}this.effects=this.effects.filter(e=>e.life>0);
      if(this.state!=='playing')return;
      if(bossDead){this.state='won';this.score+=2000;this.emit('won');}
      else if(this.remaining<=0&&this.enemies.length===0&&this.sector<5){this.credits+=20;this.score+=250;this.state='upgrade';this.emit('sector-clear');}
    }
  }
  return {Game,W,H,sectorNames};
})();
if(typeof module!=='undefined')module.exports=SpaceGame;
