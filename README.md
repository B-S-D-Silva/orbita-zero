# ÓRBITA ZERO — Última transmissão

Arcade espacial de ação e sobrevivência. Pilote a interceptora Andorinha por cinco setores, enfrente drones, atravesse asteroides e derrote o Guardião para abrir uma rota de fuga.

**Endereço do GitHub Pages:** [ÓRBITA ZERO](https://b-s-d-silva.github.io/meu-primeiro-rep/).

**Publicação pendente:** o repositório está privado e o plano atual não permite GitHub Pages nessa condição. O endereço acima só ficará ativo após habilitar Pages com um plano compatível ou tornar o repositório público. O workflow executa os testes e pula a implantação enquanto Pages não estiver habilitado; depois, use Actions → Verificar e publicar ORBITA ZERO → Run workflow.

**Repositório:** [meu-primeiro-rep](https://github.com/B-S-D-Silva/meu-primeiro-rep).

O projeto foi transformado em um jogo espacial a pedido do usuário. A cruzadinha foi substituída, e os históricos anteriores são preservados.

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

GitHub Actions testa e publica no GitHub Pages após cada push em main, quando Pages estiver habilitado e disponível no plano da conta. Em Settings → Pages, selecionar GitHub Actions como fonte. O site fica na raiz e usa caminhos relativos, compatíveis com /meu-primeiro-rep/. Pull requests executam apenas verificações. Usar commits reais com feat, fix, style e docs. Contribuições em dois dias precisam ser trabalho real em dias diferentes; datas não são manipuladas.

Sem bibliotecas ou recursos visuais externos: cenário, naves, planetas e efeitos são desenhados com Canvas e SVG; áudio gerado com Web Audio.
