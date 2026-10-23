import { deslocamentoPupila } from "./olhar.js";

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

  const corpo = svg.querySelector(".corpo") ?? svg;
  let emCima = false, timer = 0;
  limpar.push(() => clearTimeout(timer));
  const fimDaFesta = () => { if (!emCima) svg.classList.remove("mv-feliz"); };

  const controle: Controle = {
    comemorar() {
      svg.classList.add("mv-feliz");
      if (reduzido || !gsap) {
        clearTimeout(timer);
        timer = window.setTimeout(fimDaFesta, 1500);
        return;
      }
      gsap.killTweensOf(corpo);
      gsap.to(corpo, { y: -10, rotation: 5, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 3, transformOrigin: "50% 100%", onComplete: fimDaFesta });
    },
    parar() {
      limpar.forEach((fn) => fn());
      limpar.length = 0;
      svg.classList.remove("mv-feliz");
      vivos.delete(svg);
    },
  };
  vivos.set(svg, controle);

  // Comemorar no botão: mouse em cima, foco do teclado ou clique (no celular é o toque).
  const alvo = opcoes.comemorarEm ? document.querySelector(opcoes.comemorarEm) : null;
  if (alvo) {
    const entrar = () => { emCima = true; controle.comemorar(); };
    const sair = () => { emCima = false; svg.classList.remove("mv-feliz"); };
    ouvir(alvo, "pointerenter", entrar);
    ouvir(alvo, "focus", entrar);
    ouvir(alvo, "pointerleave", sair);
    ouvir(alvo, "blur", sair);
    ouvir(alvo, "click", () => controle.comemorar());
  }

  if (reduzido || !gsap) return controle;
  limpar.push(() => gsap.killTweensOf(corpo));

  // Piscar: as pálpebras ficam recolhidas no topo e descem rapidinho, em intervalos aleatórios.
  const palpebras = Array.from(svg.querySelectorAll(".palpebra"));
  if (palpebras.length) {
    gsap.set(palpebras, { scaleY: 0, transformOrigin: "50% 0%" });
    let piscada = 0;
    const piscar = () => {
      gsap.to(palpebras, { scaleY: 1, duration: 0.08, yoyo: true, repeat: 1 });
      piscada = window.setTimeout(piscar, 2000 + Math.random() * 4000);
    };
    piscada = window.setTimeout(piscar, 2000 + Math.random() * 4000);
    limpar.push(() => { clearTimeout(piscada); gsap.killTweensOf(palpebras); });
  }

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
