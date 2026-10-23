import gsapReal from "gsap";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";
import { darVida } from "../src/mascote-vivo";
import { movimento, ponteiro, svgCompleto } from "./ajuda";

// GSAP de verdade, com o relógio na mão: assim as animações se sobrepõem como no navegador.
let t = 0;
const avancar = (s: number) => { for (let i = 0; i < s * 60; i++) gsapReal.updateRoot((t += 1 / 60)); };

beforeAll(() => {
  gsapReal.ticker.remove(gsapReal.updateRoot);
  const proto = (window as unknown as { SVGElement: { prototype: object } }).SVGElement.prototype;
  Object.assign(proto, { getBBox: () => ({ x: 0, y: 0, width: 100, height: 100 }) });
});

beforeEach(() => {
  movimento(false);
  vi.stubGlobal("requestAnimationFrame", () => 1);
});

afterEach(() => vi.unstubAllGlobals());

const pose = (svg: SVGSVGElement) => {
  const c = svg.querySelector(".corpo")!;
  return { y: Number(gsapReal.getProperty(c, "y")), r: Number(gsapReal.getProperty(c, "rotation")) };
};

test("sobreposição: comemorar e clicar logo depois volta ao lugar", () => {
  const svg = svgCompleto();
  const c = darVida(svg, { gsap: gsapReal });
  c.comemorar();
  avancar(0.25);
  c.comemorar();
  avancar(3);
  expect(pose(svg)).toEqual({ y: 0, r: 0 });
});

test("sobreposição: dois toques rápidos no mascote voltam ao lugar", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap: gsapReal });
  ponteiro(svg, "pointerdown");
  avancar(0.08);
  ponteiro(svg, "pointerdown");
  avancar(3);
  expect(pose(svg).y).toBe(0);
});

test("reduzido: as pálpebras ficam recolhidas (olhos à mostra)", () => {
  movimento(true);
  const svg = svgCompleto();
  darVida(svg);
  expect(svg.querySelector<SVGGElement>(".palpebra")!.style.transform).toBe("scaleY(0)");
});

test("sem gsap: mesmo com erro, os olhos ficam à mostra", () => {
  const svg = svgCompleto();
  expect(() => darVida(svg)).toThrow();
  expect(svg.querySelector<SVGGElement>(".palpebra")!.style.transform).toBe("scaleY(0)");
});

test("sobreposição: pular no meio da comemoração não prende a carinha feliz", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap: gsapReal }).comemorar();
  avancar(0.2);
  ponteiro(svg, "pointerdown");
  avancar(3);
  expect(svg.classList.contains("mv-feliz")).toBe(false);
  expect(pose(svg)).toEqual({ y: 0, r: 0 });
});
