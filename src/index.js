const express = require('express')

const config = require('./config')


const app = express()

app
	.get('/', (req, res) => {
		res.end('OK')
	})
	.listen(config.PORT)
