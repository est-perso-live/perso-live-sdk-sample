var apiServer = null;
var apiKey = null;
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

function onSessionClicked() {
    if (this.sessionState == 0) {
        startSession();

        applySessionState(1);
    } else if (this.sessionState == 2) {
        stopSession();
    }
}

function onVideoClicked() {
    stopSpeech();
}

async function getConfig() {
    apiServer = document.getElementById("apiServer").value;
    apiKey = document.getElementById("apiKey").value;

    try {
        config = await PersoLiveSDK.getAllSettings(apiServer, apiKey);
    } catch (e) {
        alert("Invalid API Server url or API Key");
        return;
    };

    const llmOptions = document.getElementById("llmOptions");
    llmOptions.innerHTML = "";
    config.llms.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.name;
        llmOptions.appendChild(option);
    });

    const ttsOptions = document.getElementById("ttsOptions");
    ttsOptions.innerHTML = "";
    config.ttsTypes.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.name;
        ttsOptions.appendChild(option);
    });

    const chatbotStyle = document.getElementById("chatbotStyle");
    chatbotStyle.innerHTML = "";
    config.modelStyles.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.name;
        chatbotStyle.appendChild(option);
    });

    const promptOptions = document.getElementById("promptOptions");
    promptOptions.innerHTML = "";
    promptOptions.addEventListener("change", (ev) => {
        const introMessage = document.getElementById("introMessage");
        introMessage.innerText = config.prompts[parseInt(promptOptions.value)].intro_message;
    });

    config.prompts.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.name;
        promptOptions.appendChild(option);
        if (index == 0) {
            document.getElementById("introMessage").innerText = value.intro_message;
        }
    });
    promptOptions.value = 0;

    const documentOptions = document.getElementById("documentOptions");
    documentOptions.innerHTML = "";
    if (config.documents.length > 0) {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "";
        documentOptions.appendChild(option);
    }
    config.documents.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.title;
        documentOptions.appendChild(option);
    });
}

async function startSession() {
    if (this.unsubscribeSessionStatus !== null) {
        this.unsubscribeSessionStatus();
    }
    if (this.unsubscribeChatStatus !== null) {
        this.unsubscribeChatStatus();
    }
    if (this.unsubscribeChatLog !== null) {
        this.unsubscribeChatLog();
    }

    const screenOrientations = document.getElementsByName("screenOrientation");
    let screenOrientation;
    for (let i = 0; i < screenOrientations.length; i++) {
        let node = screenOrientations[i];
        if (node.checked) {
            screenOrientation = node.value;
            break;
        }
    }
    let width, height;
    if (screenOrientation == "portrait") {
        width = 1080;
        height = 1920;
    } else {
        width = 1920;
        height = 1080;
    }

    const llmOption = config.llms[parseInt(document.getElementById("llmOptions").value)];
    const llmType = llmOption.name;
    const ttsOption = config.ttsTypes[parseInt(document.getElementById("ttsOptions").value)];
    const ttsType = ttsOption.name;
    const modelStyleOption = config.modelStyles[parseInt(document.getElementById("chatbotStyle").value)];
    const modelStyle = modelStyleOption.name;
    const promptOption = config.prompts[parseInt(document.getElementById("promptOptions").value)];
    const prompt = promptOption.prompt_id;

    let documentOptionIndex = document.getElementById("documentOptions").value;
    let documentOption;
    if (documentOptionIndex.length == 0) { // ''
        documentOption = null;
    } else {
        documentOption = config.documents[parseInt(document.getElementById("documentOptions").value)].document_id;
    }

    const useIntro = document.getElementById("useIntro").checked;
    const videoElement = document.getElementById("video");

    try {
        const sessionId = await PersoLiveSDK.createSessionId(
            apiServer,
            apiKey,
            llmType,
            ttsType,
            modelStyle,
            prompt,
            documentOption
        );
        const icesServers = await PersoLiveSDK.getIceServers(apiServer, apiKey, sessionId);
        session = await PersoLiveSDK.createSession(apiServer, icesServers, sessionId, width, height, false);
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
                videoElement.classList = screenOrientation;
                const inputMethodContainer = document.getElementById("inputMethodContainer");
                inputMethodContainer.style.visibility = "visible";

                session.setSrc(videoElement);
                if (useIntro && promptOption.intro_message.trim().length > 0) {
                    session.intro();
                }

                applySessionState(2);
            } else {
                if (status.code === 408) {
                    alert("Timeout.");
                }

                applySessionState(0);
            }
        }
    });
}

function stopSession() {
    session.stopSession();
}

function applySessionState(sessionState) {
    this.sessionState = sessionState;

    var sessionButton = document.getElementById("sessionButton");
    switch (sessionState) {
        case 0: {
            sessionButton.disabled = false;
            sessionButton.innerText = "START";
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
        session.recordEnd();
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
