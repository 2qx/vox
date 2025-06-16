<script lang="ts">
	import type {
		PostMessage,
		PostMessageDataRequest,
		PostMessageDataResponse
	} from '$lib/post-message';
	let sharedWorker: SharedWorker | undefined = undefined;

	const onWorkerMessage = ({
		data: { msg, data }
	}: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		console.log(msg, data);
	};

	const loadWorker = async () => {
		console.log('loading worker');
		const SharedWorker = await import('$lib/worker?sharedworker');
		sharedWorker = new SharedWorker.default();

		sharedWorker.port.onmessage = onWorkerMessage;
		const message: PostMessage<PostMessageDataRequest> = {
			msg: 'request1',
			data: { text: 'Hello World v2 🤪' }
		};
		sharedWorker.port.postMessage(message);

		console.log('message was posted?');
	};
</script>
