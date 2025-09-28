 

// Load JSON config with env overrides
export function loadConfig() {
	const raw = open('./config.json');
	const cfg = JSON.parse(raw);

	const env = __ENV || {};
	const overrides = {
		baseUrl: env.K6_BASE_URL,
		endpoint: env.K6_ENDPOINT,
		endpoints: env.K6_ENDPOINTS,
		vus: env.K6_VUS && Number(env.K6_VUS),
		duration: env.K6_DURATION,
		scenarioMode: env.K6_SCENARIO_MODE,
	};

	for (const key in overrides) {
		if (overrides[key] !== undefined && overrides[key] !== null && overrides[key] !== '') {
			cfg[key] = overrides[key];
		}
	}

	if (typeof cfg.endpoints === 'string') {
		cfg.endpoints = cfg.endpoints
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);
	}

	if (!Array.isArray(cfg.endpoints)) cfg.endpoints = [];
	if (!cfg.scenarioMode) cfg.scenarioMode = 'split';

	return cfg;
}

export function buildUrl(baseUrl, endpoint) {
	if (!endpoint) return baseUrl;
	const slashBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	const slashEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	return `${slashBase}${slashEndpoint}`;
}

export function checkResponse(res) {
	if (!res) return false;
	if (res.status === 0) return false;
	return true;
}


