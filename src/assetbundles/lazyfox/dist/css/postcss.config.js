module.exports = ctx => ({
	map: ctx.options.map,
  	parser: ctx.options.parser,
	plugins: [
		require('autoprefixer')({ grid: true })
	]
})