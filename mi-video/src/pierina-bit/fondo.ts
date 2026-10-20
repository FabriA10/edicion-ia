// Fondo del local: mi-video/public/fondo_local.png (1080×1920, pantalla del celular TRANSPARENTE).
// Si se cambia la foto, hay que volver a medir estos puntos.

type P = {x: number; y: number};

export const FONDO = {
	archivo: 'fondo_local.png',
	// esquinas de la pantalla del celular (en perspectiva): arriba-izq, arriba-der, abajo-der, abajo-izq
	pantalla: {
		tl: {x: 447, y: 1050},
		tr: {x: 582, y: 1046},
		br: {x: 641, y: 1347},
		bl: {x: 509, y: 1372},
	},
	// borde superior del mostrador donde se agarra Bit: y = y0 + m·x
	borde: {y0: 1309, m: 0.504},
	// sombra debajo del canto (null = el frente del mostrador queda a la vista)
	canto: null as null | {y0: number; m: number},
	// dónde queda parado Bit después de trepar
	parado: {x: 250, y: 1418},
	// zona del celular que NO se desenfoca (x1, y1, x2) y altura hasta donde se desenfoca el fondo
	celular: {x1: 425, y1: 1025, x2: 665},
	desenfoqueHasta: 1250,
};

export const bordeY = (x: number) => FONDO.borde.y0 + FONDO.borde.m * x;
export const cantoY = (x: number) => (FONDO.canto ? FONDO.canto.y0 + FONDO.canto.m * x : 1920);
export const mesaY = (x: number) => FONDO.parado.y + FONDO.borde.m * (x - FONDO.parado.x);

const q = FONDO.pantalla;
export const PANTALLA_CENTRO: P = {x: (q.tl.x + q.tr.x + q.br.x + q.bl.x) / 4, y: (q.tl.y + q.tr.y + q.br.y + q.bl.y) / 4};
export const PANTALLA_ANCHO = (Math.hypot(q.tr.x - q.tl.x, q.tr.y - q.tl.y) + Math.hypot(q.br.x - q.bl.x, q.br.y - q.bl.y)) / 2;

// matrix3d que lleva un rectángulo w×h (origen arriba-izq) a las 4 esquinas de la pantalla
export const rectAPantalla = (w: number, h: number) => {
	const [p0, p1, p2, p3] = [q.tl, q.tr, q.br, q.bl];
	const dx1 = p1.x - p2.x;
	const dx2 = p3.x - p2.x;
	const dx3 = p0.x - p1.x + p2.x - p3.x;
	const dy1 = p1.y - p2.y;
	const dy2 = p3.y - p2.y;
	const dy3 = p0.y - p1.y + p2.y - p3.y;
	const den = dx1 * dy2 - dx2 * dy1;
	const g = (dx3 * dy2 - dx2 * dy3) / den;
	const hh = (dx1 * dy3 - dx3 * dy1) / den;
	const a = p1.x - p0.x + g * p1.x;
	const b = p3.x - p0.x + hh * p3.x;
	const d = p1.y - p0.y + g * p1.y;
	const e = p3.y - p0.y + hh * p3.y;
	return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, p0.x, p0.y, 0, 1].join(',')})`;
};
