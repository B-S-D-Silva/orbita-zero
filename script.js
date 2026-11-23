/* Interface: as casas são indexadas por coordenada, inclusive nos cruzamentos. */
(() => {
  const puzzle = Crossword.generate();
  const {words, rows, cols} = puzzle;
  const inputs = new Map(), squares = new Map(), clueButtons = new Map();
  const board = document.querySelector('#board');
  let active = words[0], hasChecked = false;
  const read = (r, c) => inputs.get(Crossword.key(r, c))?.value || '';
  const memberships = new Map();
  words.forEach(word => Crossword.coordinates(word).forEach(([r, c]) => {
    const k = Crossword.key(r, c);
    memberships.set(k, [...(memberships.get(k) || []), word]);
  }));

  function selectWord(word, focus = true) {
    active = word;
    squares.forEach(square => square.classList.remove('selected'));
    Crossword.coordinates(word).forEach(([r, c]) => squares.get(Crossword.key(r, c)).classList.add('selected'));
    clueButtons.forEach((button, id) => button.setAttribute('aria-pressed', String(id === word.id)));
    document.querySelector('#active-clue').textContent = `${word.number} ${word.dir === 'A' ? 'horizontal' : 'vertical'} · ${word.clue}`;
    if (focus) inputs.get(Crossword.key(word.r, word.c)).focus();
  }

  function moveInWord(r, c, step) {
    const points = Crossword.coordinates(active);
    const index = points.findIndex(point => point[0] === r && point[1] === c);
    const next = points[index + step];
    if (next) inputs.get(Crossword.key(...next)).focus();
  }

  function refresh() {
    const results = Crossword.evaluate(words, read);
    const count = results.filter(result => result.correct).length;
    document.querySelector('#score').textContent = `${count} de ${words.length} palavras`;
    const progress = document.querySelector('#progress');
    progress.max = words.length;
    progress.value = count;
    document.querySelector('#rank').textContent = count === words.length ? '♚ Xeque-mate!' : count >= words.length / 2 ? '♕ Estrategista' : '♙ Peão curioso';
    results.forEach(result => {
      const button = clueButtons.get(result.id);
      button.classList.toggle('correct', hasChecked && result.correct);
      button.classList.toggle('incorrect', hasChecked && !result.correct);
      button.querySelector('.result').textContent = hasChecked ? (result.correct ? '✓ Certa' : '× Errada ou incompleta') : '';
    });
    squares.forEach((square, k) => {
      const related = memberships.get(k);
      // Uma letra correta não fica vermelha por pertencer também a outra palavra incompleta.
      const correctWord = related.some(word => results[word.id].correct);
      square.classList.toggle('right', hasChecked && correctWord);
      square.classList.toggle('wrong', hasChecked && !correctWord);
    });
    if (hasChecked) document.querySelector('#feedback').textContent = count === words.length
      ? 'Xeque-mate! Você dominou a arquitetura.'
      : `${count} certas; ${words.length - count} erradas ou incompletas. Revise as pistas marcadas.`;
  }

  function renderBoard() {
    board.style.setProperty('--cols', cols);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const k = Crossword.key(r, c), related = memberships.get(k);
      const square = document.createElement('div');
      square.className = related ? 'square' : `blank ${(r + c) % 2 ? 'dark' : ''}`;
      if (!related) { square.setAttribute('aria-hidden', 'true'); board.append(square); continue; }
      const start = related.find(word => word.r === r && word.c === c);
      if (start) {
        const label = document.createElement('span');
        label.className = 'cell-number'; label.textContent = start.number;
        square.append(label);
      }
      const input = document.createElement('input');
      input.className = 'cell'; input.maxLength = 1;
      input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('autocapitalize', 'characters');
      input.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}. Pista${related.length > 1 ? 's' : ''} ${related.map(w => w.number).join(' e ')}.`);
      input.addEventListener('focus', () => {
        if (!related.includes(active)) selectWord(related[0], false);
        input.select();
      });
      input.addEventListener('input', () => {
        input.value = Crossword.normalize(input.value).slice(0, 1);
        refresh();
        if (input.value) moveInWord(r, c, 1);
      });
      input.addEventListener('keydown', event => {
        const offsets = {ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0]};
        if (offsets[event.key]) {
          event.preventDefault();
          const [dr, dc] = offsets[event.key];
          const direction = dr ? 'D' : 'A';
          selectWord(related.find(w => w.dir === direction) || active, false);
          inputs.get(Crossword.key(r + dr, c + dc))?.focus();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          selectWord(related.find(w => w.id !== active.id) || active, false);
        } else if (event.key === 'Backspace' && !input.value) {
          event.preventDefault(); moveInWord(r, c, -1);
        }
      });
      square.append(input); board.append(square);
      inputs.set(k, input); squares.set(k, square);
    }
  }

  function renderClues() {
    words.forEach(word => {
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.className = 'clue';
      const number = document.createElement('span'); number.className = 'clue-number'; number.textContent = word.number;
      const text = document.createElement('span'); text.textContent = word.clue;
      const size = document.createElement('small'); size.textContent = ` (${word.word.length} letras)`;
      const result = document.createElement('span'); result.className = 'result';
      text.append(size, result); button.append(number, text);
      button.addEventListener('click', () => selectWord(word));
      clueButtons.set(word.id, button); li.append(button);
      document.querySelector(word.dir === 'A' ? '#across-clues' : '#down-clues').append(li);
    });
  }

  document.querySelector('#check-button').addEventListener('click', () => { hasChecked = true; refresh(); });
  document.querySelector('#reset-button').addEventListener('click', () => {
    hasChecked = false; inputs.forEach(input => { input.value = ''; }); refresh();
    document.querySelector('#feedback').textContent = 'Tabuleiro limpo. Uma nova estratégia começa agora.';
    selectWord(words[0]);
  });
  renderBoard(); renderClues(); refresh(); selectWord(words[0], false);
})();
