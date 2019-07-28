// Packages
import * as osc from 'osc';
import * as getPort from 'get-port';

// Ours
import {createLogger} from './logging';

const log = createLogger('socket');
const X32_UDP_PORT = 10023;

export async function createSocket() {
	const localPort = await getPort();
	return new Promise<osc.UDPPort>((resolve, reject) => {
		let settled = false;

		const oscSocket = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort,
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
