<svelte:head>
	<title>PERSO LIVE SDK DEMO</title>

	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
	<link rel='stylesheet' href='./global.css'>
	<script src="https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
	<script src="./index.js"></script>
	<script src="./wav-recorder.js"></script>
</svelte:head>

<script lang="ts">
	import {
		persoLiveApiServerUrl,
		useIntroMessage,
		chatbotWidth,
		chatbotHeight,
		enableVoiceChat
	} from '$lib/constant';
	import LiveChat from '$lib/components/LiveChat.svelte';
	import { onMount } from 'svelte';

	let submitted: boolean = false;
	let liveChatConfig: any;

	onMount(async () => {
		if (enableVoiceChat) {
			await createSession();
		}
	});

	async function createSession() {
		const response = await fetch('./session', { method: "GET" });
		if (response.ok) {
			submitted = true;
			const sessionId = (await response.json()).sessionId;
			liveChatConfig = {
				apiServerUrl: persoLiveApiServerUrl,
				sessionId: sessionId,
				useIntroMessage: useIntroMessage,
				chatbotWidth: chatbotWidth,
				chatbotHeight: chatbotHeight,
				enableVoiceChat: enableVoiceChat
			};
		}
	}
</script>

{#if !enableVoiceChat && !submitted}
	<button on:click={createSession} style="width: 96px; height : 48px; font-size:16px">Start</button>
{:else if (liveChatConfig != null)}
	<LiveChat {liveChatConfig}></LiveChat>
{/if}