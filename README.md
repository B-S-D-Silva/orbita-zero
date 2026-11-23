# Xeque-mate na Arquitetura

Cruzadinha educativa com visual inspirado em um tabuleiro de xadrez. Abra **index.html** diretamente no navegador: não exige instalação, servidor ou conexão.

## Como jogar
1. Clique em uma pista horizontal ou vertical; as casas correspondentes serão destacadas.
2. Digite as letras nas próprias casas. O foco avança automaticamente dentro da palavra.
3. Use as setas para navegar e Enter para alternar a direção em um cruzamento.
4. Clique em **Conferir**. Cada pista recebe o resultado textual “Certa” ou “Errada ou incompleta”. As casas também recebem cores.
5. O contador mostra as palavras totalmente corretas. **Reiniciar** apaga letras, resultados e progresso.

Após a primeira conferência, os resultados acompanham as correções. Uma casa compartilhada por uma palavra correta permanece verde, mesmo que a outra esteja incompleta; o resultado individual aparece nas pistas.

## Organização
- `AGENTS.md`: requisitos e orientações de manutenção.
- `index.html`: estrutura da página.
- `style.css`: tema, estados e adaptação para celular.
- `puzzle.js`: 16 termos, pistas, montagem determinística e avaliação.
- `script.js`: entradas, seleção de palavras, teclado e controles.
- `tests/puzzle.test.js`: validação independente da montagem e avaliação.

A montagem busca incluir os 16 termos e exige ao menos 12. Todos pertencem a um único conjunto conectado, com cruzamentos perpendiculares e letras coincidentes. As casas iniciais são numeradas em ordem de leitura. Em telas pequenas, o tabuleiro permite rolagem horizontal para manter as casas legíveis.

## Verificação
Com Node.js instalado, execute `node tests/puzzle.test.js`.

As pistas têm até 15 palavras. O e-book citado no enunciado não foi fornecido; a correspondência exata com esse material ainda precisa ser revisada quando ele estiver disponível.
