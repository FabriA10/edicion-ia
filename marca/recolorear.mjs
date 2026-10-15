// Cambia la paleta de color de todos los proyectos de una sola vez, girando el
// matiz de la paleta de base (azul marino neutro).
//
//   node marca/recolorear.mjs <matiz 0-360> [carpeta]
//
//   matiz     el matiz (H de HSL) de la marca nueva: 0 rojo, 30 naranja, 50 amarillo,
//             120 verde, 170 verde azulado, 220 azul (la paleta de base), 280 violeta,
//             330 rosa. Los neutros (claro, oscuro, blanco, grises) no se tocan.
//   carpeta   por defecto la carpeta `proyectos/` de este paquete.
//
// Solo cambia los colores que están en `paleta-base.json` (la paleta de marca: fondos
// oscuros, acentos y neón derivados). No toca los semáforos, el verde de WhatsApp, el
// azul de Instagram ni ningún color de personaje o de fotos. Se puede correr varias
// veces: `estado.json` recuerda en qué matiz quedó.
//
// Para colores exactos de una marca (no solo el matiz), editá además `MARCA` en
// `src/base/marca.ts` y `C` en el `base.ts` de cada motion graphic.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const aca = path.dirname(fileURLToPath(import.meta.url));
const destino = Number(process.argv[2]);
const carpeta = path.resolve(process.argv[3] ?? path.join(aca, "..", "proyectos"));
if (!Number.isFinite(destino)) {
  console.error("Uso: node marca/recolorear.mjs <matiz 0-360> [carpeta]");
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(path.join(aca, "paleta-base.json"), "utf8"));
const estadoArchivo = path.join(aca, "estado.json");
const actual = fs.existsSync(estadoArchivo) ? JSON.parse(fs.readFileSync(estadoArchivo, "utf8")).matiz : base.matizBase;

const aHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
};
const aRgb = (h, s, l) => {
  h /= 360;
  const f = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (!s) r = g = b = l;
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3);
  }
  return [r, g, b].map((x) => Math.round(x * 255));
};
const girar = ([r, g, b], matiz) => {
  const [h, s, l] = aHsl(r, g, b);
  return aRgb((h + (matiz - base.matizBase) + 360) % 360, s, l);
};
const hex = (v) => v.map((x) => x.toString(16).padStart(2, "0")).join("");
const deHex = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));

// mapas "como está hoy" -> "como tiene que quedar"
const mapaHex = new Map(), mapaRgb = new Map();
for (const h of base.hex) mapaHex.set(hex(girar(deHex(h), actual)), hex(girar(deHex(h), destino)));
for (const t of base.rgb) mapaRgb.set(girar(t, actual).join(","), girar(t, destino).join(","));

const archivos = [];
(function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== "out") recorrer(p); }
    else if (/\.(ts|tsx|js|mjs|py|json|svg|html|css|sh)$/.test(e.name)) archivos.push(p);
  }
})(carpeta);

let tocados = 0, cambios = 0;
for (const f of archivos) {
  const t = fs.readFileSync(f, "utf8");
  let n = 0;
  const r = t
    .replace(/#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, (m, h) => {
      const nuevo = mapaHex.get(h.toLowerCase());
      if (!nuevo) return m;
      n++;
      return "#" + (h === h.toUpperCase() && /[A-F]/.test(h) ? nuevo.toUpperCase() : nuevo);
    })
    .replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*[\d.]+\s*)?\)/g, (m, r1, g1, b1, a) => {
      const nuevo = mapaRgb.get(`${+r1},${+g1},${+b1}`);
      if (!nuevo) return m;
      n++;
      const [nr, ng, nb] = nuevo.split(",");
      return `rgb${a ? "a" : ""}(${nr}, ${ng}, ${nb}${a ?? ""})`;
    });
  if (n) { fs.writeFileSync(f, r); tocados++; cambios += n; }
}
fs.writeFileSync(estadoArchivo, JSON.stringify({ matiz: destino }) + "\n");
console.log(`Matiz ${actual} -> ${destino}: ${cambios} colores en ${tocados} archivos de ${carpeta}`);
