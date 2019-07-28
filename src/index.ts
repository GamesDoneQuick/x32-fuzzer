// Ours
import {createHeartbeat} from './heartbeat';
import {createFuzzer} from './fuzzer';

async function init() {
	const heartbeatEvents = await createHeartbeat();
	const fuzzer = await createFuzzer();
	fuzzer.start();
	heartbeatEvents.on('👻', () => {
		fuzzer.stop();
	});
}

init().catch(error => {
	console.error(error);

	setTimeout(() => {
		process.exit(1);
	}, 100);
});
