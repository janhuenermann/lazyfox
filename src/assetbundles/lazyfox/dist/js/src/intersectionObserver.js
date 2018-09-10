export default class {

	constructor (elements, init, callback) {
		this.callback = callback
		this.init = init
		this.observer = new IntersectionObserver(entries => this.update(entries), { threshold: 0.0 });
		
		for (var i = 0; i < elements.length; i++) {
			this.observe(elements[i])
		}
	}

	static isSupported () {
		return "IntersectionObserver" in window;
	}

	observe (el) {
		if (this.init) this.init(el)
		this.observer.observe(el)
	}

	update(entries) {
		for (var i = 0; i < entries.length; i++) {
			let entry = entries[i]
			if (entry.isIntersecting) {
				this.callback(entry.target)
				this.observer.unobserve(entry.target)
			}
		}
	}

}