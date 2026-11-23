// Integração sem dependências: DOM mínimo para executar os controles reais da missão.
// Não substitui revisão de layout em um navegador.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const Crossword = require('../puzzle.js');
class Element {
  constructor(tag='div') {
    this.tag=tag;this.children=[];this.attrs={};this.style={setProperty(){}};this.value='';this.dataset={};this.events={};this.hidden=false;
    this.classList={toggle:(name,force)=>{const classes=new Set(this.className.split(' ').filter(Boolean));const add=force===undefined?!classes.has(name):force;add?classes.add(name):classes.delete(name);this.className=[...classes].join(' ');},remove:name=>this.classList.toggle(name,false),add:name=>this.classList.toggle(name,true)};
    this.className='';this.textContent='';
  }
  append(...nodes){this.children.push(...nodes.filter(x=>x instanceof Element));}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  setAttribute(name,value){this.attrs[name]=value;if(name==='id')this.id=value;if(name==='class')this.className=value;if(name.startsWith('data-'))this.dataset[name.slice(5)]=value;}
  addEventListener(name,callback){(this.events[name]??=[]).push(callback);}
  fire(name){for(const cb of this.events[name]||[])cb({preventDefault(){}});}
  click(){if(!this.disabled)this.fire('click');}
  focus(){this.fire('focus');} select(){} scrollIntoView(){} showModal(){this.open=true;} close(){this.open=false;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  querySelectorAll(selector){
    const parts=selector.split(' ');let scope=[this];
    for(const part of parts){const found=[];const walk=node=>{for(const child of node.children){if(matches(child,part))found.push(child);walk(child);}};scope.forEach(walk);scope=found;}return scope;
  }
  set innerHTML(html){this.children=[];parse(html,this);}
}
function matches(node,selector){
  if(selector.startsWith('#'))return node.id===selector.slice(1);
  if(selector.startsWith('.'))return node.className.split(' ').includes(selector.slice(1));
  if(selector.startsWith('['))return Object.hasOwn(node.attrs,selector.slice(1,-1));
  return node.tag===selector;
}
function parse(html,root){
  const stack=[root];
  for(const match of html.matchAll(/<\/?[a-zA-Z][^>]*>/g)){
    const token=match[0];if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}
    const tag=token.match(/^<(\w+)/)[1];const node=new Element(tag);
    for(const attribute of token.matchAll(/([\w-]+)="([^"]*)"/g))node.setAttribute(attribute[1],attribute[2]);
    stack.at(-1).append(node);
    if(!['meta','link','input','br','hr'].includes(tag))stack.push(node);
  }
}
const document=new Element('document');parse(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),document);
document.createElement=tag=>new Element(tag);document.createTextNode=()=>new Element('text');document.getElementById=id=>document.querySelector('#'+id);
const store=new Map();
const context={Crossword,document,localStorage:{setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k)},window:{addEventListener(){}},setInterval(){}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../script.js'),'utf8'),context);
const $=selector=>document.querySelector(selector);
assert.equal($('#score').textContent,'0 de 16 palavras');
assert.equal($('#board').querySelectorAll('input').length, new Set(Crossword.generate().words.flatMap(w=>Crossword.coordinates(w).map(p=>Crossword.key(...p)))).size);
$('#hint-button').click();assert.equal($('#hint-count').textContent,'2 / 3');assert.equal($('#points').textContent,'−0050');
$('#hint-button').click();$('#hint-button').click();assert.equal($('#hint-button').disabled,true);
$('#reset-button').click();assert.equal($('#hint-count').textContent,'3 / 3');assert.ok($('#board').querySelectorAll('input').every(el=>el.value===''));
// Preencher a solução pela coordenada acessível; testar conferência e ausência de pontos duplicados.
const puzzle=Crossword.generate();const solution=new Map();
puzzle.words.forEach(word=>Crossword.coordinates(word).forEach(([r,c],i)=>solution.set(`${r+1},${c+1}`,word.word[i])));
for(const input of $('#board').querySelectorAll('input')){
  const [,r,c]=input.attrs['aria-label'].match(/Linha (\d+), coluna (\d+)/);input.value=solution.get(`${r},${c}`);
}
$('#check-button').click();assert.equal($('#score').textContent,'16 de 16 palavras');assert.equal($('#points').textContent,'1600');assert.equal($('#sector-count').textContent,'4 / 4');assert.equal($('#complete-dialog').open,true);
$('#check-button').click();assert.equal($('#points').textContent,'1600');
const input=$('#board').querySelectorAll('input')[0];input.value='!';input.fire('input');assert.notEqual($('#points').textContent,'1600');
$('#reset-button').click();assert.equal($('#score').textContent,'0 de 16 palavras');assert.equal($('#points').textContent,'0000');assert.equal($('#sector-count').textContent,'0 / 4');
assert.ok(store.size>0);
console.log('OK: inicialização, sondas limitadas, custo, conferência, pontuação única, quatro subsistemas, vitória, invalidação, reinício e salvamento.');
