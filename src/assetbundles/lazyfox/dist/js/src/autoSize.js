import { debounce } from './utils/debounce'

export default class autoSize {

	constructor () {
		if ("ResizeObserver" in window) {
			// This is great news!
			this.resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					let width = entry.contentRect.width;
					let el = entry.target;
					this.update(el, width);
				}
			});
		}

		else {
			let debouncedResize = debounce(() => this.resize())
			window.addEventListener("resize", debouncedResize)
		}

		this.elements = [];
	}

	add (el) {
		let sources = [ image ];
		if (image.parentNode.tagName == "picture") {
			sources = sources.concat(image.getElementsByTagName("source"));
		}
		
		el._imageSources = sources;	

		// initial set
		this.update(el);

		if (this.resizeObserver) {
			this.resizeObserver.observe(el);
		}

		this.elements.push(el);
	}

	update (el, width) {
		let width = width || autoSize.getOffsetWidth(image);
		for (var i = 0; i < el._imageSources.length; i++) {
			el._imageSources[i].setAttribute("sizes", width + "px")
		}
	}

	resize () {
		for (var i = 0; i < this.elements.length; i++) {
			this.update(this.elements[i])
		}
	}

	// Traverses up the DOM until it finds a reasonable sized element.
	static getOffsetWidth(el) {
		let width;

		do {
			width = el.offsetWidth;
			el = el.parentNode;
		} while (width < 10 && el);

		return width;
	}

} 

