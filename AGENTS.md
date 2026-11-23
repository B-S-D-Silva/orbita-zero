# NEXUS — orientações do projeto

## Produto
Jogo educativo de recuperação de um computador, com narrativa de missão e palavras cruzadas. Não usar tema de xadrez.
Usar HTML, CSS e JavaScript puros, com index.html na raiz. Funcionar por arquivo local, sem instalação, servidor ou dependências de rede.

## Requisitos obrigatórios
- Pelo menos 12 palavras da lista: CPU, ULA, UC, REGISTRADORES, RAM, ROM, EEPROM, FLASH, CACHE, MEMORIADEMASSA, DMA, ADDRESSBUS, DATABUS, MICROCONTROLADOR, DUALCORE, QUADCORE.
- Cada palavra cruza perpendicularmente com outra, com letras coincidentes, em um único conjunto conectado.
- Pistas de até 15 palavras, numeradas, separadas em Horizontais e Verticais e correspondentes às casas iniciais.
- Pistas originais, sem entregar a resposta ou expandir a sigla. O e-book não foi fornecido: não afirmar validação contra ele.
- Digitação diretamente nas casas; botão Conferir com resultados por palavra; contador de acertos; Reiniciar limpa todas as casas e resultados.

## Mecânicas
Quatro subsistemas; +100 pontos por palavra correta validada; três sondas, cada uma revela uma letra por −50 pontos. A pontuação pode ser negativa no início. Repetir Conferir não concede pontos extras. Alterar uma palavra correta retira os pontos dela até nova validação. Sem limite de tempo, punição por erros ou bloqueio de tentativas.
Preservar salvamento local com tratamento de indisponibilidade, navegação por teclado, foco visível e resultados textuais além de cores.

## Arquivos
- puzzle.js: termos, montagem e avaliação independentes da interface.
- script.js: estado da missão, interação e persistência.
- style.css: apresentação e adaptação responsiva.
- tests/: verificações do tabuleiro e integração.

## Verificação
Executar node tests/puzzle.test.js, node tests/mission.test.js e node --check script.js. Verificar a interface no navegador quando possível, incluindo conferir, sonda e reinício.

## Parte 3 — GitHub e versionamento
- Repositório público: arqcomp-cruzadinha.
- Manter no mínimo seis commits de trabalho real, distribuídos em pelo menos dois dias diferentes.
- Usar datas reais: nunca retroagir datas ou criar commits vazios para simular desenvolvimento.
- Mensagens no padrão tipo: descrição curta; tipos permitidos: feat, fix, style e docs.
- README deve conter nome do jogo, como jogar, lista das palavras com pistas e link do site publicado.
- Não publicar RA, e-mail pessoal, telefone, credenciais ou outros dados pessoais, inclusive nos metadados dos commits. Usar identidade técnica do projeto.
- A implantação deve incluir somente index.html, style.css, script.js e puzzle.js. Testes devem passar antes de publicar.
