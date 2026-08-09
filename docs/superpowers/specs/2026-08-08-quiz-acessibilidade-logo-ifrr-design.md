# Design — Quiz “O Chute da Acessibilidade” e correção da marca IFRR

## Objetivo

Atualizar a apresentação acadêmica para que a dinâmica obrigatória aconteça antes da exibição de qualquer nota do Lighthouse e substituir a marca atual do IFRR por uma versão institucional correta.

## Escopo

A alteração cobre dois pontos:

1. Corrigir a marca do IFRR usada no topo e na capa da apresentação.
2. Substituir a dinâmica atual pela Opção A — “O Chute da Acessibilidade”, em modo individual no próprio site.

Ficam fora do escopo mudanças nos resultados já apurados, criação de backend, armazenamento remoto de respostas ou integração com Mentimeter/Google Forms.

## Ordem da apresentação

A página passa a seguir esta sequência:

1. Capa.
2. Introdução curta da atividade.
3. Quiz “O Chute da Acessibilidade”.
4. Revelação dos resultados reais do Lighthouse.
5. Comparação geral dos três sites.
6. Análise individual de Amazon, SHEIN e site do grupo.
7. Exemplos de correções.
8. Relatórios públicos no Google Drive.
9. Conclusão.

Nenhuma pontuação do Lighthouse pode aparecer antes da etapa de revelação, inclusive em cards, textos auxiliares, navegação, atributos acessíveis, rótulos, tooltips ou conteúdo oculto visualmente mas exposto ao leitor de tela.

## Quiz “O Chute da Acessibilidade”

### Estrutura visual

A seção exibe três opções identificáveis:

- Amazon Brasil.
- SHEIN Brasil.
- Site do grupo.

Cada opção deve exibir um print real ou uma captura visual fiel da página auditada, sem qualquer nota do Lighthouse, indicador de pontuação ou elemento que antecipe o resultado. A implementação deve priorizar capturas derivadas dos próprios relatórios/auditorias ou da página pública correspondente, evitando imagens ilustrativas ou recriações que possam distorcer o visual real do site avaliado.

Os prints devem possuir texto alternativo que descreva o conteúdo visual sem revelar qualquer resultado de acessibilidade.

### Interação

O participante responde duas perguntas:

- Qual site teve a melhor pontuação de acessibilidade?
- Qual site teve a pior pontuação de acessibilidade?

As duas respostas usam controles nativos e acessíveis, preferencialmente grupos de radio buttons.

Regras:

- O mesmo site não pode ser escolhido como melhor e pior.
- O botão “Confirmar meu palpite” só conclui quando as duas respostas forem válidas.
- Após confirmação, as escolhas ficam bloqueadas para evitar alteração acidental.
- O sistema informa de forma clara que o palpite foi registrado localmente.
- Nenhuma resposta é enviada para servidor ou armazenada fora do navegador.

## Revelação

Após o palpite confirmado, é habilitado o botão “Revelar resultados do Lighthouse”.

Ao revelar:

- Amazon Brasil: 92.
- SHEIN Brasil: 97.
- Site do grupo: 100.

A página informa separadamente:

- se o participante acertou qual teve a melhor pontuação;
- se acertou qual teve a pior pontuação.

A mensagem de resultado não depende apenas de cor e deve ser anunciada em uma região `aria-live`.

Depois da revelação, um botão “Continuar para a análise” leva à seção comparativa completa.

## Reinício da dinâmica

Um botão “Novo palpite” limpa somente o estado do quiz e permite que outra pessoa participe sem recarregar a página.

O reinício:

- limpa as duas escolhas;
- volta a ocultar a revelação;
- libera novamente os controles;
- devolve o foco ao início do quiz.

## Estado e dados

A implementação deve ser totalmente client-side.

O estado mínimo é:

- `bestGuess`;
- `worstGuess`;
- `guessConfirmed`;
- `resultsRevealed`.

Esse estado pode existir apenas em memória durante a sessão. Não há necessidade de `localStorage` para as respostas do quiz, pois a dinâmica é temporária e pensada para uso presencial.

As preferências de acessibilidade já existentes — tema, contraste e escala de fonte — continuam podendo usar `localStorage`.

