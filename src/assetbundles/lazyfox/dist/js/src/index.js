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
import blur from './appearance/blur'

var lazyfox = { 
	autoSize: new autoSize() 
}



function init(image) {
	image._lazyfox = { container: image.parentNode };
	image._lazyfox.placeholder = image._lazyfox.container.querySelector('.--placeholder')

	image._lazyfox.container.classList.add('--activated');

	if (image._lazyfox.container.classList.has('--blurred')) {
		blur(image); }
}

function present(image) {
	if (image.dataset.sizes == "auto") {
		lazyfox.autoSize.add(image);
		delete image.dataset.sizes;
	}
	else {
		image.sizes = image.dataset.sizes;
		delete image.dataset.sizes;
	}

	image.srcset = image.dataset.srcset;
	image.src = image.dataset.src;

	delete image.dataset.srcset;
	delete image.dataset.src;

	function afterPresent() {
		image.parentNode.classList.remove("--not-loaded")


		setTimeout(() => {
			let placeholder = image.parentNode.querySelector(".--placeholder")
			placeholder.parentNode.removeChild(placeholder)

			image.parentNode.classList.remove('--sized')
			image.parentNode.classList.remove('--activated');

			let sizer = image.parentNode.querySelector(".--sizer")
			sizer.parentNode.removeChild(sizer)
		}, 500)

		image.removeEventListener('load', afterPresent)
	} 

	image.addEventListener('load', afterPresent, { once: true })
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