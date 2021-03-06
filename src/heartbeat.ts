// Native
import {EventEmitter} from 'events';

// Packages
import * as osc from 'osc';

// Ours
import {createLogger} from './logging';
import {createSocket} from './socket';

const HEARTBEAT_INTERVAL = 100;
const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 6;
const INIT_TIMEOUT = 5000;
const log = createLogger('heartbeat');
let timeout: NodeJS.Timeout;

export async function createHeartbeat(): Promise<Heartbeat> {
	const oscSocket = await createSocket();
	return new Heartbeat(oscSocket);
}

class Heartbeat extends EventEmitter {
	private _oscSocket: osc.UDPPort;

	private _toldEm = false;

	private _heartbeatInterval: NodeJS.Timeout;

	constructor(oscSocket: osc.UDPPort) {
		super();

		this._oscSocket = oscSocket;

		this._heartbeatInterval = setInterval(() => {
			sendHeartbeatRequest(this._oscSocket);
		}, HEARTBEAT_INTERVAL);

		log.info('Starting heartbeat.');

		const initTimeout = setTimeout(() => {
			log.error(
				'Failed to connect, is the mixer on and responding to pings?',
			);
			setTimeout(() => {
				process.exit(1);
			}, 100);
		}, INIT_TIMEOUT);

		this._oscSocket.on('raw', (buf: Buffer) => {
			const str = buf.toString('ascii');
			if (str.startsWith('/info')) {
				if (!this._toldEm) {
					log.info("Heartbeats workin'.");
					this._toldEm = true;
					clearTimeout(initTimeout);
				}

				clearTimeout(timeout);
				timeout = setTimeout(() => {
					log.error('Heartbeat expired 🤠');
					this.emit('👻');
					clearInterval(this._heartbeatInterval);
				}, HEARTBEAT_TIMEOUT);
			}
		});
	}
}

function sendHeartbeatRequest(oscSocket: osc.UDPPort): void {
	oscSocket.send({
		address: '/info',
		args: [],
	});
}
