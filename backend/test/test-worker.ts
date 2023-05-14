import { workerData, parentPort, isMainThread } from "worker_threads";
if (!isMainThread) {
	const valuex2 = workerData.value * 2;
	parentPort.postMessage({
		value: valuex2,
	});
}
