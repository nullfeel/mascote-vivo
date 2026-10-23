import { deslocamentoPupila } from "../src/olhar";

test("longe do mascote, anda o máximo na direção do mouse", () => {
  expect(deslocamentoPupila(300, 0, 4)).toEqual({ x: 4, y: 0 });
});

test("perto, anda proporcional à distância (90px = máximo)", () => {
  const r = deslocamentoPupila(0, 45, 4);
  expect(r.x).toBeCloseTo(0);
  expect(r.y).toBeCloseTo(2);
});

test("mouse em cima do centro não gera NaN", () => {
  expect(deslocamentoPupila(0, 0, 4)).toEqual({ x: 0, y: 0 });
});
