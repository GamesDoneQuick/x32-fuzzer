// Packages
import * as osc from 'osc';

// Ours
import {createLogger} from './logging';

const log = createLogger('socket');
const X32_UDP_PORT = 10023;

export async function createSocket() {
	return new Promise<osc.UDPPort>((resolve, reject) => {
		let settled = false;

		const oscSocket = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort: 52361,
			remoteAddress: '192.168.1.9',
			remotePort: X32_UDP_PORT,
			metadata: true,
		});

		oscSocket.on('error', error => {
			if (!settled) {
				reject(error);
				settled = true;
				return;
			}

			log.warn('Error:', error.stack);
		});

		oscSocket.on('open', () => {
			if (!settled) {
				resolve(oscSocket);
				settled = true;
			}

			log.info('Port open, can now communicate with a Behringer X32.');
		});

		oscSocket.on('close', () => {
			log.warn('Port closed.');
		});

		// Open the socket.
		oscSocket.open();
	});
}
