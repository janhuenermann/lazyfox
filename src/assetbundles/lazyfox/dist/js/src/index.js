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

function initImage(image) {
	image._lazyfox = true
}

function loadImage(image) {
	image.srcset = image.dataset.srcset;
	image.src = image.dataset.src;

	delete image.dataset.srcset;
	delete image.dataset.src;

	function afterLoadImage() {
		image.parentNode.classList.remove("--not-loaded")
		
		setTimeout(() => {
			let placeholder = image.parentNode.querySelector(".--placeholder")
			placeholder.parentNode.removeChild(placeholder)
		}, 500)

		image.removeEventListener('load', afterLoadImage)
	} 

	image.addEventListener('load', afterLoadImage, { once: true })
}



function kickstartLazyFox() {
	let images = document.querySelectorAll(".lazyfox img[data-src]")
	let imagesArr = [].slice.call(images)
	let observer = null

	if (intersectionObserver.isSupported()) {
		observer = new intersectionObserver(imagesArr, initImage, loadImage)
	}
	else {
		observer = new fallbackObserver(imagesArr, initImage, loadImage)
	}

	if (window.MutationObserver) {
		new window.MutationObserver(debounce(() => {
			for (var i = 0; i < images.length; i++) {
				// skip already observed images
				if (images[i]._lazyfox) 
					continue

				observer.observe(images[i]._lazyfox)
			}
		}))
	}
}

document.addEventListener("DOMContentLoaded", kickstartLazyFox);