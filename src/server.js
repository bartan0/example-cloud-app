const express = require('express')
const {
	Request: SQLRequest,
	TYPES: SQLType
} = require('tedious')

const SQLServer = require('./sqlserver')
const RSS = require('./rss')


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
				params: { urlId },
				body: { action: action_arg, url },
				context: { db },
				method
			},
			res,
			next
		) => {
			const viewModel = {
				urls: [],
				errors: {},
				rss: []
			}
			const [ _, action, actionArg ]  = /^([a-z]+)(?::(.*))?$/.exec(action_arg) || []
			const sqlGetAll = 'SELECT id, url FROM urls'

			let sqlParts = []
			let sqlReq = null
			let err

			switch (method) {

				case 'GET':
					sqlReq = new SQLRequest(sqlGetAll, e => err = e)
					sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
					break

				case 'POST':
					switch (action) {
						case 'add':
							if (url)
								sqlParts.push(`
									IF NOT EXISTS (SELECT url FROM urls WHERE url = @url)
										INSERT INTO urls(url) VALUES (@url)
								`)
							else
								viewModel.errors.url = 'nonzero'

							sqlParts.push(sqlGetAll)

							sqlReq = new SQLRequest(sqlParts.join('\n'), e => err = e)

							if (url)
								sqlReq.addParameter('url', SQLType.NVarChar, url)

							sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
							break

						case 'remove':
							sqlReq = new SQLRequest([
								'DELETE FROM urls WHERE id = @id',
								sqlGetAll,
							].join('\n'), e => err = e)

							sqlReq.addParameter('id', SQLType.Int, actionArg)
							sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
							break

						case 'send':
							sqlReq = new SQLRequest(sqlGetAll, e => err = e)
							sqlReq.on('row', ([ { value: id }, { value: url } ]) => viewModel.urls.push({ id, url }))
							break

						default:
							next('wrong-action')
					}

					break

				default:
					next('wrong-method')
			}

			if (sqlReq) {
				sqlReq.on('requestCompleted', () => {
					if (err)
						return next(err)

					switch (action) {

						case 'send':
							Promise.all(viewModel.urls.map(({ url }) =>
								RSS.getRSS(url)
									.catch(err => console.error(err))
							))
								.then(rss => viewModel.rss = rss.filter(Boolean))
								.then(() => res.render('main', viewModel))
							break

						default:
							res.render('main', viewModel)
					}
				})
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
