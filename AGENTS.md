# Orientações do projeto

## Objetivo
Criar uma cruzadinha educativa de arquitetura de computadores com identidade visual inspirada em xadrez.

## Parte 1 — Palavras e pistas
Termos permitidos: CPU, ULA, UC, REGISTRADORES, RAM, ROM, EEPROM, FLASH, CACHE, MEMORIADEMASSA, DMA, ADDRESSBUS, DATABUS, MICROCONTROLADOR, DUALCORE e QUADCORE.
Usar letras maiúsculas, sem acentos ou espaços no tabuleiro.
Cada pista deve ter até 15 palavras, ser original, correta e apontar para uma única resposta. Não incluir a resposta, partes que a revelem ou a sigla por extenso.
O e-book não foi fornecido: não afirmar que as pistas foram validadas contra ele.

## Parte 2 — O jogo (requisitos obrigatórios)
1. Tabuleiro com no mínimo 12 palavras da lista, cruzadas entre si: cada palavra cruza com pelo menos uma outra.
2. Pistas numeradas e separadas em Horizontais e Verticais; números correspondentes nas casas iniciais.
3. O jogador digita as letras diretamente nas casas do tabuleiro.
4. Botão Conferir que mostra quais palavras estão certas e quais estão erradas, inclusive por texto.
5. Contador de acertos, por exemplo: “8 de 12 palavras”.
6. Botão Reiniciar que limpa o tabuleiro e todos os resultados.
7. HTML, CSS e JavaScript puros; index.html na raiz e funcionamento ao abrir o arquivo localmente.

## Organização e qualidade
- index.html: estrutura semântica; style.css: apresentação; puzzle.js: dados e montagem; script.js: interação.
- Manter código legível e funções pequenas; evitar bibliotecas, dependências externas e etapas de compilação.
- Validar cruzamentos perpendiculares, letras coincidentes, ausência de sobreposição paralela e conexão do conjunto.
- Garantir navegação por teclado, foco visível e uso em telas pequenas.
- Executar node tests/puzzle.test.js após alterações na montagem ou conferência.
