const { Connection, Request } = tedious


SQLServer = {
	DBNAME: process.env['DB_NAME'] || 'develop',
	HOST: process.env['DB_HOST'] || 'localhost',
	USERNAME: process.env['DB_USERNAME'] || 'SA',
	PASSWORD: process.env['DB_PASSWORD'] || '',

	$: {
		conn: null
	}
}


const tables = [
	[ 'users', `CREATE TABLE users (
		id INT,
		email NVARCHAR(256),
		auth_hash NVARCHAR(256)
	)` ],
	[ 'urls', `CREATE TABLE urls (
		id INT,
		url NVARCHAR(1024)
	)` ]
]


const sqlIfNoTable = ([ name, sql ]) => `
	IF '${name}' NOT IN ( SELECT name FROM sys.tables )
	BEGIN
		${sql}
	END
`


SQLServer._createDatabase = function () {
	return new Promise((resolve, reject) => this.$.conn.execSql(
		new Request(`
			IF '${this.DBNAME}' NOT IN ( SELECT name FROM sys.databases )
				CREATE DATABASE ${this.DBNAME}
		`, err => err
			? reject(err)
			: resolve()
		)
	))
}


SQLServer._useDatabase = function () {
	return new Promise((resolve, reject) => this.$.conn.execSql(
		new Request('use ' + this.DBNAME, err => err ? reject(err) : resolve())
	))
}


SQLServer._createTables = function () {
	return new Promise((resolve, reject) => this.$.conn.execSql(
		new Request(
			tables.map(spec => sqlIfNoTable(spec)).join('\n'),
			err => err ? reject(err) : resolve()
		)
	))
}


SQLServer.connect = function () {
	return new Promise((resolve, reject) => {
		this.$.conn = new Connection({
			server: this.HOST,
			options: {},
			authentication: {
				type: 'default',
				options: {
					userName: this.USERNAME,
					password: this.PASSWORD
				}
			}
		})
			.on('connect', err => {
				if (!err)
					return resolve()

				this.$.conn = null
				reject(err)
			})
	})
		.then(() => this._createDatabase())
		.then(() => this._useDatabase())
		.then(() => this._createTables())
}


SQLServer.disconnect = function () {
	return new Promise(resolve => {
		if (!this.$.conn)
			return resolve()

		this.$.conn.on('end', () => resolve())
		this.$.conn.close()
		this.$.conn = null
	})
}
