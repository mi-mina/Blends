// Banner de cabecera: dibuja varios espirógrafos tipo "spirograph 01"
// (ver ../../spirograph 01/sketch.js) recortados por los bordes del
// contenedor, para que se lean como un patrón decorativo apaisado en
// vez de figuras completas.

import { colorA, colorB, colorC, colorD } from "./constants.js";

(function () {
  const container = document.getElementById("banner");
  if (!container) return;

  // xFrac/yFrac: centro como fracción del ancho/alto del canvas.
  // rFrac: radio exterior como fracción del alto del canvas (el alto
  // es la dimensión que manda para que el recorte quede bien en
  // pantallas anchas).
  const spirographs = [
    { n: 299, grad: 74375, xFrac: 0.15, yFrac: 0.2, rFrac: 1.4 },
    { n: 300, grad: 37063, xFrac: 0.5, yFrac: 0.8, rFrac: 1.3 },
    { n: 300, grad: 29550, xFrac: 0.85, yFrac: 0.3, rFrac: 1.3 },
  ];

  const palette = [colorA, colorB, colorC, colorD];

  // Dos colores distintos al azar de la paleta de la app.
  function pickTwoDistinctColors() {
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  // Transparencia aplicada al trazo para matizar los colores vivos de
  // la app sobre el fondo blanco del banner (0-1).
  const strokeAlpha = 0.55;

  // p.color("#rrggbb", alpha) no aplica el alpha (esa sobrecarga es
  // solo para valores de gris numéricos), así que convertimos a rgba()
  // a mano.
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const sketch = p => {
    function drawSpirograph(cx, cy, outerR, n, grad, colors) {
      const r = 0.5;
      const innerR = outerR * r;
      const gradValue = grad / 1000;
      const mutedColors = colors.map(c => hexToRgba(c, strokeAlpha));

      p.push();
      p.translate(cx, cy);

      let index = 0;
      for (let a = 0; a < p.TWO_PI; a += p.PI / n) {
        const skew1 = gradValue * a;
        const skew2 = skew1 * 2;
        const alfa1 = skew1 + a;
        const alfa2 = skew2 + a;

        const x1 = innerR * p.cos(alfa1);
        const y1 = innerR * p.sin(alfa1);
        const x2 = outerR * p.cos(alfa2);
        const y2 = outerR * p.sin(alfa2);

        p.stroke(index % 2 !== 0 ? mutedColors[0] : mutedColors[1]);
        p.line(x1, y1, x2, y2);

        index++;
      }

      p.pop();
    }

    p.setup = () => {
      const c = p.createCanvas(container.clientWidth, container.clientHeight);
      c.parent(container);
      p.noLoop();

      for (const s of spirographs) {
        s.colors = pickTwoDistinctColors();
      }
    };

    p.draw = () => {
      p.background(255);
      p.strokeWeight(1);
      p.noFill();

      for (const s of spirographs) {
        drawSpirograph(
          p.width * s.xFrac,
          p.height * s.yFrac,
          p.height * s.rFrac,
          s.n,
          s.grad,
          s.colors,
        );
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(container.clientWidth, container.clientHeight);
      p.redraw();
    };
  };

  new p5(sketch);
})();
