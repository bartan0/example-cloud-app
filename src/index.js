path = require('path')
express = require('express')
tedious = require('tedious')

require('./server')
require('./sqlserver')


const init = async () => {
	try {
		// await SQLServer.connect()
		console.log('SQL Server: connected')

		await Server.start()
		console.log('WWW Server: started')

	} catch (err) {
		console.error(err.toString())

		await Server.stop()
		await SQLServer.disconnect()
	}
}


init()
