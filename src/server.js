const Config = {
	PORT: 8080,
	STATIC_ROOT: './static',
	VIEWS_ROOT: './views'
}


const server = express()

server.set('view engine', 'ejs')
server.set('views', Config.VIEWS_ROOT)

server
	.use('/static', express.static(Config.STATIC_ROOT))
	.get('/', (req, res) => res.render('main'))

	.listen(Config.PORT)
