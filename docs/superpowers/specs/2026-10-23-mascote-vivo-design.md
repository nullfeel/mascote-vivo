# mascote-vivo — design

## Por que existe

Marcos Alan é cofundador da Prumo (estudeprumo.com), plataforma de estudos com IA para ENEM e
concursos. Na Prumo ele faz o visual, as telas e as funcionalidades; a segurança é do sócio,
Victor (github.com/burnoutscript). O GitHub dele (github.com/nullfeel) tem só a apresentação e
nenhum projeto público. O Victor tem três projetos pequenos e abertos, cada um tirado de um
trabalho real dele na Prumo. O Marcos quer o mesmo, mas na área dele.

Este é o primeiro desses projetos. Ele vem da parte do trabalho de que o Marcos mais se orgulha
na Prumo: o mascote animado e as animações do visual cartoon.

Sucesso: um recrutador abre a página de demonstração, brinca com o mascote e entende em
segundos que o Marcos cuida de interface e animação com capricho. O Marcos consegue explicar o
projeto numa entrevista.

## O que é

Uma biblioteca pequena que dá vida a qualquer mascote em SVG, mais uma página de demonstração
com um mascote próprio: uma **capivara** cartoon e fofa (escolha do Marcos).

### Comportamentos (os mesmos que o mascote da Prumo tem hoje)

1. **Olhar**: as pupilas seguem o ponteiro do mouse, com deslocamento limitado. Só mouse; no
   toque não faz sentido.
2. **Piscar**: pisca sozinho em intervalos aleatórios.
3. **Pular**: dá um pulinho quando alguém clica ou toca nele. Funciona no celular.
4. **Comemorar**: comemora enquanto o ponteiro está em cima de um elemento escolhido (por
   exemplo, o botão principal da página), e também quando esse elemento recebe foco pelo
   teclado ou é tocado/clicado, para funcionar no celular. A biblioteca também expõe um jeito
   de mandar comemorar por código. *(escolha do Claude)*
5. **Movimento reduzido**: com `prefers-reduced-motion: reduce`, nada se mexe: sem pupilas
   seguindo, sem piscar, sem pulo e sem comemoração animada. No lugar da comemoração, o mascote
   troca para uma expressão feliz, sem movimento. *(escolha do Claude)*

### Página de demonstração

- A capivara grande no topo, com um botão que a faz comemorar.
- Um trecho curto de "como usar no seu site", com o código para copiar.
- Publicada no GitHub Pages, em português.

### README

No estilo dos projetos do Victor: o que faz, de onde veio (o mascote da Prumo), como usar e
link para a demonstração. Em português. Diz que foi feito com o Claude como parceiro de
programação.

## Metas, não-metas e anti-metas

**Metas**
- Funcionar em qualquer site, com ou sem React.
- Uma página de demonstração no ar que dá vontade de brincar.
- Código que o Marcos consiga ler e explicar.

**Não-metas**
- As poses em 3D do mascote da Prumo (pensando, espantado, comemorando em 3D).
- Versão React específica, publicação no npm, editor de mascotes.

**Anti-metas** (falha mesmo se funcionar)
- Copiar código, desenho, nome ou marca da Prumo. O código é novo e o mascote é novo.
- Afirmar no README algo que o projeto não faz.
- Animação que ignora quem pediu movimento reduzido.
- Expor o e-mail do Marcos nos commits.

## Restrições

- Repositório público `nullfeel/mascote-vivo`, licença MIT.
- Commits com o nome "Marcos Alan" e o e-mail noreply do GitHub
  (`<id>+nullfeel@users.noreply.github.com`).
- Textos da página e do README em português do Brasil.
- Cores e tipografia próprias, diferentes do roxo da Prumo.

## Decisões de como fazer (escolha do Claude, aceitas pelo Marcos)

- **TypeScript puro com GSAP.** TypeScript e GSAP já são stack da Prumo, então reforçam o perfil.
- **GitHub Pages** para a demonstração (grátis).
- **Mascote em SVG**, desenhado à mão no código, partindo do rascunho de capivara aprovado
  (`docs/rascunho-capivara.svg`): corpo marrom arredondado, orelhas pequenas, focinho escuro com
  narinas, olhos brancos com pupilas, bochechas rosadas. Pode ficar mais caprichado, mas precisa
  continuar reconhecível como esse rascunho.

## Como outro site usa *(escolha do Claude)*

- A biblioteca sai como um arquivo módulo ES publicado junto da demonstração no GitHub Pages, e
  também pelo jsDelivr a partir do repositório (`cdn.jsdelivr.net/gh/nullfeel/mascote-vivo@<tag>`).
  O README mostra esses dois jeitos e o de copiar o arquivo para o projeto.
- O GSAP não vai dentro do arquivo: o site carrega o GSAP antes (o README mostra como). O GSAP é
  gratuito, inclusive para uso comercial.

## Quem publica *(escolha do Claude)*

- O Claude cria o repositório, faz os commits e liga o GitHub Pages pela CLI `gh`, que já está
  logada na conta `nullfeel` com permissão de repositório. O ID para o e-mail noreply vem de
  `gh api user`.
- A seção "Projetos" no perfil `nullfeel/nullfeel` entra neste trabalho, como último passo.

## Como o SVG conversa com a biblioteca

O SVG marca as partes com classes. A biblioteca procura por elas e ignora o que não encontrar.

| Classe | Parte | Usada em |
|---|---|---|
| `.pp` | grupo das pupilas | Olhar |
| `.palpebra` | pálpebras (ficam escondidas e fecham ao piscar) | Piscar |
| `.corpo` | grupo que pula e comemora (se faltar, usa o SVG inteiro) | Pular, Comemorar |

## Deixado para quem construir

- Nome e assinatura exatos da função pública e das opções (o esperado é algo como
  `darVida(svg, { comemorarEm: "#botao" })` devolvendo uma função `parar()`).
- Ferramenta de build e estrutura de pastas.
- Detalhes das animações (tempo, curva, altura do pulo).
- Layout e estilo visual da página, dentro das restrições acima.
- Testes: pelo menos a conta do deslocamento das pupilas e o caso de movimento reduzido.

## Último passo

Adicionar uma seção "Projetos" no README do perfil `nullfeel/nullfeel`, no formato de tabela do
Victor, com o link deste projeto e da demonstração.
