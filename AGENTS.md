# ÓRBITA ZERO — orientações

## Objetivo atual
Jogo espacial de ação e sobrevivência. A solicitação mais recente substituiu a cruzadinha e o tema de xadrez. Não restaurar essas mecânicas.

## Tecnologia e estrutura
HTML, CSS e JavaScript puros; index.html na raiz. Sem servidor, compilação, fontes remotas, imagens externas ou bibliotecas.
- game.js: simulação independente, exportada para Node e navegador.
- script.js: desenho Canvas, comandos, áudio opcional, interface e recorde local.
- style.css: identidade espacial e interface responsiva.
- tests/game.test.js: verificações das regras da simulação.

## Regras
Cinco setores, oficina entre os quatro primeiros e chefe final no quinto. Drones, sentinelas e inimigos pesados; asteroides destrutíveis; escudo regenerativo; casco reparável; coleta de fragmentos; melhorias; propulsão e pulso com recarga.
Pausar ao perder foco. Som começa desativado, inicializado apenas por gesto do jogador. Armazenamento local não é obrigatório para jogar. Preservar controles de teclado, mouse e toque, foco visível e instruções claras.

## Verificação
Executar node --check game.js, node --check script.js e node tests/game.test.js antes de publicar. Inspecionar a interface no navegador quando disponível.

## Git e publicação
O destino correto é B-S-D-Silva/meu-primeiro-rep. O produto é ÓRBITA ZERO. O origin local deve apontar para esse repositório; nunca enviar novas versões para arqcomp-cruzadinha. Preservar os históricos existentes e não alterar a visibilidade sem autorização.
Usar commits reais com feat, fix, style ou docs e datas reais. Nunca forjar contribuições em dois dias. Não incluir dados pessoais ou credenciais. Usar identidade técnica do projeto.
GitHub Actions deve testar e publicar apenas index.html, style.css, game.js e script.js.
