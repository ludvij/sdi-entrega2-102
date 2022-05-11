const {createLogger, transports, format } = require('winston')
const {combine, timestamp, printf} = format

const fmt = printf(({level, message, timestamp}) => {
	return `${timestamp} [${level}] : ${message}`
})

const logger = createLogger({
	transports: [
		new transports.Console(),
		new transports.File({filename:"log/logs.log"})
	],
	format: combine(
		timestamp(),
		fmt
	)
});


module.exports = logger;