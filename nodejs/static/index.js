var apiServer = null;
var session = null;
var config = null;
var recording = false;
var chatState = 0; // 0: available 1: recording 2: analyzing 3: AI speaking
var sessionState = 0; // 0: Initial state(or closed) 1: starting 2: started
var unsubscribeSessionStatus = null;
var unsubscribeChatStatus = null;
var unsubscribeChatLog = null;

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

function onVideoClicked() {
    stopSpeech();
}

async function startSession(iceServers, sessionId) {
    if (this.unsubscribeSessionStatus !== null) {
        this.unsubscribeSessionStatus();
    }
    if (this.unsubscribeChatStatus !== null) {
        this.unsubscribeChatStatus();
    }
    if (this.unsubscribeChatLog !== null) {
        this.unsubscribeChatLog();
    }

    let width, height;
    width = 1920;
    height = 1080;

    const videoElement = document.getElementById("video");

    try {
        session = await PersoLiveSDK.createSession(apiServer, iceServers, sessionId, width, height, false);
    } catch (e) {
        applySessionState(0);
        return;
    }

    refreshChatLog([]);
    this.unsubscribeChatLog = session.subscribeChatLog((chatLog) => {
        refreshChatLog(chatLog);
    });
    this.unsubscribeChatStatus = session.subscribeMicStatus((status) => {
        applyChatState(status);
    });
    this.unsubscribeSessionStatus = session.subscribeSessionStatus((status) => {
        if (status != null) {
            if (status.live) {
                const chatbotContainer = document.getElementById("chatbotContainer");
                chatbotContainer.style.visibility = "visible";
                const inputMethodContainer = document.getElementById("inputMethodContainer");
                inputMethodContainer.style.visibility = "visible";

                session.setSrc(videoElement);
            } else {
                if (status.code === 408) {
                    alert("Timeout.");
                }

                applySessionState(0);
            }
        }
    });
}

function applySessionState(sessionState) {
    this.sessionState = sessionState;
}

function stopSpeech() {
    if (chatState == 3) {
        session.clearBuffer();
    }
}

function onRecordClicked() {
    var recordButon = document.getElementById("record");
    if (recordButon.disabled) {
        return;
    }

    if (canRecord()) {
        session.recordStart();
        recording = true;
    } else {
        session.recordEndStt();
        recording = false;
    }

    applyChatState(chatState);
}

function canRecord() {
    return !recording && chatState == 0;
}

function onMessageSubmit() {
    var messageElement = document.getElementById("message");
    var message = messageElement.value.trim();
    if (message.length > 0) {
        messageElement.value = "";
        session.processChat(message);
    }
}

function onMessageKeyPress(keyEvent) {
    if (keyEvent.key == 'Enter') {
        onMessageSubmit();
    }
}

function applyChatState(chatState) {
    this.chatState = chatState;
    var recordButon = document.getElementById("record");
    var message = document.getElementById("message");
    var sendMessage = document.getElementById("sendMessage");
    
    if (chatState == 0) {
        recordButon.disabled = false;
        recordButon.innerText = "Voice";
        message.disabled = false;
        sendMessage.disabled = false;
        message.focus();
    } else if (chatState == 1) {
        recordButon.disabled = false;
        recordButon.innerText = "Stop";
        message.disabled = true;
        sendMessage.disabled = true;
    } else if (chatState == 2) {
        recordButon.disabled = true;
        recordButon.innerText = "Analyzing";
        message.disabled = true;
        sendMessage.disabled = true;
    }  else {
        recordButon.disabled = true;
        recordButon.innerText = "AI Speaking";
        message.disabled = true;
        sendMessage.disabled = true;
    }
}

async function load(apiServer) {
    this.apiServer = apiServer;

    const sessionResponse = await fetch('/session', { method: 'GET' });
    if (!sessionResponse.ok) return;

    const sessionJson = await sessionResponse.json();
    const sessionId = sessionJson.session_id;

    const icesResponse = await fetch('/ices', {
        body: JSON.stringify(
            { "session_id": sessionId }
        ),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    });
    if (!icesResponse.ok) return;

    const icesJson = await icesResponse.json();
    const iceServers = icesJson.ice_servers;

    startSession(iceServers, sessionId);
}