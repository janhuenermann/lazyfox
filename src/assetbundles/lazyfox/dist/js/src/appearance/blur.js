import * as stackblur from '../vendor/stackblur'

const radius = 20
const scale = 10

export default function activate(lf) {
	let canvas = document.createElement('canvas')
	let ctx = canvas.getContext('2d');

	lf.container.insertBefore(canvas, lf.placeholder.nextSibling)

	let w = lf.placeholder.naturalWidth;
	let h = lf.placeholder.naturalHeight;

	canvas.width = w * scale;
	canvas.height = h * scale;
	ctx.drawImage(lf.placeholder, 0, 0, canvas.width, canvas.height);
	
	stackblur.canvasRGB(canvas, 0, 0, canvas.width, canvas.height, radius);
}