import { deslocamentoPupila } from "./olhar";

export { deslocamentoPupila };

/** O pedaço do GSAP que a biblioteca usa. Assim ninguém precisa instalar os tipos do GSAP. */
export interface GsapMinimo {
  to(alvo: Element | Element[], vars: Record<string, unknown>): unknown;
  set(alvo: Element | Element[], vars: Record<string, unknown>): unknown;
  killTweensOf(alvo: Element | Element[]): unknown;
}

export interface Opcoes {
  /** Seletor do elemento que faz o mascote comemorar (mouse em cima, foco ou clique). */
  comemorarEm?: string;
  /** Quanto as pupilas andam, em px do SVG. Padrão: 4. */
  maxOlhar?: number;
  /** Instância do GSAP. Se faltar, usa o `gsap` global. */
  gsap?: GsapMinimo;
}

export interface Controle {
  comemorar(): void;
  parar(): void;
}

const vivos = new WeakMap<SVGSVGElement, Controle>();

export function darVida(svg: SVGSVGElement, opcoes: Opcoes = {}): Controle {
  const existente = vivos.get(svg);
  if (existente) return existente;

  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = opcoes.gsap ?? (globalThis as { gsap?: GsapMinimo }).gsap;
  if (!gsap && !reduzido) throw new Error("mascote-vivo: carregue o GSAP antes de chamar darVida");

  const limpar: Array<() => void> = [];
  const ouvir = (alvo: EventTarget, tipo: string, fn: (e: Event) => void) => {
    alvo.addEventListener(tipo, fn, { passive: true });
    limpar.push(() => alvo.removeEventListener(tipo, fn));
  };

  const controle: Controle = {
    comemorar() {},
    parar() {
      limpar.forEach((fn) => fn());
      limpar.length = 0;
      vivos.delete(svg);
    },
  };
  vivos.set(svg, controle);
  if (reduzido || !gsap) return controle;

  const corpo = svg.querySelector(".corpo") ?? svg;
  limpar.push(() => gsap.killTweensOf(corpo));

  // Olhar: só mouse; no toque não há ponteiro para seguir.
  const pupilas = Array.from(svg.querySelectorAll<SVGGElement>(".pp"));
  const max = opcoes.maxOlhar ?? 4;
  let raf = 0, mx = 0, my = 0, viu = false;
  const olhar = () => {
    raf = 0;
    const r = svg.getBoundingClientRect();
    const { x, y } = deslocamentoPupila(mx - (r.left + r.width / 2), my - (r.top + r.height * 0.45), max);
    for (const p of pupilas) p.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  };
  const agendar = () => { if (viu && !raf) raf = requestAnimationFrame(olhar); };
  if (pupilas.length) {
    ouvir(window, "pointermove", (e) => {
      const p = e as PointerEvent;
      if (p.pointerType && p.pointerType !== "mouse") return;
      mx = p.clientX; my = p.clientY; viu = true;
      agendar();
    });
    ouvir(window, "scroll", agendar);
    limpar.push(() => cancelAnimationFrame(raf));
  }

  // Pular: clique ou toque.
  ouvir(svg, "pointerdown", () => {
    gsap.to(corpo, { y: -14, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 100%" });
  });

  return controle;
}
