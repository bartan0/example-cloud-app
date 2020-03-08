const { parseStringPromise } = require('xml2js')
const { request: httpRequest } = require('http')
const { request: httpsRequest } = require('https')

const _fetchRSSData = url => new Promise((resolve, reject) => {
	httpsRequest(url, res => {
		const buffer = []

		res
			.on('data', chunk => buffer.push(chunk))
			.on('end', () => resolve(buffer.join('')))
	})
		.on('error', err => reject(err))
		.end()
})


const getRSS = url => _fetchRSSData(url)
	.then(data => parseStringPromise(data))
	.then(({ rss }) => {
		const channel = ((rss || {}).channel || [])[0]

		if (!channel)
			throw [ 'rss-no-channel', url ]

		const channelTitle = (channel.title || [])[0] || ''
		const items = (channel.item || []).map(({
			title,
			description
		}) => ({
			title: (title || [])[0] || '',
			description: (description || [])[0] || ''
		}))

		return {
			title: channelTitle,
			items
		}
	})


module.exports = {
	getRSS
}
