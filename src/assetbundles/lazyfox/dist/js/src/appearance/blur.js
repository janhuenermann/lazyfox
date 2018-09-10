import * as stackblur from '../vendor/stackblur'

const radius = 20

export default function activate(lf) {
	let canvas = document.createElement('canvas')
	lf.container.insertBefore(canvas, lf.placeholder.nextSibling)

	stackblur.image(lf.placeholder, canvas, radius, false)
}