/* Missão NEXUS: estado, renderização e interação sem dependências. */
(() => {
  const $ = selector => document.querySelector(selector);
  const {words, rows, cols} = Crossword.generate();
  const storageKey = 'nexus-recovery-v1';
  const sectors = [
    {name:'Processamento', icon:'⌘', terms:['CPU','ULA','UC','REGISTRADORES']},
    {name:'Memória', icon:'▤', terms:['RAM','ROM','EEPROM','FLASH','CACHE','MEMORIADEMASSA']},
    {name:'Transferência', icon:'⇄', terms:['DMA','ADDRESSBUS','DATABUS']},
    {name:'Integração', icon:'◈', terms:['MICROCONTROLADOR','DUALCORE','QUADCORE']}
  ];
  const inputs = new Map(), squares = new Map(), memberships = new Map(), clues = new Map();
  const revealed = new Set();
  let active = words[0], solved = new Set(), hints = 3, elapsed = 0, checked = false;
  let completeShown = false, zoom = 100, events = [], saveAvailable = true;
  const sectorOf = word => sectors.findIndex(sector => sector.terms.includes(word.word));
  const read = (r,c) => inputs.get(Crossword.key(r,c))?.value || '';
  const time = () => `${String(Math.floor(elapsed / 60)).padStart(2,'0')}:${String(elapsed % 60).padStart(2,'0')}`;
  const points = () => solved.size * 100 - (3 - hints) * 50;
  const say = text => { $('#feedback').textContent = text; };

  function log(message) {
    events.push({time:time(), message});
    events = events.slice(-25);
    $('#event-log').replaceChildren(...events.slice(-3).map(event => {
      const li = document.createElement('li'), stamp = document.createElement('span');
      stamp.textContent = `[${event.time}]`; li.append(stamp, document.createTextNode(event.message)); return li;
    }));
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({version:1, values:Object.fromEntries([...inputs].map(([k,el]) => [k,el.value])), solved:[...solved], hints, elapsed, revealed:[...revealed], checked}));
    } catch { saveAvailable = false; }
  }
  function load() {
    try {
      const state = JSON.parse(localStorage.getItem(storageKey));
      if (!state || state.version !== 1) return;
      for (const [k, value] of Object.entries(state.values || {})) {
        if (inputs.has(k) && typeof value === 'string') inputs.get(k).value = Crossword.normalize(value).slice(0,1);
      }
      hints = Number.isInteger(state.hints) ? Math.max(0,Math.min(3,state.hints)) : 3;
      elapsed = Number.isFinite(state.elapsed) ? Math.max(0,Math.floor(state.elapsed)) : 0;
      checked = state.checked === true;
      const results = Crossword.evaluate(words, read);
      solved = new Set((state.solved || []).filter(id => results[id]?.correct));
      for (const k of state.revealed || []) if (inputs.has(k)) revealed.add(k);
      completeShown = solved.size === words.length;
      log('Sessão anterior recuperada. Continue de onde parou.');
    } catch { saveAvailable = false; }
  }

  function selectWord(word, focus = true) {
    active = word;
    squares.forEach(square => square.classList.remove('selected'));
    Crossword.coordinates(word).forEach(([r,c]) => squares.get(Crossword.key(r,c)).classList.add('selected'));
    clues.forEach((button,id) => button.setAttribute('aria-pressed', String(id === word.id)));
    $('#active-number').textContent = String(word.number).padStart(2,'0');
    $('#active-direction').textContent = `${word.dir === 'A' ? 'HORIZONTAL' : 'VERTICAL'} / ${sectors[sectorOf(word)].name.toUpperCase()}`;
    $('#active-clue').textContent = word.clue;
    updateLetterProgress();
    if (focus) {
      const point = Crossword.coordinates(word).find(([r,c]) => !read(r,c)) || [word.r,word.c];
      inputs.get(Crossword.key(...point)).focus({preventScroll:true});
      squares.get(Crossword.key(...point)).scrollIntoView({block:'nearest',inline:'nearest'});
    }
  }
  function updateLetterProgress() {
    const count = Crossword.coordinates(active).filter(([r,c]) => read(r,c)).length;
    $('#letter-progress').textContent = `${count} / ${active.word.length} letras preenchidas${solved.has(active.id) ? ' · CONEXÃO VALIDADA' : ''}`;
  }
  function move(r,c,step) {
    const points = Crossword.coordinates(active);
    const index = points.findIndex(p => p[0] === r && p[1] === c);
    const next = points[index + step];
    if (next) inputs.get(Crossword.key(...next)).focus();
  }

  function refresh() {
    const results = Crossword.evaluate(words, read);
    // Alterar uma resposta validada retira seu estado e seus pontos até a próxima conferência.
    solved.forEach(id => { if (!results[id].correct) solved.delete(id); });
    $('#score').textContent = `${solved.size} de ${words.length} palavras`;
    $('#percent').textContent = `${Math.round(solved.size / words.length * 100)}%`;
    $('#overall-bar').style.width = `${solved.size / words.length * 100}%`;
    $('#points').textContent = `${points() < 0 ? '−' : ''}${String(Math.abs(points())).padStart(4,'0')}`;
    $('#hint-count').textContent = `${hints} / 3`;
    $('#hint-button').disabled = hints === 0 || solved.size === words.length;
    let online = 0;
    sectors.forEach((sector,index) => {
      const group = words.filter(word => sectorOf(word) === index);
      const count = group.filter(word => solved.has(word.id)).length;
      const node = $(`#sector-${index}`), ready = count === group.length;
      if (ready) online++;
      node.classList.toggle('online',ready);
      node.querySelector('small').textContent = `${count}/${group.length}`;
      node.querySelector('.sector-track span').style.width = `${count/group.length*100}%`;
      node.querySelector('.sector-status').textContent = ready ? '● ONLINE' : count ? '◌ RECUPERANDO' : '○ AGUARDANDO SINAL';
    });
    $('#sector-count').textContent = `${online} / 4`;
    $('#core-status').textContent = online === 4 ? 'ONLINE' : online ? 'BOOTING' : 'OFFLINE';
    $('#mission-status').textContent = solved.size === words.length ? '● SISTEMA OPERACIONAL' : '● RECUPERAÇÃO EM ANDAMENTO';
    const earned = [solved.size > 0,online > 0,solved.size === words.length];
    [...$('#achievements').children].forEach((el,i) => {
      const labels = ['Primeiro sinal','Subsistema online','Recuperação total'];
      el.textContent = `${earned[i] ? '✓' : '○'} ${labels[i]}`; el.classList.toggle('earned',earned[i]);
    });
    results.forEach(result => {
      const button = clues.get(result.id), correct = solved.has(result.id);
      button.classList.toggle('correct',correct); button.classList.toggle('incorrect',checked && !correct);
      button.querySelector('.result').textContent = correct ? '✓ Certa · conexão restaurada' : checked ? '× Errada ou incompleta' : '';
    });
    squares.forEach((square,k) => {
      const correct = memberships.get(k).some(word => solved.has(word.id));
      square.classList.toggle('right',correct);
      square.classList.toggle('wrong',checked && !correct && Boolean(inputs.get(k).value));
      square.classList.toggle('hinted',revealed.has(k));
    });
    updateLetterProgress();
  }

  function check() {
    const before = solved.size;
    const priorOnline = sectors.map((_,index) => words.filter(w => sectorOf(w) === index).every(w => solved.has(w.id)));
    solved = new Set(Crossword.evaluate(words,read).filter(r => r.correct).map(r => r.id));
    checked = true; refresh();
    const gain = solved.size - before;
    log(gain > 0 ? `+${gain * 100} pontos / ${gain} nova(s) conexão(ões) restaurada(s).` : 'Diagnóstico executado. Revise as conexões pendentes.');
    sectors.forEach((sector,index) => {
      if (!priorOnline[index] && words.filter(w => sectorOf(w) === index).every(w => solved.has(w.id))) log(`Subsistema ${sector.name.toUpperCase()} está online.`);
    });
    say(`${solved.size} palavras certas; ${words.length - solved.size} erradas ou incompletas. ${gain > 0 ? `+${gain*100} pontos nesta conferência.` : 'Revise os diagnósticos e tente novamente.'}`);
    if (solved.size === words.length && !completeShown) {
      completeShown = true; log('BOOT COMPLETO. Todos os subsistemas operacionais.');
      $('#final-stats').replaceChildren(...[[points(),'PONTOS'],[time(),'TEMPO'],[3-hints,'SONDAS USADAS']].map(([value,label]) => {
        const div = document.createElement('div'), b = document.createElement('b'); b.textContent = value; div.append(b,label); return div;
      }));
      $('#complete-dialog').showModal(); say('Missão concluída. NEXUS restaurado com sucesso.');
    }
    save();
  }
  function hint() {
    if (!hints) return;
    const point = Crossword.coordinates(active).find(([r,c],i) => read(r,c) !== active.word[i]);
    if (!point) { say('Esta palavra já está preenchida corretamente. Confira ou selecione outro diagnóstico.'); return; }
    const index = Crossword.coordinates(active).findIndex(p => p[0] === point[0] && p[1] === point[1]);
    inputs.get(Crossword.key(...point)).value = active.word[index];
    revealed.add(Crossword.key(...point)); hints--;
    refresh(); save();
    log(`Sonda aplicada ao diagnóstico ${active.number}. Uma letra recuperada. −50 pontos.`);
    say('Uma letra foi revelada na palavra selecionada. Use Conferir para validar a conexão.');
    inputs.get(Crossword.key(...point)).focus();
  }
  function render() {
    words.forEach(word => Crossword.coordinates(word).forEach(([r,c]) => {
      const k = Crossword.key(r,c); memberships.set(k,[...(memberships.get(k)||[]),word]);
    }));
    $('#board').style.setProperty('--cols',cols);
    $('#matrix-size').textContent = `MATRIZ ${rows} × ${cols} / ${words.length} CONEXÕES`;
    $('#clue-total').textContent = words.length;
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
      const k = Crossword.key(r,c), related = memberships.get(k), square = document.createElement('div');
      square.className = related ? 'square' : 'blank';
      if (!related) { square.setAttribute('aria-hidden','true'); $('#board').append(square); continue; }
      const start = related.find(w => w.r === r && w.c === c);
      if (start) { const number = document.createElement('span'); number.className = 'cell-number'; number.textContent = start.number; square.append(number); }
      const input = document.createElement('input'); input.className = 'cell'; input.maxLength = 1; input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('autocapitalize','characters'); input.setAttribute('aria-label',`Linha ${r+1}, coluna ${c+1}. Pistas ${related.map(w=>w.number).join(' e ')}.`);
      input.addEventListener('focus',() => { if (!related.includes(active)) selectWord(related[0],false); input.select(); });
      input.addEventListener('input',() => { input.value = Crossword.normalize(input.value).slice(0,1); refresh(); save(); if (input.value) move(r,c,1); });
      input.addEventListener('keydown',event => {
        const offsets = {ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
        if (offsets[event.key]) {
          event.preventDefault(); const [dr,dc] = offsets[event.key];
          selectWord(related.find(w=>w.dir === (dr?'D':'A')) || active,false);
          inputs.get(Crossword.key(r+dr,c+dc))?.focus();
        } else if (event.key === 'Enter') { event.preventDefault(); selectWord(related.find(w=>w.id !== active.id) || active,false); }
        else if (event.key === 'Backspace' && !input.value) { event.preventDefault(); move(r,c,-1); }
      });
      square.append(input); $('#board').append(square); inputs.set(k,input); squares.set(k,square);
    }
    words.forEach(word => {
      const li=document.createElement('li'),button=document.createElement('button'); button.type='button';button.className='clue'; li.dataset.sector = sectorOf(word);
      const num=document.createElement('span');num.className='clue-number';num.textContent=String(word.number).padStart(2,'0');
      const text=document.createElement('span');text.textContent=word.clue;
      const size=document.createElement('small');size.textContent=`${word.word.length} LETRAS · ${sectors[sectorOf(word)].name.toUpperCase()}`;
      const result=document.createElement('span');result.className='result';text.append(size,result);button.append(num,text);button.addEventListener('click',()=>selectWord(word));
      clues.set(word.id,button);li.append(button);$(word.dir==='A'?'#across-clues':'#down-clues').append(li);
    });
    $('#across-count').textContent=words.filter(w=>w.dir==='A').length;
    $('#down-count').textContent=words.filter(w=>w.dir==='D').length;
    sectors.forEach((sector,index) => {
      const el=document.createElement('button');el.type='button';el.className='sector';el.id=`sector-${index}`;
      el.innerHTML=`<span class="sector-top"><span class="sector-icon">${sector.icon}</span><b>${sector.name}</b><small></small></span><span class="sector-track" style="display:block"><span></span></span><span class="sector-status"></span>`;
      el.addEventListener('click',()=> { $('#sector-filter').value=String(index); filter(); selectWord(words.find(w=>sectorOf(w)===index && !solved.has(w.id)) || words.find(w=>sectorOf(w)===index)); });
      $('#sectors').append(el);
    });
  }
  function filter() {
    const value=$('#sector-filter').value; let visible=0;
    document.querySelectorAll('.clue-lists li').forEach(li=> { li.hidden=value!=='all' && li.dataset.sector!==value;if(!li.hidden)visible++; });
    $('#filter-empty').hidden=visible>0;
  }
  $('#check-button').addEventListener('click',check);
  $('#hint-button').addEventListener('click',hint);
  $('#sector-filter').addEventListener('change',filter);
  $('#reset-button').addEventListener('click',()=> {
    inputs.forEach(input=>{input.value='';});solved.clear();revealed.clear();hints=3;elapsed=0;checked=false;completeShown=false;events=[];
    $('#sector-filter').value='all';filter();refresh();selectWord(words[0],false);save();$('#timer').textContent=time();
    log('Nova operação iniciada. Aguardando conexões.');say('Missão reiniciada. Todas as casas e resultados foram limpos.');
  });
  function setZoom(step) { zoom=Math.max(80,Math.min(150,zoom+step));$('#board').style.setProperty('--cell',`${30*zoom/100}px`);$('#zoom-label').textContent=`${zoom}%`; }
  $('#zoom-out').addEventListener('click',()=>setZoom(-10));$('#zoom-in').addEventListener('click',()=>setZoom(10));
  $('#help').addEventListener('click',()=>$('#help-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  render();load();refresh();selectWord(words[0],false);$('#timer').textContent=time();
  if(!events.length)log('Falha geral detectada. Protocolo NEXUS iniciado.');
  if(!saveAvailable)say('Armazenamento indisponível. A missão funciona, mas não será salva ao fechar a página.');
  setInterval(()=> {if(solved.size<words.length && !document.hidden){elapsed++;$('#timer').textContent=time();if(elapsed%10===0)save();}},1000);
  window.addEventListener('pagehide',save);
})();
