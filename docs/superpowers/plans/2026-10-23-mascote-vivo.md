# mascote-vivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma biblioteca TypeScript que dá vida a mascotes em SVG (olhar, piscar, pular, comemorar), com uma página de demonstração com uma capivara, publicada no GitHub Pages.

**Architecture:** Uma função pura calcula o deslocamento das pupilas; `darVida()` liga os eventos e as animações num SVG marcado com classes e devolve um controle (`comemorar`, `parar`). O GSAP não vai no arquivo: a biblioteca usa `opcoes.gsap` ou o `gsap` global que o site carregou. `tsc` gera `dist/mascote-vivo.js` (versionado, para Pages e jsDelivr); `index.html` na raiz é a demonstração.

**Tech Stack:** TypeScript ^5.8.3, GSAP 3.15.0 (CDN na demo, dev dependency para tipos e testes), Vitest ^4 + jsdom, GitHub Pages (branch `main`, pasta `/`).

**Spec:** `docs/superpowers/specs/2026-10-23-mascote-vivo-design.md`

## Global Constraints

- Repositório público `nullfeel/mascote-vivo`, licença MIT.
- Commits com `git -c user.name="Marcos Alan" -c user.email="<id>+nullfeel@users.noreply.github.com"`, onde `<id>` = `gh api user --jq .id`. Nunca o e-mail pessoal.
- Textos da página, do README e das mensagens de erro em português do Brasil.
- Nada copiado da Prumo: código, desenho, nome, cores. Nada de roxo `#6C5CE7`/`#8F7CFF`.
- Classes do SVG: `.pp` (pupilas), `.palpebra` (pálpebras), `.corpo` (o que pula; se faltar, o SVG inteiro).
- Com `prefers-reduced-motion: reduce`: nenhuma animação, nenhum listener de movimento; `comemorar()` só liga a classe `mv-feliz`.
- Olhar só com `pointerType === "mouse"`.
- O README não promete nada que o projeto não faça.

## Review Focus

1. SVG sem `.pp`, `.palpebra` ou `.corpo`: não pode quebrar; só pula o comportamento que falta.
2. `darVida()` chamado duas vezes no mesmo SVG: não duplica listeners; devolve o mesmo controle.
3. Depois de `parar()`: mouse, toque e timers não fazem mais nada.
4. GSAP não carregado (e movimento permitido): erro claro em português, não um `undefined is not a function`.
5. `comemorarEm` com seletor que não acha nada: sem erro.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/olhar.ts` | `deslocamentoPupila()`, conta pura |
| `src/mascote-vivo.ts` | `darVida()`, tipos `Opcoes` e `Controle`; reexporta `deslocamentoPupila` |
| `tests/olhar.test.ts` | testes da conta |
| `tests/mascote-vivo.test.ts` | testes de `darVida` em jsdom, com GSAP falso |
| `index.html`, `demo.css` | página de demonstração com a capivara |
| `dist/mascote-vivo.js` | saída do `tsc` (versionada) |
| `README.md`, `LICENSE` | documentação e licença |

---

### Task 1: Projeto e conta das pupilas

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.mts`, `.gitignore`, `src/olhar.ts`
- Test: `tests/olhar.test.ts`

**Interfaces:**
- Produces: `deslocamentoPupila(dx: number, dy: number, max: number): { x: number; y: number }` em `src/olhar.ts`.

- [ ] **Step 1: Criar o projeto**

`git init -b main` em `C:\Users\vkz\mascote-vivo` (a pasta já tem `docs/`). `package.json`: `"name": "mascote-vivo"`, `"type": "module"`, `"license": "MIT"`, scripts `"build": "tsc"`, `"test": "vitest run"`; devDependencies `typescript ^5.8.3`, `vitest ^4`, `jsdom`, `gsap 3.15.0`. `tsconfig.json`: `target ES2020`, `module ES2020`, `strict`, `lib ["ES2020","DOM"]`, `rootDir src`, `outDir dist`, `declaration true`, `include ["src"]`. `vitest.config.mts`: `environment: "jsdom"`. `.gitignore`: `node_modules/`. Rodar `npm install`.

- [ ] **Step 2: Escrever o teste que falha** em `tests/olhar.test.ts`

```ts
import { deslocamentoPupila } from "../src/olhar";
test("longe do mascote, anda o máximo na direção do mouse", () => {
  expect(deslocamentoPupila(300, 0, 4)).toEqual({ x: 4, y: 0 });
});
test("perto, anda proporcional à distância (90px = máximo)", () => {
  const r = deslocamentoPupila(0, 45, 4);
  expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(2);
});
test("mouse em cima do centro não gera NaN", () => {
  expect(deslocamentoPupila(0, 0, 4)).toEqual({ x: 0, y: 0 });
});
```

- [ ] **Step 3: Rodar e ver falhar** — `npx vitest run tests/olhar.test.ts` → FAIL (módulo não existe).

