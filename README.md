# ÓRBITA ZERO — Última transmissão

Arcade espacial de ação e sobrevivência. Pilote a interceptora Andorinha por cinco setores, enfrente drones, atravesse asteroides e derrote o Guardião para abrir uma rota de fuga.

**[Jogar no navegador](https://b-s-d-silva.github.io/arqcomp-cruzadinha/)**

O projeto foi transformado em um jogo espacial a pedido do usuário. O repositório conserva o nome original para preservar endereço e histórico; a cruzadinha foi substituída.

## Como jogar

Clique em **Iniciar expedição**. Sobreviva até o cronômetro do setor zerar e elimine os inimigos restantes para liberar o salto. Entre os setores, invista fragmentos em melhorias. No quinto, destrua o chefe.

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

GitHub Actions testa e publica no GitHub Pages após cada push em main. Pull requests executam apenas verificações. Usar commits reais com feat, fix, style e docs. Contribuições em dois dias precisam ser trabalho real em dias diferentes; datas não são manipuladas.

Sem bibliotecas ou recursos visuais externos: cenário, naves, planetas e efeitos são desenhados com Canvas e SVG; áudio gerado com Web Audio.
