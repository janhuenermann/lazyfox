export function debounce(fn) {
	let active = false;

	return function() {
		if (active === false) {
			active = true

			setTimeout(() => {
				fn()
				active = false
			}, 200);
		}
	}
}