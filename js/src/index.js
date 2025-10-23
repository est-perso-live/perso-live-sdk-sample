var apiServer = null;
var apiKey = null;
var session = null;
var config = null;
var screenOrientation = null;
var chatbotLeft = 0;
var chatbotTop = 0;
var chatbotHeight = 0;
var chatState = 0; // 0: available 1: recording 2: analyzing 3: AI speaking
var sessionState = 0; // 0: Initial state(or closed) 1: starting 2: started
var enableVoiceChat = true;
var removeOnClose = null;
var unsubscribeChatStatus = null;
var unsubscribeChatLog = null;
var unsubscribeStfStartEvent = null;
var removeSttResultCallback = null;

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
    } else {
        session.stopVoiceChat();
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

async function onStfFileChanged(event) {
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

    let file_ref = session.processSTF(file, format, "");
}

async function getConfig() {
    apiServer = document.getElementById("apiServer").value;
    apiKey = document.getElementById("apiKey").value;

    try {
        config = await PersoLiveSDK.getAllSettings(apiServer, apiKey);
    } catch (e) {
        alert(e);
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

    const backgroundImage = document.getElementById("backgroundImage");
    backgroundImage.innerHTML = "";
    if (config.backgroundImages.length > 0) {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "";
        backgroundImage.appendChild(option);
    }
    config.backgroundImages.forEach((value, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.innerText = value.title;
        backgroundImage.appendChild(option);
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
        if (index === 0) {
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

    let width, height;
    if (this.screenOrientation === 'portrait') {
        width = 1080;
        height = 1920;
    } else {
        width = 1920;
        height = 1080;
    }

    const llmOption = config.llms[parseInt(document.getElementById("llmOptions").value)];
    const llmTypeKey = llmOption.name;
    const ttsOption = config.ttsTypes[parseInt(document.getElementById("ttsOptions").value)];
    const ttsTypeKey = ttsOption.name;
    const modelStyleOption = config.modelStyles[parseInt(document.getElementById("chatbotStyle").value)];
    const modelStyleKey = modelStyleOption.name;
    const promptOption = config.prompts[parseInt(document.getElementById("promptOptions").value)];
    const promptKey = promptOption.prompt_id;

    let backgroundImageOptionIndex = document.getElementById("backgroundImage").value;
    let backgroundImageKey;
    if (backgroundImageOptionIndex.length === 0) { // ''
        backgroundImageKey = null;
    } else {
        backgroundImageKey = config.backgroundImages[parseInt(backgroundImageOptionIndex)].backgroundimage_id;
    }

    let documentOptionIndex = document.getElementById("documentOptions").value;
    let documentKey;
    if (documentOptionIndex.length == 0) { // ''
        documentKey = null;
    } else {
        documentKey = config.documents[parseInt(documentOptionIndex)].document_id;
    }

    const useIntro = document.getElementById("useIntro").checked;
    const videoElement = document.getElementById("video");

    try {
        const sessionId = await PersoLiveSDK.createSessionId(
            apiServer,
            apiKey,
            llmTypeKey,
            ttsTypeKey,
            modelStyleKey,
            promptKey,
            documentKey,
            backgroundImageKey,
            chatbotLeft / 100,
            chatbotTop / 100,
            chatbotHeight / 100
        );
        session = await PersoLiveSDK.createSession(apiServer, sessionId, width, height, enableVoiceChat);

        videoElement.classList = screenOrientation;
        session.setSrc(videoElement);

        applyChatState(0);

        if (useIntro && promptOption.intro_message.trim().length > 0) {
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

function canRecord() {
    return chatState === 0;
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

const background = new Image();
const perso = new Image();

async function loadImage() {
    const backgroundLoader = new Promise((resolve) => {
        background.src = "background.png";

        background.onload = function() {
            resolve();
        }
    });
    const persoLoader = new Promise((resolve) => {
        perso.src = "perso.png";

        perso.onload = function() {
            resolve();
        }
    });

    await backgroundLoader;
    await persoLoader;
}

function redrawChatbotCanvas() {
    const chatbotCanvas = document.getElementById("chatbotCanvas");

    let width, height;
    if (screenOrientation === 'portrait') {
        width = 304;
        height = 540;
    } else {
        width = 960;
        height = 540;
    }
    chatbotCanvas.clientWidth = width;
    chatbotCanvas.clientHeight = height;
    chatbotCanvas.width = width;
    chatbotCanvas.height = height;

    const ctx = chatbotCanvas.getContext("2d");

    ctx.drawImage(background, 0, 0, width, height);

    let persoRatio = perso.width / perso.height;
    let persoWidth = height * persoRatio;
    let persoHeight = height;
    persoWidth = Math.min((persoWidth * (chatbotHeight / 100)), width);
    persoHeight = persoWidth / persoRatio;

    let leftRange = width - persoWidth;
    let persoLeft = leftRange * (chatbotLeft / 200 + 0.5);

    let persoTop = height * (chatbotTop / 100);

    ctx.drawImage(perso, persoLeft, persoTop, persoWidth, persoHeight);
}

window.onload = async function() {
    const enableVoiceChat = document.getElementById("enableVoiceChat");
    enableVoiceChat.addEventListener("change", (e) => {
        const voiceChatContainer = document.getElementById("inputMethodContainer2");
        this.enableVoiceChat = e.target.checked;
        if (this.enableVoiceChat) {
            voiceChatContainer.style.display = "flex";
        } else {
            voiceChatContainer.style.display = "none";
        }
    });

    const screenOrientations = document.getElementsByName("screenOrientation");
    for (let i = 0; i < screenOrientations.length; i++) {
        let node = screenOrientations[i];
        node.addEventListener("change", (e) => {
            if (e.target.checked) {
                this.screenOrientation = e.target.value;
                redrawChatbotCanvas();
            }
        });
    }

    screenOrientations[0].click();

    function toPaddingString(value) {
        return `${value}(${value/100})`
    }

    this.chatbotLeft = 0;
    this.chatbotTop = 0;
    this.chatbotHeight = 100;

    const chatbotLeftElement = document.getElementById("chatbotLeft");
    const chatbotLeftValueElement = document.getElementById("chatbotLeftValue");
    chatbotLeftElement.min = -100;
    chatbotLeftElement.max = 100;
    chatbotLeftElement.value = this.chatbotLeft;
    chatbotLeftElement.addEventListener('input', (ev) => {
        this.chatbotLeft = ev.target.value;
        chatbotLeftValueElement.innerHTML = toPaddingString(this.chatbotLeft);
        redrawChatbotCanvas();
    });

    const chatbotTopElement = document.getElementById("chatbotTop");
    const chatbotTopValueElement = document.getElementById("chatbotTopValue");
    chatbotTopElement.min = 0;
    chatbotTopElement.max = 100;
    chatbotTopElement.value = this.chatbotTop;
    chatbotTopElement.addEventListener('input', (ev) => {
        this.chatbotTop = ev.target.value;
        chatbotTopValueElement.innerHTML = toPaddingString(this.chatbotTop);
        redrawChatbotCanvas();
    });

    const chatbotHeightElement = document.getElementById("chatbotHeight");
    const chatbotHeightValueElement = document.getElementById("chatbotHeightValue");
    chatbotHeightElement.min = 0;
    chatbotHeightElement.max = 500;
    chatbotHeightElement.value = this.chatbotHeight;
    chatbotHeightElement.addEventListener('input', (ev) => {
        this.chatbotHeight = ev.target.value;
        chatbotHeightValueElement.innerHTML = toPaddingString(this.chatbotHeight);
        redrawChatbotCanvas();
    });

    const inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true
    });
    chatbotLeftElement.dispatchEvent(inputEvent);
    chatbotTopElement.dispatchEvent(inputEvent);
    chatbotHeightElement.dispatchEvent(inputEvent);

    await loadImage();

    redrawChatbotCanvas();
}