const SendGrid = require('@sendgrid/mail')

const MailService = {
	KEY: process.env['MAIL_SENDGRID_KEY'],
	SENDER: process.env['MAIL_SENDER'] || 'rss@example.com',
	TEST: !!process.env['MAIL_TEST_MODE']
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
		html: content,
		mail_settings: { sandbox_mode: { enable: this.TEST } }
	})
}

module.exports = () => MailService._init()
