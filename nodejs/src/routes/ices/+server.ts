import { persoLiveApiKey, persoLiveApiServerUrl } from '$lib/constant';

export async function POST({ request }) {
    const json = await request.json();
    const response = await fetch(
        `${persoLiveApiServerUrl}/api/v1/session/${json.session_id}/ice-servers/`,
        {
            headers: {
                'PersoLive-APIKey': persoLiveApiKey
            },
            method: 'GET'
        }
    );

	return response;
}

export async function OPTIONS() {
  return new Response(null, {
	  headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS'
	  },
	})
}