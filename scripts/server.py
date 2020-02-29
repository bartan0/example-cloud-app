def run (ctx, cmd = None, *args, **config):
	ctx.execute('node', '.',
		cwd = './src',
		env = {
			'DB_PASSWORD': ctx.DB_PASSWORD
		}
	)


def help ():
	print('Run server')
