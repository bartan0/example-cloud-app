const { createSocket } = require('dgram')


const Logger = {
	HOST: process.env.LOG_HOST || 'localhost',
	PORT: process.env.LOG_PORT || '9000',
	NAME: process.env.LOG_NAME || '',

	$: {
		socket: null,
		consoleRef: console
	}
}

const LogLevel = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	ERROR: 'ERROR'
}


Logger._init = function () {
	return new Promise((resolve, reject) => {
		const sock = createSocket('udp4')

		sock.connect(this.PORT, this.HOST, err => {
			if (err)
				return reject()

			global.console = this

			this.$.socket = sock
			resolve()
		})
	})
}


Logger._log = function (level, msgs) {
	if (!this.$.socket)
		return

	const parts = {
		date: new Date().toISOString(),
		name: this.NAME,
		level,
		msg: msgs.map(x => x.toString()).join(' ')
	}

	this.$.socket.send(`${parts.date} ${parts.name} [${parts.level}] ${parts.msg}\n`)
}


Logger.log = function (...args) {
	this._log(LogLevel.DEBUG, args)
}


Logger.info = function (...args) {
	this._log(LogLevel.INFO, args)
}


Logger.error = function (...args) {
	this._log(LogLevel.ERROR, args)
}


Logger.close = function () {
	return new Promise((resolve, reject) => this.$.socket.close(err => {
		this.$.socket = null
		global.console = this.$.consoleRef

		return err ? reject(err) : resolve()
	}))
}


Logger._init()
module.exports = Logger
