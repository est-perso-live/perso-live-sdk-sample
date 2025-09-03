var session = null;
var config = null;
var recording = false;
var chatState = 0; // 0: available 1: recording 2: analyzing 3: AI speaking
var sessionState = 0; // 0: Initial state(or closed) 1: starting 2: started
var removeOnClose = null;
var unsubscribeChatStatus = null;
var unsubscribeChatLog = null;
var unsubscribeStfStartEvent = null;
var removeSttResultCallback = null;
var recorder = null;

function onSessionClicked() {
    if (this.sessionState === 0) {
        startSession();

        applySessionState(1);
    } else if (this.sessionState === 2) {
        stopSession();
    }
}

function onVoiceChatClicked() {
    var voiceChatButton = document.getElementById("voice");
    if (voiceChatButton.disabled) {
        return;
    }

    if (canRecord()) {
        session.startVoiceChat();
        recording = true;
    } else {
        session.stopVoiceChat();
        recording = false;
    }
}

function onSendMessageClicked() {
    if (chatState === 3) {
        stopSpeech();
    } else {
        sendMessage();
    }
}

function onMessageKeyPress(keyEvent) {
    if (keyEvent.key === 'Enter') {
        sendMessage();
    }
}

function onTtstfMessageSubmit() {
    var messageElement = document.getElementById("ttfMessage");
    var message = messageElement.value.trim();
    if (message.length > 0) {
        messageElement.value = "";
        session.processTTSTF(message);
    }
}

