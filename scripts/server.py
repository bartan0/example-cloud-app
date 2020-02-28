def run (ctx, cmd = None, *args, **config):
	ctx.execute('node', '.',
		cwd = './src'
	)


def help ():
	print('Run server')
