// Native
import {randomBytes} from 'crypto';

// Packages
import * as osc from 'osc';
import {randomUniform} from 'd3-random';

// Ours
import {createLogger} from './logging';
import {createSocket} from './socket';

const FUZZ_INTERVAL = 10;
let fuzzerNumber = 0;

export async function createFuzzer() {
	const oscSocket = await createSocket();
	return new Fuzzer(oscSocket);
}

export class Fuzzer {
	private _oscSocket: osc.UDPPort;

	private _log = createLogger(`fuzzer-${fuzzerNumber++}`);

	private _fuzzInterval?: NodeJS.Timeout;

	constructor(oscSocket: osc.UDPPort) {
		this._oscSocket = oscSocket;
	}

	start() {
		this._log.info('Starting.');
		this._fuzzInterval = setInterval(() => {
			this.sendRealGarbage();
		}, FUZZ_INTERVAL);
	}

	stop() {
		this._log.info('Stopping');
		clearInterval(this._fuzzInterval!);
	}

	sendRealGarbage() {
		const numBytes = Math.round(randomUniform(1, 512)());
		this._oscSocket.socket.send(
			randomBytes(numBytes),
			this._oscSocket.options.remotePort!,
		);
	}
}
