import { persoLiveApiServerUrl, persoLiveApiKey } from '$lib/constant';
import { error } from '@sveltejs/kit';
import { config } from '../hooks.server'

export interface ServerConfig {
    persoLiveApiServerUrl: string
    sessionId: string
    iceServers: Array<RTCIceServer>
    hasIntroMessage: boolean
    chatbotWidth: number
    chatbotHeight: number
}

async function createSessionId(
    apiServer: string,
    apiKey: string,
    llm_type: string,
    tts_type: string,
    model_style: string,
    prompt: string,
    document?: string,
    background_image?: string
) {
    const response = await fetch(`${apiServer}/api/v1/session/`, {
        body: JSON.stringify({
            llm_type,
            tts_type,
            model_style,
            prompt,
            document,
            background_image
        }),
        headers: {
            'PersoLive-APIKey': apiKey,
            'Content-Type': 'application/json'
        },
        method: 'POST'
    });

    if (!response.ok) {
        throw error(408);
    }

    let json = await response.json();
    return json.session_id;
}

async function getIceServers(
    apiServer: string,
    apiKey: string,
    sessionId: string
) {
    const response = await fetch(
        `${apiServer}/api/v1/session/${sessionId}/ice-servers/`,
        {
            headers: {
                'PersoLive-APIKey': apiKey
            },
            method: 'GET'
        }
    );

    if (!response.ok) {
        throw error(408);
    }

    const json = await response.json();

    return json.ice_servers;
}

export const load = (async () => {
    const sessionId = await createSessionId(
        persoLiveApiServerUrl,
        persoLiveApiKey,
        config.llm,
        config.tts,
        config.modelStyle,
        config.prompt,
        config.document,
        config.backgroundImage
    )
    const iceServers = await getIceServers(
        persoLiveApiServerUrl, persoLiveApiKey, sessionId
    );

    const serverConfig: ServerConfig = {
        persoLiveApiServerUrl: persoLiveApiServerUrl,
        sessionId: sessionId,
        iceServers: iceServers,
        hasIntroMessage: config.introMessage.length > 0,
        chatbotWidth: 1920,
        chatbotHeight: 1080
    };

    return serverConfig;
});