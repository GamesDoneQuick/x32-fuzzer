// Packages
import * as osc from 'osc';
import {randomUniform} from 'd3-random';
// @ts-ignore
import prb = require('pseudo-random-buffer');

// Ours
import {createLogger} from './logging';
import {createSocket} from './socket';
import {conf} from './config';

const randomBytes = prb('lol here is a seed');
const FUZZ_INTERVAL = 0;
let fuzzerNumber = 0;
let cachedNonsenseOscMessage: osc.OscMessage = generateNonsenseOSC();

export async function createFuzzer(): Promise<Fuzzer> {
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

	start(): void {
		this._log.info('Starting.');
		this._fuzzInterval = setInterval(() => {
			this.sendNonsenseOSC();
		}, FUZZ_INTERVAL);
	}

	stop(): void {
		this._log.info('Stopping');
		clearInterval(this._fuzzInterval!);
	}

	sendRealGarbage(): void {
		const numBytes = Math.round(randomUniform(1, 1024)());
		const dataToSend = randomBytes(numBytes);
		this._oscSocket.socket.send(
			dataToSend,
			this._oscSocket.options.remotePort!,
		);
	}

	sendNonsenseOSC(): void {
		let oscMessage: osc.OscMessage;
		if (conf.get('fuzzing.random')) {
			oscMessage = generateNonsenseOSC();
			this._log.debug(JSON.stringify(oscMessage));
		} else {
			oscMessage = cachedNonsenseOscMessage;
		}

		this._oscSocket.send(oscMessage);
	}
}

function generateNonsenseOSC(): osc.OscMessage {
	const address = `/${randomString()}`;
	const args: osc.MetaArgument[] = [
		{
			type: 's',
			value: randomString(),
		},
		{
			type: 'b',
			value: randomBytes(conf.get('fuzzing.bufferSize')),
		},
		{
			type: 'f',
			value: randomUniform(-100, 100)(),
		},
		{
			type: 'i',
			value: Math.round(randomUniform(-1024, 1024)()),
		},
	];

	return {address, args};
}

function randomString(): string {
	return Math.random()
		.toString(36)
		.slice(2);
}
