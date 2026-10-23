import { vi } from "vitest";

const NS = "http://www.w3.org/2000/svg";

/** SVG com pupilas, pálpebras e corpo, já no documento. */
export function svgCompleto(): SVGSVGElement {
  document.body.innerHTML = `<svg xmlns="${NS}"><g class="corpo"><g class="palpebra"></g><g class="pp"></g></g></svg>`;
  return document.querySelector("svg")!;
}

export function svgVazio(): SVGSVGElement {
  document.body.innerHTML = `<svg xmlns="${NS}"></svg>`;
  return document.querySelector("svg")!;
}

/** GSAP falso: guarda as chamadas e termina cada animação 1 s depois. */
export function gsapFalso() {
  const fim = (vars: Record<string, unknown>) => {
    if (typeof vars.onComplete === "function") setTimeout(vars.onComplete as () => void, 1000);
  };
  return {
    to: vi.fn((_alvo: unknown, vars: Record<string, unknown>) => fim(vars)),
    set: vi.fn(),
    killTweensOf: vi.fn(),
  };
}

export function movimento(reduzido: boolean) {
  vi.stubGlobal("matchMedia", () => ({ matches: reduzido }));
}

export function ponteiro(alvo: EventTarget, tipo: string, props: Record<string, unknown> = {}) {
  const e = new Event(tipo, { bubbles: true });
  Object.assign(e, { pointerType: "mouse", clientX: 0, clientY: 0, ...props });
  alvo.dispatchEvent(e);
}
