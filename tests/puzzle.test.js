const assert = require('node:assert/strict');
const game = require('../puzzle.js');
const puzzle = game.generate();
assert.equal(puzzle.words.length,16);
const cells = new Map();
for (const word of puzzle.words) {
  assert.ok(game.terms.some(([term]) => term === word.word));
  assert.ok(word.clue.split(/\s+/).length <= 15);
  assert.ok(!word.clue.split(/\s+/).map(game.normalize).includes(word.word));
  game.coordinates(word).forEach(([r,c],i) => {
    const k=game.key(r,c), old=cells.get(k)||[];
    old.forEach(other => { assert.equal(other.letter,word.word[i]);assert.notEqual(other.word.dir,word.dir); });
    cells.set(k,[...old,{word,letter:word.word[i]}]);
  });
}
const connected = new Set([puzzle.words[0].id]);
for(let i=0;i<puzzle.words.length;i++) for(const shared of cells.values()) {
  if(shared.some(x=>connected.has(x.word.id))) shared.forEach(x=>connected.add(x.word.id));
}
assert.equal(connected.size,16);
for(const word of puzzle.words) assert.ok(game.coordinates(word).some(([r,c])=>cells.get(game.key(r,c)).length===2));
const answer=(r,c)=>cells.get(game.key(r,c))?.[0].letter||'';
assert.equal(game.evaluate(puzzle.words,()=> '').filter(x=>x.correct).length,0);
assert.equal(game.evaluate(puzzle.words,answer).filter(x=>x.correct).length,16);
assert.equal(game.normalize('á ç 1'),'AC');
console.log(`OK: 16 palavras conectadas; matriz ${puzzle.rows} × ${puzzle.cols}; pistas, cruzamentos e avaliação.`);
