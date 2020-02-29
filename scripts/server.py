def run (ctx, cmd = None, *args, **config):
	ctx.execute('node', '.',
		env = {
			'DB_PASSWORD': ctx.DB_PASSWORD,
			'HTTP_ROOT_STATIC': './src/static',
			'HTTP_ROOT_VIEWS': './src/views'
		}
	)


def help ():
	print('Run server')
