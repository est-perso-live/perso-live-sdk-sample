// perso-live-sdk.js를 연결하기 위한 중간단계 정의

export interface Chat {
	text: string;
	isUser: boolean;
	timestamp: Date;
}

export class SessionConfig {
	constructor(
		public persoLiveApiServerUrl: string,
		public sessionId: string,
		public chatbotWidth: number,
		public chatbotHeight: number,
		public enableVoiceChat: boolean
	) {}
}

export class Session {
	static async create(
		liveChatConfig: SessionConfig
	) {
		const liveChatSession = await PersoLiveSDK.createSession(
			liveChatConfig.persoLiveApiServerUrl,
			liveChatConfig.sessionId,
			liveChatConfig.chatbotWidth,
			liveChatConfig.chatbotHeight,
			liveChatConfig.enableVoiceChat
		);

		return new Session(liveChatConfig.persoLiveApiServerUrl, liveChatSession);
	}

	constructor(
		private apiServer: string,
		private liveChatSession: any
	) {}

	startVoiceChat() {
		this.liveChatSession.startVoiceChat();
	}

	stopVoiceChat() {
		this.liveChatSession.stopVoiceChat();
	}

	processTTSTF(message: string) {
		this.liveChatSession.processTTSTF(message);
	}

	processSTF(file: Blob, format: string, message: string): string {
		return this.liveChatSession.processSTF(file, format, message);
	}

	setSrc(videoElement: HTMLVideoElement) {
		this.liveChatSession.setSrc(videoElement);
	}

	intro() {
		this.liveChatSession.intro();
	}

	subscribeChatLog(callback: (chatLog: Array<Chat>) => void) {
		return this.liveChatSession.subscribeChatLog(callback) as (() => void);
	}

	subscribeChatStatus(callback: (status: number) => void) {
		return this.liveChatSession.subscribeChatStatus(callback) as (() => void);
	}
	onClose(callback: (manualClosed: boolean) => void) {
		return this.liveChatSession.onClose(callback) as (() => void);
	}

	async processChat(message: string) {
		await this.liveChatSession.processChat(message);
	}

	changeSize(width: number, height: number) {
		this.liveChatSession.changeSize(width, height);
	}

	clearBuffer() {
		this.liveChatSession.clearBuffer();
	}

	stopSession() {
		this.liveChatSession.stopSession();
	}

	getSessionInfo(): any {
		return PersoLiveSDK.getSessionInfo(this.apiServer, this.liveChatSession.getSessionId());
	}
}