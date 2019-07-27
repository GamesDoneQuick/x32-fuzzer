// Packages
import * as osc from 'osc';

// Ours
import {createLogger} from './logging';

const HEARTBEAT_INTERVAL = 100;
const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 3;
const log = createLogger('heartbeat');
let timeout: NodeJS.Timeout;

export function init(oscSocket: osc.UDPPort) {
	let toldEm = false;

	const heartbeatInterval = setInterval(() => {
		sendHeartbeatRequest(oscSocket);
	}, HEARTBEAT_INTERVAL);

	log.info('Starting heartbeat.');

	oscSocket.on('raw', (buf: Buffer) => {
		const str = buf.toString('ascii');
		if (str.startsWith('/info')) {
			if (!toldEm) {
				log.info("Heartbeats workin'.");
				toldEm = true;
			}

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeoutExpired(heartbeatInterval);
			}, HEARTBEAT_TIMEOUT);
		}
	});
}

function sendHeartbeatRequest(oscSocket: osc.UDPPort) {
	oscSocket.send({
		address: '/info',
		args: [],
	});
}

function timeoutExpired(heartbeatInterval: NodeJS.Timeout) {
	log.error('Heartbeat expired 🤠');
	clearInterval(heartbeatInterval);
}
