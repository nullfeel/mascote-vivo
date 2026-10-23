/** Quanto as pupilas andam na direção do ponteiro. A 90 px ou mais do centro, anda o máximo. */
export function deslocamentoPupila(dx, dy, max) {
    const d = Math.hypot(dx, dy) || 1;
    const k = (Math.min(d / 90, 1) * max) / d;
    return { x: dx * k, y: dy * k };
}
