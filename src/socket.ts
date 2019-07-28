// Packages
import * as osc from 'osc';
import * as getPort from 'get-port';

// Ours
import {createLogger} from './logging';
import {conf} from './config';

const X32_UDP_PORT = 10023;
let socketNumber = 0;

export async function createSocket(): Promise<osc.UDPPort> {
	const localPort = await getPort();
	const log = createLogger(`socket-${socketNumber++}`);
	return new Promise<osc.UDPPort>((resolve, reject) => {
		let settled = false;

		const oscSocket = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort,
			remoteAddress: conf.get('mixerIp'),
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
