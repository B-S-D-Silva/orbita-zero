const assert = require('node:assert/strict');
const game = require('../puzzle.js');
const puzzle = game.generate();
assert.ok(puzzle.words.length >= 12);
assert.equal(new Set(puzzle.words.map(w => w.word)).size, puzzle.words.length);
const cells = new Map();
for (const word of puzzle.words) {
  assert.ok(game.terms.some(([term]) => term === word.word));
  assert.ok(word.clue.split(/\s+/).length <= 15);
  const clueTokens = word.clue.split(/\s+/).map(game.normalize);
  assert.ok(!clueTokens.includes(word.word), `Resposta na pista: ${word.word}`);
  game.coordinates(word).forEach(([r, c], i) => {
    const k = game.key(r, c), old = cells.get(k) || [];
    old.forEach(other => {
      assert.equal(other.letter, word.word[i]);
      assert.notEqual(other.word.dir, word.dir);
    });
    cells.set(k, [...old, {word, letter: word.word[i]}]);
  });
}
const seen = new Set([puzzle.words[0].id]);
for (let i = 0; i < puzzle.words.length; i++) for (const shared of cells.values()) {
  if (shared.some(x => seen.has(x.word.id))) shared.forEach(x => seen.add(x.word.id));
}
assert.equal(seen.size, puzzle.words.length, 'Todas as palavras devem estar conectadas');
for (const word of puzzle.words) {
  assert.ok(game.coordinates(word).some(([r, c]) => cells.get(game.key(r, c)).length === 2), `${word.word} precisa cruzar`);
}
assert.equal(game.evaluate(puzzle.words, () => '').filter(x => x.correct).length, 0);
const answer = (r, c) => cells.get(game.key(r, c))?.[0].letter || '';
assert.equal(game.evaluate(puzzle.words, answer).filter(x => x.correct).length, puzzle.words.length);
const first = puzzle.words[0];
assert.equal(game.evaluate(puzzle.words, (r, c) => r === first.r && c === first.c ? '!' : answer(r, c))[first.id].correct, false);
assert.equal(game.normalize('á ç 1'), 'AC');
console.log(`OK: ${puzzle.words.length} palavras, tabuleiro ${puzzle.rows} × ${puzzle.cols}, cruzamentos e avaliação válidos.`);
