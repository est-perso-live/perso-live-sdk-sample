<svelte:head>
    <style>
        p.title {
            font-size: 36px;
            font-weight: 800;
            margin-top: 38px;
            margin-bottom: 0px;
            line-height: 49px;
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
    import { Session, SessionConfig, type Chat } from '$lib/session';
    import { onDestroy, onMount, tick } from 'svelte';
	import Video from './Video.svelte';
	import ChatLog from './ChatLog.svelte';
	import ChatState from './ChatState.svelte';
	import ChatInput from './ChatInput.svelte';
	import VoiceChat from './VoiceChat.svelte';
	import TTSTFInput from './TTSTFInput.svelte';
	import STFInput from './STFInput.svelte';

    export let sessionConfig: SessionConfig;
    export let useIntro: boolean;

    let session: Session;
    let unsubscribes: (() => void)[] = [];

    let chatState: number = -1; // 0: available 1: recording 2: analyzing 3: AI speaking
    let sessionState: number = 0; // 0: Initial state(or closed) 1: starting 2: started
    let sessionButton: HTMLButtonElement;

    let videoWidth: number;
    let videoHeight: number;

    let chatLog: Array<Chat> = [];

    let chatStateDescriptionText: string = '';
    $: resetChatStateDescriptionText(chatState);

	onMount(async () => {
        videoWidth = sessionConfig.chatbotWidth / (sessionConfig.chatbotHeight / 540);
        videoHeight = 540;

        sessionState = 0;

        try {
            session = await Session.create(sessionConfig);

            chatState = 0;

            if (useIntro) {
                session.intro();
            }

            sessionState = 2;
        } catch (e) {
            alert(e);
            sessionState = 0;
            return;
        }

        const unsubscribeChatLog = session.subscribeChatLog((log) => {
            chatLog = log;
        });
        const unsubscribeChatStatus = session.subscribeChatStatus((state) => {
            chatState = state;
        });
        // this.removeSttResultCallback = session.setSttResultCallback((sttResult) => {
        //     if (sttResult !== '') {
        //         session.processChat(sttResult);
        //     } else {
        //         alert('Your voice was not recognized.');
        //     }
        // });
        const removeOnClose = session.onClose((manualClosed) => {
            if (!manualClosed) {
                setTimeout(() => {
                    session.getSessionInfo()
                        .then((response: any) => {
                            alert(response.termination_reason);
                        });
                }, 500);
            }

            sessionState = 0;
        });
        unsubscribes.push(unsubscribeChatLog, unsubscribeChatStatus,/* removeSttResultCallback,*/ removeOnClose);
	});

    onDestroy(() => {
        return () => {
            unsubscribes.forEach((unsubscribe) => {
                unsubscribe();
            })
        }
    });

    function onStopSessionClicked() {
        session.stopSession();
    }

    function onStopSpeechClicked() {
        session.clearBuffer();
    }

    function onMessageSubmit(message: string) {
        session.processChat(message);
    }

    function onTtstfMessageSubmit(message: string) {
        session.processTTSTF(message);
    }

    function onVoiceChatClicked() {
        if (chatState === 0) {
            session.startVoiceChat();
        } else {
            session.stopVoiceChat();
        }
    }

    function onStfFileChanged(file: File) {
        const isMp3 = file.name.endsWith("mp3");
        const isWav = file.name.endsWith("wav");
        let format;
        if (isMp3) {
            format = "mp3";
        } else if (isWav) {
            format = "wav";
        } else {
            return;
        }

        session.processSTF(file, format, "");
    }

    function onVideoReady(video: HTMLVideoElement) {
        session.setSrc(video);
    }

    async function resetChatStateDescriptionText(chatState: number) {
        if (chatState === 0) {
            chatStateDescriptionText = 'Available';
        } else if (chatState === 1) {
            chatStateDescriptionText = 'Recording';
        } else if (chatState === 2) {
            chatStateDescriptionText = 'Analyzing';
        }  else if (chatState === 3) {
            chatStateDescriptionText = 'AI Speaking';
        }
    }
</script>

<div style='display: block; padding-left: 47px;'>
    <p class='title'>Perso AI Live Chat SDK demo</p>
	<div style='display: flex; margin-top: 84px;'>
        {#if session != null}
        <Video width={videoWidth} height={videoHeight} onVideoReady={onVideoReady} />
        {:else}
        <div class='border1px' style='display:flex; width:{videoWidth}px; height:{videoHeight}px;'></div>
        {/if}
        <ChatLog chatLog={chatLog} />
	</div>
	<div style='display: block;'>
		<button
            bind:this={sessionButton}
            class='session'
            on:click={sessionState === 2 ? onStopSessionClicked : null}
            disabled={sessionState === 2 ? false : true}
        >
            {sessionState === 2 ? 'STOP' : 'START'}
        </button>
	</div>
    <ChatState
        enableStopSpeech={chatState == 3 ? true : false}
        chatStateDescriptionText={chatStateDescriptionText}
        onStopSpeechClicked={onStopSpeechClicked}
    />
    <ChatInput
        enableSendButton={chatState === 0 ? true : false}
        onMessageSubmit={onMessageSubmit}
    />
    {#if sessionConfig.enableVoiceChat}
    <VoiceChat
        enableButton={(chatState === 0 || chatState === 1) ? true : false}
        buttonText={chatState === 1 ? 'Stop' : 'Start'}
        onVoiceChatClicked={onVoiceChatClicked}
    />
    {/if}
    <TTSTFInput
        enableSendButton={chatState === 0 ? true : false}
        onMessageSubmit={onTtstfMessageSubmit}
    />
    <STFInput
        enableFileSelectButton={chatState === 0 ? true : false}
        onStfFileSelected={onStfFileChanged}
    />
    <br/>
</div>