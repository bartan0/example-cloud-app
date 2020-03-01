const express = require('express')
const {
	Request: SQLRequest,
	TYPES: SQLType
} = require('tedious')

const SQLServer = require('./sqlserver')


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
		.use(express.urlencoded({ extended: true }))

		.use((req, res, next) => {
			req.context = { db: SQLServer.getConnection() }
			next()
		})


		.use('/', (
			{
				body: { url },
				context: { db },
				method
			},
			res,
			next
		) => {
			const viewModel = {
				urls: [],
				errors: {}
			}
			let sqlParts = []
			let sqlReq = null
			let err

			switch (method) {

				case 'GET':
					sqlReq = new SQLRequest(
						'SELECT id, url FROM urls',
						e => err = e
					)

					sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
					break

				case 'POST':
					if (url)
						sqlParts.push(`
							IF NOT EXISTS (SELECT url FROM urls WHERE url = @url)
								INSERT INTO urls(url) VALUES (@url)
						`)
					else
						viewModel.errors.url = 'nonzero'

					sqlParts.push('SELECT id, url FROM urls')

					sqlReq = new SQLRequest(sqlParts.join('\n'), e => err = e)

					if (url)
						sqlReq.addParameter('url', SQLType.NVarChar, url)

					sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
					break
			}

			if (sqlReq) {
				sqlReq.on('requestCompleted', () => err ? next(err) : res.render('main', viewModel))
				db.execSql(sqlReq)
			}
		})


		.use((err, req, res, next) => {
			console.error('WWW Server', 'Toplevel', err.toString())

			res.sendStatus(500)
		})

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
