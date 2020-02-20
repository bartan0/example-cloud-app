const { resolve } = require('path')
const express = require('express')

const config = require('./config')


const app = express()

app.set('view engine', 'ejs')
app.set('views', resolve(__dirname, 'views'))

app
	.use('/static', express.static(resolve(__dirname, 'static')))
	.get('/', (req, res) => res.render('main'))

	.listen(config.PORT)
