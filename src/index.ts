// Ours
import {createSocket} from './socket';
import * as heartbeat from './heartbeat';

async function init() {
	const oscSocket = await createSocket();
	await heartbeat.init(oscSocket);
}

init().catch(error => {
	console.error(error);

	setTimeout(() => {
		process.exit(1);
	}, 100);
});
