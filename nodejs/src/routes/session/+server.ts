import { config } from '../../hooks.server';
import { persoLiveApiKey, persoLiveApiServerUrl } from '$lib/constant'

export async function GET() {
	const response = await fetch(`${persoLiveApiServerUrl}/api/v1/session/`, {
		body: JSON.stringify({
			llm_type: config.llm,
			tts_type: config.tts,
			model_style: config.modelStyle,
			prompt: config.prompt,
			document: config.document
		}),
		headers: {
			'PersoLive-APIKey': persoLiveApiKey,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});

	return response;
}

export async function OPTIONS() {
	return new Response(null, {
	  headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, OPTIONS'
	  },
	})
}