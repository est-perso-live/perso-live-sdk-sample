<svelte:head>
	<title>Perso AI Live Chat SDK demo</title>

	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
	<link rel='stylesheet' href='./global.css'>
	<script src="https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js"></script>
</svelte:head>

<script lang="ts">
	import LiveChat from '$lib/components/LiveChat.svelte';
	import { SessionConfig } from '$lib/session';
	import { onMount } from 'svelte';

	let submitted: boolean = false;
	let sessionConfig: SessionConfig;

	// Enter the LiveChat configuration.
	const useIntro = false;
	const chatbotWidth = 1080;
	const chatbotHeight = 1920;
	const enableVoiceChat = true;

	onMount(async () => {
		if (enableVoiceChat) {
			await createSession();
		}
	});

	async function createSession() {
		const response = await fetch('./session', { method: "GET" });
		if (response.ok) {
			submitted = true;
			const json = await response.json();
			const persoLiveApiServerUrl = json.persoLiveApiServerUrl;
			const sessionId = json.sessionId;

			sessionConfig = new SessionConfig(
				persoLiveApiServerUrl,
				sessionId,
				chatbotWidth,
				chatbotHeight,
				enableVoiceChat
			);
		}
	}
</script>

{#if !enableVoiceChat && !submitted}
	<button on:click={createSession} style="width: 96px; height : 48px; font-size:16px">Start</button>
{:else if (sessionConfig != null)}
	<LiveChat sessionConfig={sessionConfig} useIntro={useIntro}></LiveChat>
{/if}