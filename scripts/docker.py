def run (ctx, cmd = None, *args, **config):
	if cmd == 'db-connect':
		args += ( 'exec', 'db', '/opt/mssql-tools/bin/sqlcmd',
			'-Slocalhost',
			'-USA', '-P' + ctx.DB_PASSWORD
		)

	else:
		args = [ cmd, *args ]

	return ctx.execute('docker-compose', [
		'--project-name', ctx.PROJECT_NAME,
		'--file', './compose.yml',
		*args
	],
		env = {
			'DB_PASSWORD': ctx.DB_PASSWORD
		}
	)


def help ():
	pass
