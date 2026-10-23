# mascote-vivo

Dá vida a mascotes em SVG: eles olham para o mouse, piscam, pulam quando alguém toca e comemoram
quando o mouse passa no botão principal.

**[Ver demonstração](https://nullfeel.github.io/mascote-vivo/)**

Nasceu das animações do mascote que fiz para a [Prumo](https://estudeprumo.com). Este é código
novo, com um mascote novo: uma capivara.

## O que faz

| Comportamento | Quando acontece |
|---|---|
| Olhar | As pupilas seguem o ponteiro do mouse. No toque não faz nada, porque não há ponteiro para seguir. |
| Piscar | Sozinho, a cada 2 a 6 segundos. |
| Pular | Quando alguém clica ou toca no mascote. |
| Comemorar | Quando o mouse passa no elemento de `comemorarEm`, quando ele recebe foco pelo teclado ou é clicado/tocado. Também dá para chamar por código. |

Quem ativou "reduzir movimento" no sistema (`prefers-reduced-motion: reduce`) vê o mascote
parado. No lugar da comemoração, ele só troca para uma carinha feliz.

## Como usar

### 1. Marque o SVG

A biblioteca procura estas classes e ignora a que não encontrar:

| Classe | Parte |
|---|---|
| `pp` | grupo das pupilas |
| `palpebra` | pálpebras, da cor do rosto, por cima dos olhos (ficam recolhidas e descem ao piscar) |
| `corpo` | o que pula e comemora (se faltar, usa o SVG inteiro) |

Enquanto comemora, o SVG recebe a classe `mv-feliz`. Use no seu CSS para trocar a boca, por
exemplo. A capivara do [`index.html`](index.html) é um exemplo completo.

### 2. Carregue o GSAP e chame `darVida`

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script type="module">
  import { darVida } from "https://cdn.jsdelivr.net/gh/nullfeel/mascote-vivo@v0.1.0/dist/mascote-vivo.js";

  const mascote = darVida(document.querySelector("#meu-mascote"), { comemorarEm: "#meu-botao" });
</script>
```

O GSAP não vem junto: carregue antes. Em vez do jsDelivr, dá para importar de
`https://nullfeel.github.io/mascote-vivo/dist/mascote-vivo.js` ou copiar a pasta `dist/` para o
seu projeto.

### Opções

| Opção | Padrão | O que faz |
|---|---|---|
| `comemorarEm` | nenhum | Seletor do elemento que faz o mascote comemorar |
| `maxOlhar` | `4` | Quanto as pupilas andam, em unidades do SVG |
| `gsap` | `gsap` global | Outra instância do GSAP |

`darVida` devolve `{ comemorar(), parar() }`. `parar()` desliga todos os eventos e animações.
Chamar `darVida` de novo no mesmo SVG devolve o mesmo controle.

## Desenvolvimento

```bash
npm install
npm test        # testes (Vitest + jsdom)
npm run build   # gera dist/
```

Feito em TypeScript, com o Claude como parceiro de programação.

## Licença

MIT
