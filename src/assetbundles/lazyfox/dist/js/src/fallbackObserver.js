import { debounce } from './utils/debounce'

export default class {

	constructor (elements, init, callback) {
		this._elements = []
		this._running = false

		this.callback = callback
		this.init = init
		this.checker = debounce(() => this.update());
		

		for (var i = 0; i < elements.length; i++) {
			this.observe(elements[i])
		}
	}

	_startObserving () {
		if (this._running)
			return ;

		document.addEventListener("scroll", this.checker);
		window.addEventListener("resize", this.checker);
		window.addEventListener("orientationchange", this.checker);

		this.checker();
		this._running = true;
	}

	_stopObserving () {
		this._running = false;

		document.removeEventListener("scroll", checker);
		window.removeEventListener("resize", checker);
		window.removeEventListener("orientationchange", checker);
	}

	observe(element) {
		if (this.init) this.init(element)
		this._elements.push(element)

		if (this._elements.length === 1) {
			this._startObserving()
		}
	}

	update () {
		this._elements = this._elements.filter((el) => {
			if ((el.getBoundingClientRect().top <= window.innerHeight && el.getBoundingClientRect().bottom >= 0) && getComputedStyle(el).display !== "none") {
				this.callback(el);
				return false;
			}

			return true;
		});

		// clean-up
		if (this._elements.length === 0) {
			this._stopObserving()
		}
	}

} 