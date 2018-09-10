import * as stackblur from '../vendor/stackblur'

const radius = 20

export default function activate(image) {
	let lf = image._lazyfox
	let canvas = document.createElement('canvas')
	lf.container.insertAfter(canvas, lf.placeholder)

	stackblur.image(lf.placeholder, canvas, radius, false)
}