function onStfFileChanged(event) {
    const file = event.target.files[0];
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

function onRecordVoiceClicked() {
    if (canRecord()) {
        startVoiceRecording();
        recording = true;
    } else {
        stopVoiceRecording();
        recording = false;
    }
}

async function startSession(apiServer, sessionId, useIntroMessage, width, height, enableVoiceChat) {
    applySessionState(0);

    if (this.removeOnClose != null) {
        this.removeOnClose();
    }
    if (this.unsubscribeChatStatus != null) {
        this.unsubscribeChatStatus();
    }
    if (this.unsubscribeChatLog != null) {
        this.unsubscribeChatLog();
    }
    if (this.unsubscribeStfStartEvent != null) {
        this.unsubscribeStfStartEvent();
    }
    if (this.removeSttResultCallback != null) {
        this.removeSttResultCallback();
    }

    try {
        session = await PersoLiveSDK.createSession(apiServer, sessionId, width, height, enableVoiceChat);

        const videoElement = document.getElementById("video");

        const videoWidth = width / (height / 540);
        const videoHeight = 540;
        videoElement.style = `width:${videoWidth}px; height:${videoHeight}px;`;
        const chatbotContainer = document.getElementById("chatbotContainer");
        chatbotContainer.style.visibility = "visible";

        session.setSrc(videoElement);

        applyChatState(0);

        if (useIntroMessage) {
            session.intro();
        }

        applySessionState(2);
    } catch (e) {
        alert(e);
        applySessionState(0);
        return;
    }

    refreshChatLog([]);
    this.unsubscribeChatLog = session.subscribeChatLog((chatLog) => {
        refreshChatLog(chatLog);
    });
    this.unsubscribeChatStatus = session.subscribeChatStatus((status) => {
        applyChatState(status);
    });
    this.unsubscribeStfStartEvent = session.subscribeStfStartEvent((stfStartEvent) => {
        console.log(`${stfStartEvent.name}-${stfStartEvent.duration}`);
    });
    // this.removeSttResultCallback = session.setSttResultCallback((sttResult) => {
    //     if (sttResult !== '') {
    //         session.processChat(sttResult);
    //     } else {
    //         alert('Your voice was not recognized.');
    //     }
    // });
    this.removeOnClose = session.onClose((manualClosed) => {
        if (!manualClosed) {
            setTimeout(() => {
                PersoLiveSDK.getSessionInfo(apiServer, session.getSessionId())
                    .then((response) => {
                        alert(response.termination_reason);
                    });
            }, 500);
        }

        applySessionState(0);
    });
}

function stopSession() {
    session.stopSession();
}

function sendMessage() {
    var messageElement = document.getElementById("message");
    var message = messageElement.value.trim();
    if (message.length > 0) {
        messageElement.value = "";
        session.processChat(message);
    }
}

function stopSpeech() {
    if (chatState === 3) {
        session.clearBuffer();
    }
}

function startVoiceRecording() {
    var recordButton = document.getElementById("record");
    recordButton.innerText = "Stop";

    recorder = new WavRecorder(session.getLocalStream()); // wav-recorder.js

    recorder.start();
}

async function stopVoiceRecording() {
    var recordButton = document.getElementById("record");
    recordButton.innerText = "Record";

    const wavFile = await recorder.stop();
    recorder = null;

    // ex. Save as an actual file
    saveAs(wavFile, "recording.wav"); // FileSaver.js
}

function canRecord() {
    return !recording && chatState === 0;
}

function refreshChatLog(chatList) {
    var chatLog = document.getElementById("chatLog");
    chatLog.innerHTML = "";
    chatList.forEach(chat => {
        var li = document.createElement("li");
        if (chat.isUser) {
            li.classList = "message-container user";
        } else {
            li.classList = "message-container other";
        }

        var timeSpan = document.createElement("span");
        timeSpan.classList = "timestamp";
        timeSpan.innerHTML = chat.timestamp;

        var messageDiv = document.createElement("div");
        if (chat.isUser) {
            messageDiv.classList = "message user-message";
        } else {
            messageDiv.classList = "message other-message";
        }
        messageDiv.innerHTML = chat.text;

        li.appendChild(timeSpan);
        li.appendChild(messageDiv);

        chatLog.appendChild(li);
    });
}

function applySessionState(sessionState) {
    this.sessionState = sessionState;

    var sessionButton = document.getElementById("sessionButton");
    switch (sessionState) {
        case 0: {
            sessionButton.disabled = true;
            sessionButton.innerText = "STOP";
            break;
        }
        case 1: {
            sessionButton.disabled = true;
            break;
        }
        case 2: {
            sessionButton.disabled = false;
            sessionButton.innerText = "STOP";
            break;
        }
    }
}

function applyChatState(chatState) {
    this.chatState = chatState;
    const chatStateDescription = document.getElementById("chatStateDescription");
    const stopSppechButton = document.getElementById("stopSpeech");
    const voiceChatButton = document.getElementById("voice");
    const message = document.getElementById("message");
    const sendMessage = document.getElementById("sendMessage");
    const ttfMessage = document.getElementById("ttfMessage");
    const sendTtfMessage = document.getElementById("sendTtfMessage");
    
    if (chatState === 0) {
        chatStateDescription.innerText = "Available";
        stopSppechButton.disabled = true;
        voiceChatButton.disabled = false;
        voiceChatButton.innerText = "Start";
        message.disabled = false;
        sendMessage.disabled = false;
        ttfMessage.disabled = false;
        sendTtfMessage.disabled = false;
        message.focus();
    } else if (chatState === 1) {
        chatStateDescription.innerText = "Recording";
        stopSppechButton.disabled = true;
        voiceChatButton.disabled = false;
        voiceChatButton.innerText = "Stop";
        message.disabled = true;
        sendMessage.disabled = true;
        ttfMessage.disabled = true;
        sendTtfMessage.disabled = true;
    } else if (chatState === 2) {
        chatStateDescription.innerText = "Analyzing";
        stopSppechButton.disabled = true;
        voiceChatButton.disabled = true;
        voiceChatButton.innerText = "Start";
        message.disabled = true;
        sendMessage.disabled = true;
        ttfMessage.disabled = true;
        sendTtfMessage.disabled = true;
    }  else {
        chatStateDescription.innerText = "AI Speaking";
        stopSppechButton.disabled = false;
        voiceChatButton.disabled = true;
        voiceChatButton.innerText = "Start";
        message.disabled = true;
        sendMessage.disabled = true;
        ttfMessage.disabled = true;
        sendTtfMessage.disabled = true;
    }
}