import { persoLiveApiServerUrl, persoLiveApiKey } from "$lib/constant";

// Enter your configuration.
export const config = {
	llm: '',
	tts: '',
	modelStyle: '',
	prompt: '',
	document: ''
}
// ex
/*
const allConfig = await getAllConfig();
export const config = {
	llm: allConfig.llms[0].name,
	tts: allConfig.ttss[0].name,
	modelStyle: allConfig.modelStyles[0].name,
	prompt: allConfig.prompts[0].prompt_id,
	document: allConfig.documents[0].document_id
}
*/

async function getAllConfig() {
	let llms, ttss, modelStyles, prompts, documents;
	llms = await getLLMs(persoLiveApiServerUrl, persoLiveApiKey);
	ttss = await getTTSs(persoLiveApiServerUrl, persoLiveApiKey);
	modelStyles = await getModelStyles(persoLiveApiServerUrl, persoLiveApiKey);
	prompts = await getPrompts(persoLiveApiServerUrl, persoLiveApiKey);
	documents = await getDocuments(persoLiveApiServerUrl, persoLiveApiKey);

	return {
		llms,
		ttss,
		modelStyles,
		prompts,
		documents
	}
}

/**
 * @param apiServer Perso Live API Server
 * @param apiKey Perso Live API Key
 * @returns JSON
 * [
 *   {
 *     "name": string
 *   }
 * ]
 */
async function getLLMs(apiServer: string, apiKey: string) {
	const llmTypePromise = fetch(
		`${apiServer}/api/v1/settings/llm_type/`,
		{
			headers: {
				'PersoLive-APIKey': apiKey
			},
			method: 'GET'
		}
	);
	const llmTypeResponse = await llmTypePromise;

	return await llmTypeResponse.json();
}

/**
 * @param apiServer Perso Live API Server
 * @param apiKey Perso Live API Key
 * @returns JSON
 * [
 *   {
 *     "name": string,
 *     "service": string,
 *     "speaker": string
 *   }
 * ]
 */
async function getTTSs(apiServer: string, apiKey: string) {
	const ttsTypePromise = fetch(
		`${apiServer}/api/v1/settings/tts_type/`,
		{
			headers: {
				'PersoLive-APIKey': apiKey
			},
			method: 'GET'
		}
	)
	const ttsTypeResponse = await ttsTypePromise;

	return await ttsTypeResponse.json();
}

/**
 * @param apiServer Perso Live API Server
 * @param apiKey Perso Live API Key
 * @returns JSON
 * [
 *   {
 *     "name": string,
 *     "model": string,
 *     "style": string
 *   }
 * ]
 */
async function getModelStyles(apiServer: string, apiKey: string) {
	const modelStylePromise = fetch(
		`${apiServer}/api/v1/settings/modelstyle/`,
		{
			headers: {
				'PersoLive-APIKey': apiKey
			},
			method: 'GET'
		}
	)
	const modelStyleResponse = await modelStylePromise;
	return await modelStyleResponse.json();
}

/**
 * @param apiServer Perso Live API Server
 * @param apiKey Perso Live API Key
 * @returns JSON
 * [
 *   {
 *     "name": string,
 *     "description": string,
 *     "prompt_id": string,
 *     "system_prompt": string,
 *     "require_document": boolean,
 *     "intro_message": string
 *   }
 * ]
 */
async function getPrompts(apiServer: string, apiKey: string) {
	const promptPromise = fetch(
		`${apiServer}/api/v1/prompt/`,
		{
			headers: {
				'PersoLive-APIKey': apiKey
			},
			method: 'GET'
		}
	)
	const promptsResponse = await promptPromise;

	return await promptsResponse.json();
}

/**
 * @param apiServer Perso Live API Server
 * @param apiKey Perso Live API Key
 * @returns JSON
 * [
 *   {
 *     "document_id": string,
 *     "title": string,
 *     "description": string,
 *     "search_count": number,,
 *     "processed": boolean,
 *     "created_at": string, // ex) "2024-05-02T09:05:55.395Z",
 *     "updated_at": string // ex) "2024-05-02T09:05:55.395Z"
 *   }
 * ]
 */
async function getDocuments(apiServer: string, apiKey: string) {
	const documentsPromise = fetch(
		`${apiServer}/api/v1/document/`,
		{
			headers: {
				'PersoLive-APIKey': apiKey
			},
			method: 'GET'
		}
	)
	const documentsResponse = await documentsPromise;

	return await documentsResponse.json();
}