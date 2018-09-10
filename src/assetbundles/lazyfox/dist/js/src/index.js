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
	let images = document.querySelectorAll("picture.lazyfox img[data-src]")
	let imagesArr = [].slice.call(images)
	let observer = null

	if (intersectionObserver.isSupported()) {
		observer = new intersectionObserver(imagesArr, init, present)
	}
	else {
		observer = new fallbackObserver(imagesArr, init, present)
	}

	if (window.MutationObserver) {
		let mutations = new window.MutationObserver(records => {
			for (var i = 0; i < records.length; i++) {
				let record = records[i]
				for (var j = 0; j < record.addedNodes.length; j++) {
					let node = record.addedNodes[j]
					if (!node._lf
						&& node instanceof HTMLElement
						&& node.tagName === "IMG"
						&& node.parentNode.tagName === "PICTURE"
						&& node.parentNode.classList.contains('lazyfox')
						&& node.dataset.src) {
						observer.observe(node)
					} 
				}
			}
		})

		var config = { subtree: true, childList: true };
		mutations.observe(document.documentElement, config);
	}
}

kickstartLazyFox()

// document.addEventListener("DOMContentLoaded", kickstartLazyFox);