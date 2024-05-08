<svelte:head>
    <title>PERSO LIVE SDK DEMO</title>

	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
	<link rel='stylesheet' href='./global.css'>
	<script src='https://est-perso-live.github.io/perso-live-sdk/js/v1.0.0/perso-live-sdk.js'></script>
	<script src='./index.js'></script>

    <style>
		.message-container {
			display: flex;
			flex-direction: column;
		}
		.message-container.user {
			margin-left: auto;
			align-items: flex-end;
		}
		.message-container.other {
			margin-right: auto;
			align-items: flex-start;
		}
		.message {
			padding: 18px 20px;
			border-radius: 20px;
			max-width: 315px;
			box-sizing: border-box;
			margin: 0px 0px 10px 0px;
		}
		.user-message {
			margin-left: auto;
			background-color: white;
			color: black;
			font-size: 16px;
			letter-spacing: -0.01em;
			line-height: 150%;
			overflow-wrap: break-word;
		}
		.other-message {
			background-color: #343434;
			color: white;
			font-size: 16px;
			letter-spacing: -0.01em;
			line-height: 150%;
			overflow-wrap: break-word;
		}
		.timestamp {
			display: block;
			margin: 8px 12px;
			font-size: 12px;
			color: black;
			text-align: right;
		}
		p.title {
			font-size: 36px;
			font-weight: 800;
			margin-top: 38px;
			margin-bottom: 0px;
			line-height: 49px;
		}
		video {
			border: 1px;
			border-color: black;
			border-style: solid;
		}
		video.portrait {
			display: flex;
			width: 304px;
			height: 540px;
		}
		video.landscape {
			width: 960px;
			height: 540px;
		}
		ul.chat-log {
			display: flex;
			flex-direction: column-reverse;
			overflow-y: auto;
			flex-grow: 1;
			padding-inline: 10px;
			width: 400px;
			height: 540px;
			max-width: 400px;
			border: 1px;
			border-color: black;
			border-style: solid;
			margin: 0px;
			background-color: #999999;
			list-style: none;
		}
		button.session {
			width: 380px;
			height: 56px;
			background-color: #644AFF;
			font-weight: 700;
			font-size: 16px;
			color: white;
			border-style: none;
			border-radius: 4px;
			margin-top: 24px;
		}
		button.session:disabled {
			background-color: #acabb2;
		}
		.input-method-container {
			display: flex;
			align-items: center;
			border: 1px;
			border-color: #979797;
			border-width: 1px;
			border-style: solid;
			margin-top: 18px;
			width: 1000px;
			height: 95px;
		}
		.transparent {
			background-color: transparent;
		}
		body {
			padding: 0px;
			margin: 0px;
		}
	</style>
</svelte:head>

<script lang="ts">
	import { onMount } from 'svelte';
	import { persoLiveApiServerUrl } from '$lib/constant';

	onMount(async () => {
		load(persoLiveApiServerUrl); // index.js
	});
</script>

<div style="display: block; padding-left: 47px;">
    <p class="title">PERSO LIVE SDK DEMO</p>
	<div id="chatbotContainer" style="visibility: visible; display: flex; margin-top: 84px;">
		<video id="video" class="landscape" autoplay playsinline onclick="onVideoClicked()"></video>
		<ul id="chatLog" class="chat-log">
		</ul>
	</div>
	<div id="inputMethodContainer" class="input-method-container" style="visibility: visible;">
		<button id="record" onclick="onRecordClicked()" style="width: 128px; height: 72px; margin-left: 14px; font-size: 24px; line-height: 28px;"></button>
		<input id="message" type="text" style="width: 715px; height: 72px; font-size: 24px; padding-inline: 10px; margin-left: 18px;" onkeypress="onMessageKeyPress(event)" />
		<button id="sendMessage" style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;" onclick="onMessageSubmit()">Send</button>
	</div>
    <br/>
</div>