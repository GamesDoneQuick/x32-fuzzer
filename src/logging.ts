// Native
import * as path from 'path';

// Packages
import * as winston from 'winston';
import * as Transport from 'winston-transport';

const logPath = path.join(process.cwd(), 'logs/output.log');

const defaultFormats = [
	winston.format.timestamp(),
	winston.format.splat(),
	winston.format.prettyPrint(),
	winston.format.printf(info => {
		return `${info.timestamp} ${info.level}: ${info.message}`;
	}),
];

const transports: Transport[] = [
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			...defaultFormats,
		),
		level: 'info',
	}),
	new winston.transports.File({
		format: winston.format.combine(...defaultFormats),
		level: 'debug',
		filename: logPath,
		maxsize: 1000000, // 1MB
		maxFiles: 16,
		tailable: true,
	}),
];

export function createLogger(_: string): winston.Logger {
	return winston.createLogger({transports});
}
