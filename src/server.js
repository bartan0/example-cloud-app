const express = require('express')


const Server = {
	PORT: process.env.PORT || 8080,
	STATIC_ROOT: process.env.HTTP_ROOT_STATIC || './static',
	VIEWS_ROOT: process.env.HTTP_ROOT_VIEWS || './views',

	$: {
		app: null,
		server: null
	}
}


Server._init = function () {
	const app = express()

	app.set('view engine', 'ejs')
	app.set('views', this.VIEWS_ROOT)

	this.$.app = app
		.use('/static', express.static(this.STATIC_ROOT))
		.get('/', (req, res) => res.render('main'))

	return this
}


Server.start = function () {
	this.$.server = this.$.app.listen(this.PORT)
}


Server.stop = function () {
	if (!this.$.server)
		return

	this.$.app = null
	this.$.server.close(() => {
		this.$.server = null
	})
}


module.exports = Server._init()
