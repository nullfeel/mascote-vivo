import { afterEach, beforeEach, vi } from "vitest";
import { darVida } from "../src/mascote-vivo";
import { gsapFalso, movimento, ponteiro, svgCompleto, svgVazio } from "./ajuda";

let gsap: ReturnType<typeof gsapFalso>;

beforeEach(() => {
  gsap = gsapFalso();
  movimento(false);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => (cb(0), 1));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const pupilas = (svg: SVGSVGElement) => svg.querySelector<SVGGElement>(".pp")!.style.transform;
const animou = (el: Element) => gsap.to.mock.calls.some(([alvo]) => alvo === el || (Array.isArray(alvo) && alvo.includes(el)));

test("olhar: pointermove de mouse move as pupilas", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap });
  ponteiro(window, "pointermove", { clientX: 1000 });
  expect(pupilas(svg)).toContain("translate(4");
});

test("olhar: pointermove de toque não move", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap });
  ponteiro(window, "pointermove", { clientX: 1000, pointerType: "touch" });
  expect(pupilas(svg)).toBe("");
});

test("pular: pointerdown no SVG chama gsap no .corpo", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap });
  ponteiro(svg, "pointerdown");
  expect(animou(svg.querySelector(".corpo")!)).toBe(true);
});

test("pular: sem .corpo usa o próprio svg", () => {
  const svg = svgVazio();
  darVida(svg, { gsap });
  ponteiro(svg, "pointerdown");
  expect(animou(svg)).toBe(true);
});

test("reduzido: nada anima", () => {
  movimento(true);
  const svg = svgCompleto();
  darVida(svg, { gsap });
  ponteiro(window, "pointermove", { clientX: 1000 });
  ponteiro(svg, "pointerdown", { pointerType: "touch" });
  expect(gsap.to).not.toHaveBeenCalled();
  expect(pupilas(svg)).toBe("");
});

test("sem partes: svg vazio não quebra", () => {
  const svg = svgVazio();
  expect(() => {
    darVida(svg, { gsap });
    ponteiro(window, "pointermove", { clientX: 1000 });
    ponteiro(svg, "pointerdown");
  }).not.toThrow();
});

test("duas vezes: devolve o mesmo controle", () => {
  const svg = svgCompleto();
  expect(darVida(svg, { gsap })).toBe(darVida(svg, { gsap }));
  ponteiro(svg, "pointerdown");
  expect(gsap.to).toHaveBeenCalledTimes(1);
});

test("parar: desliga tudo", () => {
  const svg = svgCompleto();
  darVida(svg, { gsap }).parar();
  ponteiro(window, "pointermove", { clientX: 1000 });
  ponteiro(svg, "pointerdown");
  expect(pupilas(svg)).toBe("");
  expect(gsap.to).not.toHaveBeenCalled();
});

test("sem gsap: erro em português", () => {
  expect(() => darVida(svgCompleto())).toThrow("mascote-vivo: carregue o GSAP antes de chamar darVida");
});

test("sem gsap e movimento reduzido: não lança", () => {
  movimento(true);
  expect(() => darVida(svgCompleto())).not.toThrow();
});

describe("piscar e comemorar", () => {
  beforeEach(() => vi.useFakeTimers());

  const botao = () => {
    const b = document.createElement("button");
    b.id = "botao";
    document.body.appendChild(b);
    return b;
  };
  const feliz = (svg: SVGSVGElement) => svg.classList.contains("mv-feliz");

  test("piscar: depois de 6 s, gsap anima .palpebra", () => {
    const svg = svgCompleto();
    darVida(svg, { gsap });
    vi.advanceTimersByTime(6000);
    expect(animou(svg.querySelector(".palpebra")!)).toBe(true);
  });

  test("piscar: parar() cancela", () => {
    const svg = svgCompleto();
    darVida(svg, { gsap }).parar();
    vi.advanceTimersByTime(10000);
    expect(gsap.to).not.toHaveBeenCalled();
  });

  test("comemorar(): liga mv-feliz e anima o .corpo", () => {
    const svg = svgCompleto();
    darVida(svg, { gsap }).comemorar();
    expect(feliz(svg)).toBe(true);
    expect(animou(svg.querySelector(".corpo")!)).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(feliz(svg)).toBe(false);
  });

  test("comemorarEm: pointerenter liga, pointerleave desliga", () => {
    const svg = svgCompleto();
    const b = botao();
    darVida(svg, { gsap, comemorarEm: "#botao" });
    ponteiro(b, "pointerenter");
    vi.advanceTimersByTime(1500);
    expect(feliz(svg)).toBe(true);
    ponteiro(b, "pointerleave");
    expect(feliz(svg)).toBe(false);
  });

  test("comemorarEm: focus e click também comemoram", () => {
    const svg = svgCompleto();
    const b = botao();
    darVida(svg, { gsap, comemorarEm: "#botao" });
    b.dispatchEvent(new FocusEvent("focus"));
    expect(feliz(svg)).toBe(true);
    b.dispatchEvent(new FocusEvent("blur"));
    expect(feliz(svg)).toBe(false);
    b.click();
    expect(feliz(svg)).toBe(true);
  });

  test("comemorarEm: seletor sem resultado não quebra", () => {
    expect(() => darVida(svgCompleto(), { gsap, comemorarEm: "#nao-existe" })).not.toThrow();
  });

  test("reduzido: comemorar() só liga mv-feliz, sem gsap", () => {
    movimento(true);
    const svg = svgCompleto();
    darVida(svg, { gsap }).comemorar();
    expect(feliz(svg)).toBe(true);
    expect(gsap.to).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(feliz(svg)).toBe(false);
  });

  test("reduzido: o botão ainda deixa a carinha feliz", () => {
    movimento(true);
    const svg = svgCompleto();
    const b = botao();
    darVida(svg, { gsap, comemorarEm: "#botao" });
    ponteiro(b, "pointerenter");
    expect(feliz(svg)).toBe(true);
    expect(gsap.to).not.toHaveBeenCalled();
  });
});