## Acessibilidade do quiz

A nova seção deve preservar e reforçar os requisitos já existentes:

- navegação integral por teclado;
- foco visível;
- `fieldset` e `legend` para cada grupo de resposta;
- labels explícitos;
- mensagens de erro associadas semanticamente aos controles;
- `aria-live` para confirmação e revelação;
- nenhum dado transmitido apenas por cor;
- ordem de foco previsível;
- suporte a `prefers-reduced-motion`;
- funcionamento em tema claro, escuro e alto contraste.

## Correção da marca IFRR

O SVG atualmente usado é uma reconstrução manual e deve ser removido.

A implementação deve usar uma marca institucional oficial do IFRR obtida em fonte institucional do próprio IFRR ou material oficial de identidade visual.

Requisitos:

- manter proporção original da marca;
- não redesenhar, alterar cores, distorcer ou recompor elementos da marca;
- usar um arquivo adequado para web, preferencialmente SVG ou PNG oficial;
- manter `alt` e `aria-label` descritivos no `<img>`;
- usar a mesma marca correta tanto na barra superior quanto na capa;
- se a marca oficial tiver fundo transparente, o layout deve fornecer contraste suficiente sem inserir elementos que alterem a identidade visual.

## Navegação e prevenção de spoiler

A navegação superior não deve conter links com texto que revele notas antes do quiz.

A seção comparativa e as análises detalhadas podem permanecer no documento, mas devem ficar realmente indisponíveis antes da revelação por meio do atributo `hidden`. Assim, as pontuações não aparecem visualmente nem são expostas à árvore de acessibilidade antes da interação.

Depois da revelação, o atributo `hidden` é removido das seções de resultados e análise. O foco deve ser movido para o título da seção revelada, usando `tabindex="-1"` quando necessário.

## Tratamento de erros

Casos previstos:

- nenhuma resposta selecionada: informar que as duas perguntas precisam ser respondidas;
- mesma opção em melhor e pior: informar que as escolhas precisam ser diferentes;
- tentativa de revelar sem confirmar palpite: manter revelação bloqueada;
- reinício após revelação: voltar ao estado inicial sem preservar o palpite anterior.

As mensagens devem aparecer visualmente e ser anunciadas para tecnologias assistivas.

## Responsividade

O quiz deve funcionar em larguras pequenas e grandes.

Comportamento esperado:

- desktop: três opções lado a lado quando houver espaço;
- tablet: grid de duas colunas quando apropriado;
- mobile: uma coluna, com controles amplos e áreas de toque confortáveis;
- prints responsivos, sem corte que prejudique a identificação do site;
- nenhuma rolagem horizontal causada pela nova seção.

## Critérios de aceitação

A alteração é considerada pronta quando:

1. A marca exibida é uma versão institucional correta do IFRR.
2. O quiz mostra prints reais/fieis dos três sites antes das notas.
3. Nenhuma nota do Lighthouse aparece antes da revelação.
4. O participante consegue escolher melhor e pior site usando apenas teclado.
5. O mesmo site não pode ser aceito simultaneamente como melhor e pior.
6. O palpite pode ser confirmado e fica bloqueado.
7. A revelação mostra 92, 97 e 100 somente depois da confirmação.
8. A página informa quais palpites foram acertados.
9. “Novo palpite” restaura corretamente o estado inicial.
10. A dinâmica continua funcional em tema claro, escuro, alto contraste e com fonte ampliada.
11. O restante da apresentação continua acessível e o link dos relatórios permanece apontando para a pasta pública do Google Drive.

## Verificação

A implementação deverá ser validada por inspeção e teste funcional dos seguintes cenários:

- fluxo completo com acerto total;
- fluxo com acerto parcial;
- fluxo com erro nas duas escolhas;
- tentativa de escolher o mesmo site nas duas perguntas;
- reinício da dinâmica;
- uso somente com teclado;
- uso em viewport mobile;
- uso nos três modos visuais da apresentação;
- inspeção do HTML/DOM para confirmar que as notas não são expostas antes da revelação;
- carregamento correto da marca institucional do IFRR;
- carregamento correto e identificação visual dos três prints do quiz.