- [ ] **Step 4: Implementar `deslocamentoPupila`** — `d = hypot(dx,dy) || 1`, `k = min(d/90, 1) * max`, devolve `{ x: dx/d*k, y: dy/d*k }`.

- [ ] **Step 5: Rodar e ver passar** — mesmo comando → 3 PASS.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Projeto e conta das pupilas"` (com a identidade das Global Constraints).

---

### Task 2: `darVida` — olhar, pular, parar, movimento reduzido

**Files:**
- Create: `src/mascote-vivo.ts`
- Test: `tests/mascote-vivo.test.ts`

**Interfaces:**
- Consumes: `deslocamentoPupila` (Task 1).
- Produces:

```ts
export interface Opcoes { comemorarEm?: string; maxOlhar?: number /* px, padrão 4 */; gsap?: GsapMinimo }
export interface Controle { comemorar(): void; parar(): void }
export function darVida(svg: SVGSVGElement, opcoes?: Opcoes): Controle
export { deslocamentoPupila } from "./olhar";
```

`GsapMinimo` = o pedaço do GSAP usado (`to`, `timeline`, `killTweensOf`), tipado a partir de `import type gsap from "gsap"`.

Nos testes, `matchMedia` é stubado (`vi.stubGlobal`) e o GSAP é um objeto falso com `vi.fn()`. O SVG de teste tem `.pp`, `.palpebra` e `.corpo`.

- [ ] **Step 1: Escrever os testes que falham**

- `olhar: pointermove de mouse move as pupilas` — dispara `pointermove` (`pointerType: "mouse"`, longe à direita) e, após `requestAnimationFrame`, `.pp` tem `style.transform` contendo `translate(4`.
- `olhar: pointermove de toque não move` — `pointerType: "touch"` → `transform` vazio.
- `pular: pointerdown no SVG chama gsap no .corpo` — `gsap.timeline` (ou `to`) recebe o elemento `.corpo`.
- `pular: sem .corpo usa o próprio svg`.
- `reduzido: nada anima` — `matchMedia` → `matches: true`; mouse e toque não chamam gsap e não mudam `transform`.
- `sem partes: svg vazio não quebra` — `darVida(<svg/>)` sem `.pp`/`.palpebra`/`.corpo` e eventos não lançam erro.
- `duas vezes: devolve o mesmo controle` — `darVida(svg) === darVida(svg)`, e um `pointerdown` gera um só pulo.
- `parar: desliga tudo` — após `parar()`, `pointermove` e `pointerdown` não fazem nada.
- `sem gsap: erro em português` — sem `opcoes.gsap` e sem `globalThis.gsap`, com movimento permitido: `toThrow("mascote-vivo: carregue o GSAP antes de chamar darVida")`. Com movimento reduzido: não lança.

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run tests/mascote-vivo.test.ts` → FAIL.

- [ ] **Step 3: Implementar `darVida`** em `src/mascote-vivo.ts`. Guarda o controle num `WeakMap<SVGSVGElement, Controle>` para o caso "duas vezes". Pupilas: `pointermove` + `scroll` no `window` com `requestAnimationFrame`, centro dos olhos em 45% da altura. Pulo: timeline curta no `.corpo` (sobe e volta, `transformOrigin: "50% 100%"`). Toda limpeza (listeners, rAF, timers, `killTweensOf`) vai para uma lista que `parar()` executa e depois apaga o controle do `WeakMap`.

- [ ] **Step 4: Rodar e ver passar** — `npm test` → todos PASS.

- [ ] **Step 5: Commit** — `"darVida: olhar, pular e movimento reduzido"`.

---

### Task 3: Piscar e comemorar

**Files:**
- Modify: `src/mascote-vivo.ts`
- Test: `tests/mascote-vivo.test.ts`

**Interfaces:**
- Consumes: `darVida`, `Controle` (Task 2).
- Produces: `Controle.comemorar()` implementado; opção `comemorarEm`.

- [ ] **Step 1: Escrever os testes que falham** (com `vi.useFakeTimers()`)

- `piscar: depois de 6 s, gsap anima .palpebra` — avançar 6000 ms → gsap recebeu `.palpebra`.
- `piscar: parar() cancela` — `parar()` e avançar 10000 ms → nenhuma chamada nova.
- `comemorar(): liga mv-feliz e anima o .corpo` — classe `mv-feliz` no svg; gsap chamado com `.corpo`; após o fim (avançar 1500 ms) a classe sai.
- `comemorarEm: pointerenter liga, pointerleave desliga` — `mv-feliz` entra e sai.
- `comemorarEm: focus e click também comemoram`.
- `comemorarEm: seletor sem resultado não quebra`.
- `reduzido: comemorar() só liga mv-feliz, sem gsap`.

- [ ] **Step 2: Rodar e ver falhar** — `npm test` → os novos FAIL.

- [ ] **Step 3: Implementar.** Piscar: `setTimeout` encadeado com intervalo aleatório entre 2000 e 6000 ms; anima `.palpebra` de `scaleY 0` para `1` e volta (as pálpebras ficam com `scaleY 0` e `transformOrigin` no topo ao ligar). Comemorar: liga `mv-feliz`, timeline de 2 pulinhos com leve rotação no `.corpo`, tira a classe no fim; com `comemorarEm`, `pointerenter`/`focus` ligam e `pointerleave`/`blur` desligam; `click` chama `comemorar()`.

- [ ] **Step 4: Rodar e ver passar** — `npm test` → todos PASS.

- [ ] **Step 5: Commit** — `"Piscar e comemorar"`.

---

### Task 4: Capivara e página de demonstração

**Files:**
- Create: `index.html`, `demo.css`, `dist/mascote-vivo.js` (via `npm run build`)

**Interfaces:**
- Consumes: `darVida(svg, { comemorarEm: "#botao-comemorar" })` (Tasks 2–3), carregado de `./dist/mascote-vivo.js` como módulo, depois do GSAP 3.15.0 por `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js">`.

