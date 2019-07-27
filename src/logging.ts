// Native
import * as path from 'path';

// Packages
import * as winston from 'winston';
import * as Transport from 'winston-transport';

const logPath = path.join(process.cwd(), 'logs/output.log');

export function createLogger(label: string) {
	const format = winston.format.combine(
		winston.format.colorize(),
		winston.format.label({label}),
		winston.format.timestamp(),
		winston.format.splat(),
		winston.format.prettyPrint(),
		winston.format.printf(info => {
			return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
		}),
	);

	const transports = [
		new winston.transports.Console({
			format,
			level: 'debug',
		}),
	] as Transport[];

	transports.push(
		new winston.transports.File({
			format,
			level: 'debug',
			filename: logPath,
			maxsize: 1000000, // 1MB
			tailable: true,
			maxFiles: Infinity,
		}),
	);

	return winston.createLogger({transports});
}
