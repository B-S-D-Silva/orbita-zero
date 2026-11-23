# ÓRBITA ZERO — Arcade de conhecimento

Arcade espacial de ação e sobrevivência. Pilote a interceptora Andorinha por cinco setores, enfrente drones, atravesse asteroides e derrote o Guardião para abrir uma rota de fuga.

**[Jogar ÓRBITA ZERO no GitHub Pages](https://b-s-d-silva.github.io/orbita-zero/)**

O repositório original meu-primeiro-rep foi renomeado para orbita-zero. O histórico foi preservado, e a publicação usa o endereço atual.

**Repositório:** [orbita-zero](https://github.com/B-S-D-Silva/orbita-zero).

O projeto foi transformado em um jogo espacial a pedido do usuário. A cruzadinha foi substituída, e os históricos anteriores são preservados.

## Como jogar

Clique em **Jogar Arcade**. Antes do combate, responda ao Quiz Challenge. Depois, sobreviva até o cronômetro da fase zerar e elimine os inimigos restantes para liberar o salto. Entre as fases, invista fragmentos em melhorias. No quinto, responda à calibração final e destrua o chefe.

Para jogar apenas as perguntas, escolha **Só Quiz / 16 perguntas**. Esse modo tem placar, explicações e resultado final, sem combate. Mudar para ele durante uma partida pede confirmação antes de reiniciar.

## Perguntas de arquitetura de computadores

São 16 perguntas de múltipla escolha, sem repetição: três antes de cada um dos quatro primeiros setores e quatro antes do último. Os temas são CPU, ULA, UC, RAM, ROM, cache, EEPROM, Flash, memória de massa, registradores, DMA, data bus, address bus, microcontrolador, dual core e quad core.

A nave e o cronômetro ficam parados durante as perguntas. Clique em uma alternativa ou use A–D / 1–4 para ver resultado e explicação; depois use **Próxima pergunta**, **Liberar nave** ou **Ver resultado**. Cada acerto vale **100 pontos e 15 fragmentos**. Três acertos seguidos liberam **OVERDRIVE: 8 segundos de disparo duas vezes mais rápido**, contados apenas durante o combate. Errar quebra a sequência sem retirar vida ou pontos. Não é possível repetir a resposta para acumular bônus.

O painel educacional mostra acertos e perguntas respondidas; o relatório final também inclui o resultado. Reiniciar limpa a rodada e o contador. As perguntas usam conceitos gerais; o e-book da atividade não foi fornecido para comparação.

| Controle | Ação |
| --- | --- |
| WASD ou setas | Mover a nave |
| Mouse | Mirar |
| Clique pressionado ou espaço | Disparar |
| Auto Fire | Disparos e mira automáticos no inimigo mais próximo |
| A–D ou 1–4 durante o quiz | Selecionar uma alternativa |
| Shift / botão DASH | Dash direcional com proteção curta e rastro; duas cargas, recarga de 4 segundos por carga |
| E / botão Pulso | Limpa projéteis próximos e causa dano na área; recarga de 12 segundos |
| P, Esc ou pausa | Pausar / continuar |
| Toque e arraste na arena | Pilotar com mira e disparos automáticos nos inimigos |

O escudo regenera após quatro segundos sem receber dano. O casco é recuperado na oficina. Drones destruídos e asteroides deixam fragmentos dourados: aproxime-se para atraí-los. A oficina oferece melhorias de canhão, capacidade de escudo e reparos. Cada salto concede 20 fragmentos extras, mas não recolhe os fragmentos restantes.

O dash usa a direção das teclas de movimento ou do toque; parado, usa a última direção de movimento. Cada carga permite um avanço de 0,18 segundo, com proteção de 0,3 segundo. A segunda carga pode ser usada assim que o primeiro dash acaba; cargas gastas recarregam uma de cada vez. A recarga para durante quiz, pausa e oficina.

Eliminações consecutivas em até três segundos formam combos: alvos 1–3 rendem ×1; 4–6 rendem ×2; 7–9 rendem ×3; a partir do décimo, ×4. Sofrer dano ou passar três segundos sem eliminar um inimigo encerra o combo. O multiplicador vale para inimigos, não para quiz, asteroides ou bônus de fase.

O som começa desligado. O jogo pausa ao perder foco. O recorde é salvo neste navegador quando permitido, sem dados pessoais. A partida em andamento não é salva.

## Executar e verificar

Abra index.html em um navegador moderno. Não é necessário instalar dependências ou acessar a internet.

- index.html: cockpit, controles, oficina e telas de partida.
- style.css: identidade visual e layouts responsivos.
- game.js: movimento, colisões, inimigos, combate e progressão.
- script.js: renderização Canvas, entradas, interface e áudio sintetizado.
- tests/game.test.js: validação das regras.

Execute `node --check game.js`, `node --check script.js` e `node tests/game.test.js`.

## Publicação e versionamento

GitHub Actions testa e publica no GitHub Pages após cada push em main. Em Settings → Pages, a fonte é GitHub Actions. O site fica na raiz e usa caminhos relativos, compatíveis com /orbita-zero/. Pull requests executam apenas verificações. Usar commits reais com feat, fix, style e docs. Contribuições em dois dias precisam ser trabalho real em dias diferentes; datas não são manipuladas.

Sem bibliotecas ou recursos visuais externos: cenário, naves, planetas e efeitos são desenhados com Canvas e SVG; áudio gerado com Web Audio.

## Referências visuais pesquisadas

- [Galaga — capturas de gameplay](https://www.retrogamesnow.co.uk/galaga-namco-retro-arcade-review/): placar superior, fundo estrelado e silhuetas contrastantes.
- [Kenney — Space Shooter Remastered](https://kenney.nl/assets/space-shooter-remastered): leitura de naves e projéteis em vista superior.
- [Trivia Night — imagens oficiais na Steam](https://store.steampowered.com/app/628570/Trivia_Night/): alternativas grandes e cores que destacam a rodada de perguntas.

As imagens foram consultadas como referência. Nenhum sprite, imagem, marca ou áudio desses jogos foi copiado para o projeto. Os sprites de pixels são desenhos originais definidos em script.js e funcionam sem downloads.
