const { resolve } = require('path')
const express = require('express')

const config = require('./config')


const app = express()

app.set('view engine', 'ejs')
app.set('views', resolve(__dirname, 'views'))

app
	.get('/', (req, res) => {
		res.redirect('/example')
	})
	.get('/:param', (req, res) => {
		res.render('index', {
			param: req.params.param
		})
	})

	.listen(config.PORT)
