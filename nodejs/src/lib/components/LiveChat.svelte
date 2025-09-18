<svelte:head>
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
            width: 1034px;
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
	import { enableVoiceChat } from '$lib/constant';
    import { onMount } from 'svelte';

    export let liveChatConfig;

	onMount(async () => {
        startSession(
			liveChatConfig.apiServerUrl,
			liveChatConfig.sessionId,
            liveChatConfig.useIntroMessage,
			liveChatConfig.chatbotWidth,
			liveChatConfig.chatbotHeight,
			liveChatConfig.enableVoiceChat
		); // index.js
	});
</script>

<div style="display: block; padding-left: 47px;">
    <p class="title">Perso AI Live Chat SDK demo</p>
	<div id="chatbotContainer" style="display: flex; margin-top: 84px;">
		<video id="video" class="landscape" autoplay playsinline></video>
		<ul id="chatLog" class="chat-log">
		</ul>
	</div>
	<div id="configContainer" style="display: block;">
		<button id="sessionButton" class="session" onclick="onSessionClicked();">START</button>
	</div>
    <div id="chatStateContainer" class="input-method-container">
        <p style="width: 150px; margin-left: 14px; font-size: 24px; line-height: 28px;">Chat state : </p>
        <p id="chatStateDescription" style="width: 697px; margin-left: 14px; font-size: 24px; line-height: 28px;">Available</p>
        <button id="stopSpeech" style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;" onclick="onSendMessageClicked()">Stop Speech</button>
    </div>
    <div id="inputMethodContainer1" class="input-method-container">
        <input id="message" type="text" style="width: 863px; height: 72px; font-size: 24px; padding-inline: 10px; margin-left: 12px;" onkeypress="onMessageKeyPress(event)" />
        <button id="sendMessage" style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;" onclick="onSendMessageClicked()">Send</button>
    </div>
    <div id="inputMethodContainer2" class="input-method-container" style="display: {liveChatConfig.enableVoiceChat ? "flex": "none"}">
        <p style="width: 150px; margin-left: 14px; font-size: 24px; line-height: 28px;">Voice chat</p>
        <button id="voice" onclick="onVoiceChatClicked()" style="width: 128px; height: 52px; margin-left: 14px; font-size: 24px; line-height: 28px;">Start</button>
    </div>
    <div id="inputMethodContainer3" class="input-method-container">
        <p style="width: 300px; margin-left: 14px; font-size: 24px; line-height: 28px;">Make the chatbot speak using text</p>
        <input id="ttfMessage" type="text" style="width: 543px; height: 72px; font-size: 24px; padding-inline: 10px; margin-left: 18px;" />
        <button id="sendTtfMessage" style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;" onclick="onTtstfMessageSubmit()">Send</button>
    </div>
    <div id="inputMethodContainer4" class="input-method-container">
        <p style="width: 300px; margin-left: 14px; font-size: 24px; line-height: 28px;">Make the chatbot speak using audio(Experimental)</p>
        <input type="file" id="fileSelector" accept="audio/wav, audio/mp3" style="margin-left: 14px;" onclick="this.value=null" onchange="onStfFileChanged(event)" />
    </div>
    <div id="inputMethodContainer5" class="input-method-container" style="display: {liveChatConfig.enableVoiceChat ? "flex": "none"};">
        <p style="margin-left: 14px; font-size: 24px; line-height: 28px;">Record user voice</p>
        <button id="record" onclick="onRecordVoiceClicked()" style="width: 128px; height: 52px; margin-left: 14px; font-size: 24px; line-height: 28px;">Record</button>
    </div>
    <br/>
</div>