/**
 * lazyfox plugin for Craft CMS
 *
 * lazyfox JS
 *
 * @author    Jan Hünermann
 * @copyright Copyright (c) 2018 Jan Hünermann
 * @link      janhuenermann.com
 * @package   Lazyfox
 * @since     0.0.1
 */

import { debounce } from './utils/debounce'
import intersectionObserver from './intersectionObserver'
import fallbackObserver from './fallbackObserver'
import autoSize from './autoSize'
import { lazyfox } from './instance'

let autoSizeInst = new autoSize()

function init(image) {
	image._lf = new lazyfox(image)
	image._lf.activate(autoSizeInst)
}

function present(image) {
	image._lf.present()
}

function kickstartLazyFox() {
	let images = document.querySelectorAll(".lazyfox img[data-src]")
	let imagesArr = [].slice.call(images)
	let observer = null

	if (intersectionObserver.isSupported()) {
		observer = new intersectionObserver(imagesArr, init, present)
	}
	else {
		observer = new fallbackObserver(imagesArr, init, present)
	}

	if (window.MutationObserver) {
		let mutations = new window.MutationObserver(debounce(() => {
			for (var i = 0; i < images.length; i++) {
				// skip already observed images
				if (images[i]._lf) 
					continue

				observer.observe(images[i])
			}
		}))

		var config = { attributes: false, subtree: true, childList: true, characterData: false };
		mutations.observe(document.body, config);
	}
}

kickstartLazyFox()

// document.addEventListener("DOMContentLoaded", kickstartLazyFox);