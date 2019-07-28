// Native
import * as fs from 'fs';

// Packages
import * as convict from 'convict';

export const conf = convict({
	mixerIp: {
		doc: 'The IP address of the Behringer X32 digital mixer.',
		format: 'ipaddress',
		default: '192.168.1.9',
	},
	fuzzing: {
		random: {
			doc:
				'If true, uses random data for each packet sent. Else, uses the same data for every packet.',
			format: Boolean,
			default: false,
		},
		bufferSize: {
			doc: 'How large of a buffer to send in each packet.',
			format: Number,
			default: 128,
		},
		numFuzzers: {
			doc: 'How many fuzzing clients to run in parallel.',
			format: Number,
			default: 9,
		},
	},
});

if (fs.existsSync('./config.json') && process.env.NODE_ENV !== 'test') {
	conf.loadFile('./config.json');
}

// Perform validation
conf.validate({allowed: 'strict'});
