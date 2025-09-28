import http from 'k6/http';
import { sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { loadConfig, buildUrl, checkResponse } from './utils.js';

const cfg = loadConfig();
const requestDuration = new Trend('custom_http_req_duration');

function buildScenarios() {
	if (!cfg.endpoints || cfg.endpoints.length === 0) return undefined;
	const endpoints = cfg.endpoints;
	const scenarios = {};
	const mode = cfg.scenarioMode || 'split';
	let vusPer = 0;
	if (mode === 'duplicate') {
		vusPer = cfg.vus;
	} else {
		const base = Math.floor(cfg.vus / endpoints.length);
		const remainder = cfg.vus % endpoints.length;
		// Assign per-endpoint below using base+extra
		endpoints.forEach((ep, idx) => {
			const extra = idx < remainder ? 1 : 0;
			scenarios[`ep_${idx + 1}`] = {
				executor: 'constant-vus',
				vus: base + extra,
				duration: cfg.duration,
				exec: 'endpointRunner',
				env: { K6_ENDPOINT: ep },
				tags: { endpoint: ep },
			};
		});
		return scenarios;
	}

	// duplicate mode: each endpoint gets full VUs
	endpoints.forEach((ep, idx) => {
		scenarios[`ep_${idx + 1}`] = {
			executor: 'constant-vus',
			vus: vusPer,
			duration: cfg.duration,
			exec: 'endpointRunner',
			env: { K6_ENDPOINT: ep },
			tags: { endpoint: ep },
		};
	});
	return scenarios;
}

const scenarios = buildScenarios();

export const options = scenarios
	? { thresholds: cfg.thresholds, summaryTrendStats: cfg.summaryTrendStats, scenarios }
	: { vus: cfg.vus, duration: cfg.duration, thresholds: cfg.thresholds, summaryTrendStats: cfg.summaryTrendStats };

function runOnce() {
	const endpoint = __ENV.K6_ENDPOINT || cfg.endpoint;
	const url = buildUrl(cfg.baseUrl, endpoint);
	const res = http.get(url, { tags: { endpoint } });
	const ok = checkResponse(res);
	if (!ok) {
		// Let k6 record the failure via built-in metrics without aborting
		return;
	}
	requestDuration.add(res.timings.duration);
	sleep(1);
}

export function endpointRunner() {
	runOnce();
}

export default function () {
	runOnce();
}

export function handleSummary(data) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const jsonPath = `performance/k6/results/summary-${timestamp}.json`;
	const htmlPath = `performance/k6/results/summary-${timestamp}.html`;
	return {
		[jsonPath]: JSON.stringify(data, null, 2),
		[htmlPath]: generateSimpleHtmlReport(data),
	};
}

function generateSimpleHtmlReport(data) {
	const { metrics } = data;
	const httpReqDuration = metrics['http_req_duration'];
	const httpReqs = metrics['http_reqs'];
	const httpFailed = metrics['http_req_failed'];
	const vus = metrics['vus'];
	const trends = cfg.summaryTrendStats.join(', ');
	return `<!doctype html>
	<html>
	<head>
		<meta charset="utf-8" />
		<title>k6 Summary</title>
		<style>
			body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#111}
			h1{font-size:20px;margin:0 0 16px}
			.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
			.card{border:1px solid #e5e7eb;border-radius:8px;padding:16px}
			.k{color:#6b7280;font-size:12px;margin-bottom:8px}
			.v{font-weight:600;font-size:18px}
		</style>
	</head>
	<body>
		<h1>k6 Test Summary</h1>
		<div class="grid">
			<div class="card"><div class="k">Throughput (http_reqs)</div><div class="v">${httpReqs?.values?.count ?? 0} reqs</div></div>
			<div class="card"><div class="k">Errors (http_req_failed)</div><div class="v">${(httpFailed?.values?.rate ?? 0) * 100}%</div></div>
			<div class="card"><div class="k">Latency p95</div><div class="v">${httpReqDuration?.values?.['p(95)'] ?? 0} ms</div></div>
			<div class="card"><div class="k">Latency p90</div><div class="v">${httpReqDuration?.values?.['p(90)'] ?? 0} ms</div></div>
			<div class="card"><div class="k">Latency avg</div><div class="v">${httpReqDuration?.values?.avg ?? 0} ms</div></div>
			<div class="card"><div class="k">Active VUs</div><div class="v">${vus?.values?.value ?? cfg.vus}</div></div>
		</div>
		<p class="k">Trend stats: ${trends}</p>
	</body>
	</html>`;
}

// JUnit export removed per request


