const SendGrid = require('@sendgrid/mail')

const MailService = {
	KEY: process.env['MAIL_SENDGRID_KEY'],
	SENDER: process.env['MAIL_SENDER'] || 'rss@example.com'
}

MailService._init = function () {
	SendGrid.setApiKey(this.KEY)

	return this
}

MailService.send = function (receipient, subject, content) {
	return SendGrid.send({
		from: this.SENDER,
		to: receipient,
		subject,
		html: content
	})
}

module.exports = () => MailService._init()
