const providers=Object.freeze({
	OLLAMA:'ollama',
	COPILOT:'copilot',
});
const default_models=Object.freeze({
	ollama: 'llama3.2',
	copilot: 'gpt-4o',
});
export const get_default_provider=()=> {
	return providers.COPILOT;
};

export const get_default_model=(provider)=> {
	return default_models[provider] || 'null';
};
