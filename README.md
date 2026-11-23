# NEXUS — Protocolo de recuperação

Uma falha derrubou o computador. Como operador de recuperação, você deve decifrar 16 diagnósticos para restaurar quatro subsistemas: processamento, memória, transferência e integração.

**Site:** [Jogar NEXUS](https://b-s-d-silva.github.io/arqcomp-cruzadinha/).

**Repositório:** [arqcomp-cruzadinha](https://github.com/B-S-D-Silva/arqcomp-cruzadinha).

Abra **index.html** no navegador. Não é necessário instalar nada nem acessar a internet.

## Jogabilidade
- Clique em uma pista e digite nas casas. Setas navegam; Enter alterna a direção no cruzamento.
- **Conferir conexões** indica quais palavras estão certas ou erradas/incompletas. Cada palavra correta vale 100 pontos, sem bônus por conferir novamente.
- Cada uma das três **sondas** revela uma letra errada ou vazia da palavra selecionada por 50 pontos. A pontuação pode ser negativa antes dos primeiros acertos.
- Alterar uma resposta correta remove sua validação e seus pontos até nova conferência.
- Complete todas as palavras de um subsistema para colocá-lo online. Restaure os quatro para receber o relatório final.
- Filtre os diagnósticos por subsistema e ajuste o tamanho das casas com os botões de zoom.
- Use **Próxima pendente** para selecionar outro diagnóstico ainda não validado.
- **Reiniciar** limpa letras, resultados, sondas, pontuação e tempo.

O tempo mede a operação enquanto a página está visível, sem contagem regressiva. O navegador salva o progresso localmente quando permitido; modo privado e restrições a arquivos locais podem impedir a persistência. As casas ficam verdes quando pertencem a uma palavra validada; o resultado individual das palavras aparece no banco de diagnósticos.

## Estrutura
index.html: interface semântica. style.css: identidade visual e responsividade. puzzle.js: dados e montagem. script.js: missão e interação. AGENTS.md: regras de manutenção. tests/puzzle.test.js: verificações da montagem.

## Validação
Execute `node tests/puzzle.test.js`, `node tests/mission.test.js` e `node --check script.js`. Os testes da missão executam os controles com um DOM mínimo, verificando sondas, pontuação, vitória, reinício e salvamento; não substituem inspeção visual em um navegador.
As pistas usam conceitos gerais de arquitetura. O e-book citado na atividade ainda não foi fornecido para comparação.

## Palavras e pistas

| Palavra no tabuleiro | Pista |
| --- | --- |
| CPU | Processador principal responsável por buscar, interpretar e executar instruções. |
| ULA | Circuito do processador que realiza cálculos e comparações lógicas. |
| UC | Circuito que decodifica instruções e emite sinais para coordenar sua execução. |
| REGISTRADORES | Pequenos espaços internos do processador que guardam operandos e resultados imediatos. |
| RAM | Memória principal de trabalho que perde seu conteúdo ao desligar. |
| ROM | Memória tradicionalmente gravada na fabricação, destinada apenas à leitura durante o uso. |
| EEPROM | Memória persistente regravável eletricamente, com apagamento individual de bytes. |
| FLASH | Memória persistente apagada em blocos, comum em pendrives e cartões. |
| CACHE | Memória rápida entre processador e memória principal que reduz esperas por dados frequentes. |
| MEMORIADEMASSA | Categoria de armazenamento de grande capacidade que conserva arquivos sem energia. |
| DMA | Mecanismo que transfere dados entre periféricos e memória sem intervenção contínua do processador. |
| ADDRESSBUS | Linhas que indicam qual posição de memória ou dispositivo será acessada. |
| DATABUS | Linhas que transportam os valores transferidos entre processador, memória e periféricos. |
| MICROCONTROLADOR | Chip que integra processador, memória e periféricos para controlar sistemas embarcados. |
| DUALCORE | Processador com exatamente dois núcleos físicos de execução. |
| QUADCORE | Processador com exatamente quatro núcleos físicos de execução. |

## Publicação e histórico

O GitHub Actions verifica o código e publica os arquivos do jogo no GitHub Pages após cada push na branch main. Pull requests executam apenas as verificações.

Usar commits reais com mensagens no padrão `feat: descrição`, `fix: descrição`, `style: descrição` ou `docs: descrição`. A atividade exige no mínimo seis commits em pelo menos dois dias: o segundo dia precisa conter uma contribuição real posterior. As datas não devem ser alteradas para simular esse requisito.

Não incluir RA, e-mail pessoal, telefone ou credenciais. Os commits usam uma identidade técnica do projeto e endereço genérico noreply.
