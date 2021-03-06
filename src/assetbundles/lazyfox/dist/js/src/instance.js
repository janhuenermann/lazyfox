
export class lazyfox {

	constructor (el) {
		this.container = el.parentNode
		this.placeholder = this.container.querySelector('.--placeholder')
		this.type = this.container.dataset.type
		this.image = el
		this.sizer = this.container.querySelector(".--sizer")
		this.done = false

		el._lf = (el.lazyfox = this)

		delete this.container.dataset.type;
	}

	activate(autoSize) {
		this.autoSize = autoSize
		this.container.classList.add('--activated');
	}

	present() {
		if (this.image.dataset.sizes == "auto") {
			this.autoSize.add(this.image);
			delete this.image.dataset.sizes;
		}
		else {
			this.image.sizes = this.image.dataset.sizes;
			delete this.image.dataset.sizes;
		}

		this.image.srcset = this.image.dataset.srcset;
		this.image.src = this.image.dataset.src;

		delete this.image.dataset.srcset;
		delete this.image.dataset.src;

		this.image.addEventListener('load', () => this.cleanup(), { once: true })
	}

	cleanup() {
		if (this.done)
			return

		this.container.classList.remove("--not-loaded")

		setTimeout(() => {
			this.container.removeChild(this.placeholder);

			this.container.classList.remove('--sized')
			this.container.classList.remove('--activated');

			this.container.removeChild(this.sizer);

			let canvas = this.container.getElementsByTagName('canvas')
			for (var i = 0; i < canvas.length; i++) {
				this.container.removeChild(canvas[i])
			}
		}, 500)

		this.done = true
	}

}