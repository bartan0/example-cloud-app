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


		.get('/', (
			{ context: { db } },
			res,
			next
		) => {
			let err

			const urls = []
			const sqlReq = new SQLRequest(
				'SELECT id, url FROM urls',
				e => err = e
			)

			sqlReq.on('row', ([ { value: id }, { value: url } ]) => urls.push({ id, url }))
			sqlReq.on('requestCompleted', () => res.render('main', { urls }))

			db.execSql(sqlReq)
		})

		.post('/', (
			{
				body: { url },
				context: { db }
			},
			res,
			next
		) => {
			const sqlReq = new SQLRequest(
				'INSERT INTO urls(url) OUTPUT INSERTED.id VALUES (@url)',
				err => err ? next(err) : res.redirect('/')
			)

			sqlReq.addParameter('url', SQLType.NVarChar, url)
			sqlReq.on('row', ([ { value: id } ]) => {
				console.log('URL inserted', id)
			})

			db.execSql(sqlReq)
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
