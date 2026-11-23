# ÓRBITA ZERO — Última transmissão

Arcade espacial de ação e sobrevivência. Pilote a interceptora Andorinha por cinco setores, enfrente drones, atravesse asteroides e derrote o Guardião para abrir uma rota de fuga.

**[Jogar ÓRBITA ZERO no GitHub Pages](https://b-s-d-silva.github.io/orbita-zero/)**

O repositório original meu-primeiro-rep foi renomeado para orbita-zero. O histórico foi preservado, e a publicação usa o endereço atual.

**Repositório:** [orbita-zero](https://github.com/B-S-D-Silva/orbita-zero).

O projeto foi transformado em um jogo espacial a pedido do usuário. A cruzadinha foi substituída, e os históricos anteriores são preservados.

## Como jogar

Clique em **Iniciar expedição**. Antes do combate, responda às perguntas do computador de bordo. Depois, sobreviva até o cronômetro do setor zerar e elimine os inimigos restantes para liberar o salto. Entre os setores, invista fragmentos em melhorias. No quinto, responda à calibração final e destrua o chefe.

## Perguntas de arquitetura de computadores

São 16 perguntas de múltipla escolha, sem repetição: três antes de cada um dos quatro primeiros setores e quatro antes do último. Os temas são CPU, ULA, UC, RAM, ROM, cache, EEPROM, Flash, memória de massa, registradores, DMA, data bus, address bus, microcontrolador, dual core e quad core.

A nave e o cronômetro ficam parados durante as perguntas. Selecione uma alternativa para ver o resultado, a resposta correta e a explicação; depois use **Próxima pergunta** ou **Liberar navegação**. Cada acerto vale **100 pontos e 15 fragmentos**, que podem financiar melhorias na oficina. Errar não custa vida ou pontos e não bloqueia a partida. Não é possível repetir a resposta para acumular bônus.

O painel educacional mostra acertos e perguntas respondidas; o relatório final também inclui o resultado. Reiniciar limpa a rodada e o contador. As perguntas usam conceitos gerais; o e-book da atividade não foi fornecido para comparação.

| Controle | Ação |
| --- | --- |
| WASD ou setas | Mover a nave |
| Mouse | Mirar |
| Clique pressionado ou espaço | Disparar |
| Disparo automático | Disparos contínuos na direção da mira |
| Shift / botão Propulsão | Avanço rápido com proteção curta; recarga de 5 segundos |
| E / botão Pulso | Limpa projéteis próximos e causa dano na área; recarga de 12 segundos |
| P, Esc ou pausa | Pausar / continuar |
| Toque e arraste na arena | Pilotar com mira e disparos automáticos nos inimigos |

O escudo regenera após quatro segundos sem receber dano. O casco é recuperado na oficina. Drones destruídos e asteroides deixam fragmentos dourados: aproxime-se para atraí-los. A oficina oferece melhorias de canhão, capacidade de escudo e reparos. Cada salto concede 20 fragmentos extras, mas não recolhe os fragmentos restantes.

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