- [ ] **Step 1: Desenhar a capivara** inline no `index.html`, a partir de `docs/rascunho-capivara.svg`, mais caprichada mas reconhecível. Adicionar: `<g class="corpo">` em volta de tudo, `.palpebra` (elipses da cor do corpo sobre os olhos), uma boca normal e uma `.boca-feliz` (escondida; `demo.css` mostra quando o svg tem `mv-feliz` e esconde a normal). `role="img"` e `aria-label="Capivara mascote"`.

- [ ] **Step 2: Montar a página.** Título "mascote-vivo", uma frase do que é, a capivara grande, o botão `#botao-comemorar` ("Comemorar!"), uma seção "Como usar no seu site" com o código (GSAP + `import { darVida } from "https://cdn.jsdelivr.net/gh/nullfeel/mascote-vivo@v0.1.0/dist/mascote-vivo.js"`), e rodapé "Feito por Marcos Alan" com link para github.com/nullfeel. Paleta própria quente (tons de areia/verde-lago), sem roxo. Funciona em 360 px de largura.

- [ ] **Step 3: Build** — `npm run build` → `dist/mascote-vivo.js` existe e `npm test` segue PASS.

- [ ] **Step 4: Verificar no navegador** — `npx serve .` (ou `python -m http.server`) e abrir: olhos seguem o mouse, pisca, pula ao clicar, comemora no botão (passar o mouse, Tab até ele, clicar). Com "mostrar animações" desligado no Windows, nada se mexe e o botão só troca a boca. Console sem erros.

- [ ] **Step 5: Commit** — `"Capivara e página de demonstração"`.

---

### Task 5: README, publicação e perfil

**Files:**
- Create: `README.md`, `LICENSE`
- Modify: `README.md` do repositório `nullfeel/nullfeel` (clone em `C:\Users\vkz\AppData\Local\Temp\claude\C--Users-vkz\94fe510a-50bb-498f-b1ae-76c1421df3b1\scratchpad\nullfeel`)

- [ ] **Step 1: Escrever o README** no estilo do Victor (github.com/burnoutscript/rls-guard): o que faz; de onde veio ("nasceu das animações do mascote que fiz para a Prumo; este é código novo, com um mascote novo"); link da demo `https://nullfeel.github.io/mascote-vivo/`; como usar (as 3 formas: jsDelivr, arquivo do Pages, copiar `dist/mascote-vivo.js`; GSAP antes); tabela das classes do SVG; tabela das opções; movimento reduzido; "feito com o Claude como parceiro de programação"; licença. `LICENSE` MIT com "Marcos Alan", 2026.

- [ ] **Step 2: Publicar** — commit `"README e licença"`; `gh repo create nullfeel/mascote-vivo --public --description "Dá vida a mascotes em SVG: olham para o mouse, piscam, pulam e comemoram" --source . --push`; `gh api -X POST repos/nullfeel/mascote-vivo/pages -f "source[branch]=main" -f "source[path]=/"`; `git tag v0.1.0 && git push --tags`.

- [ ] **Step 3: Verificar no ar** — `curl -s -o /dev/null -w "%{http_code}" https://nullfeel.github.io/mascote-vivo/` → `200` (pode levar alguns minutos); `curl -sI https://cdn.jsdelivr.net/gh/nullfeel/mascote-vivo@v0.1.0/dist/mascote-vivo.js` → `200`. Abrir a página no ar e repetir a checagem do Task 4 Step 4.

- [ ] **Step 4: Perfil** — no README do perfil, adicionar antes de "Como eu trabalho":

```markdown
#### Projetos

| Projeto | O que faz |
|---|---|
| [mascote-vivo](https://github.com/nullfeel/mascote-vivo) | Dá vida a mascotes em SVG: olham para o mouse, piscam, pulam e comemoram. [Ver demonstração](https://nullfeel.github.io/mascote-vivo/) |
```

Na linha de Stack, trocar `JavaScript` por `TypeScript, JavaScript` e acrescentar `GSAP`. Commit `"Projeto mascote-vivo no perfil"` com a mesma identidade e `git push`.
