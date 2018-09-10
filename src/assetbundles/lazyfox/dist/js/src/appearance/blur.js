import * as stackblur from '../vendor/stackblur'

const radius = 20
const scale = 10

export default function activate(lf) {
	let canvas = document.createElement('canvas');
	canvas.classList.add('--placeholder');
	canvas.width = 100;
	canvas.height = 100;

	let ctx = canvas.getContext('2d');

	lf.container.insertBefore(canvas, lf.placeholder.nextSibling)

	let w = lf.placeholder.naturalWidth;
	let h = lf.placeholder.naturalHeight;

	if (w == 0 && h == 0) {
		lf.placeholder.addEventListener('load', () => draw(ctx, canvas, lf))
	}
	else draw(ctx, canvas, lf)
}

function draw (ctx, canvas, lf) {
	ctx.drawImage(lf.placeholder, 0, 0, canvas.width, canvas.height);
	stackblur.processCanvasRGB(canvas, 0, 0, canvas.width, canvas.height, radius);
}