// Packages
import * as osc from 'osc';
import {randomUniform} from 'd3-random';
// @ts-ignore
import prb = require('pseudo-random-buffer');

// Ours
import {createLogger} from './logging';
import {createSocket} from './socket';

const randomBytes = prb('lol here is a seed');
const FUZZ_INTERVAL = 10;
let fuzzerNumber = 0;

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
		const address = `/${randomString()}`;
		const args: osc.MetaArgument[] = [
			{
				type: 's',
				value: randomString(),
			},
			{
				type: 'b',
				value: randomBytes(32),
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

		this._log.debug('%s %s', address, JSON.stringify(args));

		this._oscSocket.send({
			address,
			args,
		});
	}
}

function randomString(): string {
	return Math.random()
		.toString(36)
		.slice(2);
}
