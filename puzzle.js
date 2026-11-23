/* Dados e montagem independentes da interface, também verificáveis com Node. */
const Crossword = (() => {
  const terms = [
    ['CPU', 'Processador principal responsável por buscar, interpretar e executar instruções.'],
    ['ULA', 'Circuito do processador que realiza cálculos e comparações lógicas.'],
    ['UC', 'Circuito que decodifica instruções e emite sinais para coordenar sua execução.'],
    ['REGISTRADORES', 'Pequenos espaços internos do processador que guardam operandos e resultados imediatos.'],
    ['RAM', 'Memória principal de trabalho que perde seu conteúdo ao desligar.'],
    ['ROM', 'Memória tradicionalmente gravada na fabricação, destinada apenas à leitura durante o uso.'],
    ['EEPROM', 'Memória persistente regravável eletricamente, com apagamento individual de bytes.'],
    ['FLASH', 'Memória persistente apagada em blocos, comum em pendrives e cartões.'],
    ['CACHE', 'Memória rápida entre processador e memória principal que reduz esperas por dados frequentes.'],
    ['MEMORIADEMASSA', 'Categoria de armazenamento de grande capacidade que conserva arquivos sem energia.'],
    ['DMA', 'Mecanismo que transfere dados entre periféricos e memória sem intervenção contínua do processador.'],
    ['ADDRESSBUS', 'Linhas que indicam qual posição de memória ou dispositivo será acessada.'],
    ['DATABUS', 'Linhas que transportam os valores transferidos entre processador, memória e periféricos.'],
    ['MICROCONTROLADOR', 'Chip que integra processador, memória e periféricos para controlar sistemas embarcados.'],
    ['DUALCORE', 'Processador com exatamente dois núcleos físicos de execução.'],
    ['QUADCORE', 'Processador com exatamente quatro núcleos físicos de execução.']
  ];
  const key = (r, c) => `${r},${c}`;
  const coordinates = p => Array.from(p.word, (_, i) => [p.r + (p.dir === 'D' ? i : 0), p.c + (p.dir === 'A' ? i : 0)]);

  function generate() {
    let seed = 42;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    let best = [];
    for (let attempt = 0; attempt < 200; attempt++) {
      const grid = new Map();
      const placed = [];
      function insert(p) {
        placed.push(p);
        coordinates(p).forEach(([r, c], i) => {
          const old = grid.get(key(r, c));
          grid.set(key(r, c), { letter: p.word[i], dirs: [...(old?.dirs || []), p.dir] });
        });
      }
      function fits(p) {
        const dr = p.dir === 'D' ? 1 : 0, dc = 1 - dr;
        if (grid.has(key(p.r - dr, p.c - dc)) || grid.has(key(p.r + dr * p.word.length, p.c + dc * p.word.length))) return false;
        return coordinates(p).every(([r, c], i) => {
          const old = grid.get(key(r, c));
          if (old) return old.letter === p.word[i] && !old.dirs.includes(p.dir);
          return !grid.has(key(r + dc, c + dr)) && !grid.has(key(r - dc, c - dr));
        });
      }
      const ordered = terms.map(([word, clue]) => ({word, clue, weight: word.length + random() * 8})).sort((a, b) => b.weight - a.weight);
      insert({...ordered.shift(), r: 0, c: 0, dir: 'A'});
      for (const term of ordered) {
        const candidates = [];
        for (const [position, cell] of grid) {
          const [r, c] = position.split(',').map(Number);
          for (const dir of ['A', 'D']) for (let i = 0; i < term.word.length; i++) {
            if (term.word[i] !== cell.letter) continue;
            const p = {...term, dir, r: r - (dir === 'D' ? i : 0), c: c - (dir === 'A' ? i : 0)};
            if (!fits(p)) continue;
            const all = [...grid.keys()].map(k => k.split(',').map(Number)).concat(coordinates(p));
            const height = Math.max(...all.map(x => x[0])) - Math.min(...all.map(x => x[0])) + 1;
            const width = Math.max(...all.map(x => x[1])) - Math.min(...all.map(x => x[1])) + 1;
            candidates.push({...p, area: width * height + random() * 20});
          }
        }
        candidates.sort((a, b) => a.area - b.area);
        if (candidates.length) insert(candidates[0]);
      }
      if (placed.length > best.length) best = placed;
      if (best.length === terms.length) break;
    }
    if (best.length < 12) throw new Error('Não foi possível montar um tabuleiro válido.');
    const points = best.flatMap(coordinates);
    const minR = Math.min(...points.map(x => x[0])), minC = Math.min(...points.map(x => x[1]));
    best.forEach(p => { p.r -= minR; p.c -= minC; });
    best.sort((a, b) => a.r - b.r || a.c - b.c);
    let number = 0, last = '';
    best.forEach((p, id) => { if (key(p.r, p.c) !== last) number++; last = key(p.r, p.c); p.number = number; p.id = id; });
    return { words: best, rows: Math.max(...best.flatMap(coordinates).map(x => x[0])) + 1, cols: Math.max(...best.flatMap(coordinates).map(x => x[1])) + 1 };
  }
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
  const evaluate = (words, read) => words.map(p => ({id: p.id, correct: coordinates(p).map(([r, c]) => read(r, c)).join('') === p.word}));
  return { terms, key, coordinates, generate, normalize, evaluate };
})();
if (typeof module !== 'undefined') module.exports = Crossword;
