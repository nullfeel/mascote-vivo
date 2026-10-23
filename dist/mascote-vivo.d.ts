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
export declare function darVida(svg: SVGSVGElement, opcoes?: Opcoes): Controle;
