// Ours
import {createHeartbeat} from './heartbeat';
import {createFuzzer, Fuzzer} from './fuzzer';

const NUM_FUZZERS = 9;

async function init(): Promise<void> {
	const heartbeatEvents = await createHeartbeat();

	const fuzzers: Fuzzer[] = [];
	for (let i = 0; i < NUM_FUZZERS; i++) {
		// eslint-disable-next-line no-await-in-loop
		const fuzzer = await createFuzzer();
		fuzzer.start();
		fuzzers.push(fuzzer);
	}

	heartbeatEvents.on('👻', () => {
		fuzzers.forEach(fuzzer => {
			fuzzer.stop();
		});
	});
}

init().catch(error => {
	console.error(error);

	setTimeout(() => {
		process.exit(1);
	}, 100);
});
