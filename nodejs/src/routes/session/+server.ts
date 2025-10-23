import {
    persoLiveApiServerUrl,
    persoLiveApiKey,
    useIntroMessage,
    chatbotWidth,
    chatbotHeight,
    enableVoiceChat
} from '$lib/constant';
import { error } from '@sveltejs/kit';
import { config } from '../../hooks.server'

async function createSessionId(
    apiServer: string,
    apiKey: string,
    llm_type: string,
    tts_type: string,
    model_style: string,
    prompt: string,
    document?: string,
    background_image?: string,
    padding_left?: number,
    padding_top?: number,
    padding_height?: number
) {
    const response = await fetch(`${apiServer}/api/v1/session/`, {
        body: JSON.stringify({
            llm_type,
            tts_type,
            model_style,
            prompt,
            document,
            background_image,
            padding_left,
            padding_top,
            padding_height
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

export async function GET() {
    const sessionId = await createSessionId(
        persoLiveApiServerUrl,
        persoLiveApiKey,
        config.llm,
        config.tts,
        config.modelStyle,
        config.prompt,
        config.document,
        config.backgroundImage,
        config.padding_left,
        config.padding_top,
        config.padding_height
    )

    return new Response(
        JSON.stringify(
            {
                persoLiveApiServerUrl: persoLiveApiServerUrl,
                sessionId: sessionId,
                useIntroMessage: useIntroMessage,
                chatbotWidth: chatbotWidth,
                chatbotHeight: chatbotHeight,
                enableVoiceChat: enableVoiceChat
            }
        ),
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );
};