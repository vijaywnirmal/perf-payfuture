// Aggregates k6 JSON summaries from performance/k6/results into a single HTML dashboard
const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '..', 'results');
const outFile = path.join(__dirname, 'index.html');

function loadSummaries() {
	if (!fs.existsSync(resultsDir)) return [];
	const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
	files.sort();
	return files.map(f => ({ name: f, data: JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf-8')) }));
}

function extract(series) {
	return series.map(({ name, data }) => {
		const m = data.metrics || {};
		return {
			name,
			p95: m['http_req_duration']?.values?.['p(95)'] ?? 0,
			p90: m['http_req_duration']?.values?.['p(90)'] ?? 0,
			avg: m['http_req_duration']?.values?.avg ?? 0,
			throughput: m['http_reqs']?.values?.rate ?? 0,
			errorRate: (m['http_req_failed']?.values?.rate ?? 0) * 100,
		};
	});
}

function buildHtml(rows) {
	return `<!doctype html>
	<html>
	<head>
		<meta charset="utf-8" />
		<title>k6 Dashboard</title>
		<style>
			body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#111}
			h1{font-size:22px;margin:0 0 16px}
			table{border-collapse:collapse;width:100%}
			th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
			th{background:#f9fafb}
			.bad{color:#b91c1c}
			.good{color:#065f46}
		</style>
	</head>
	<body>
		<h1>k6 Results Dashboard</h1>
		<table>
			<thead><tr><th>Run</th><th>Latency p95 (ms)</th><th>Latency avg (ms)</th><th>Throughput (req/s)</th><th>Error rate (%)</th></tr></thead>
			<tbody>
				${rows.map(r => `<tr><td>${r.name}</td><td>${r.p95}</td><td>${r.avg}</td><td>${r.throughput}</td><td class="${r.errorRate>0?'bad':'good'}">${r.errorRate}</td></tr>`).join('')}
			</tbody>
		</table>
	</body>
	</html>`;
}

const summaries = loadSummaries();
const rows = extract(summaries);
fs.mkdirSync(path.join(__dirname), { recursive: true });
fs.writeFileSync(outFile, buildHtml(rows));
console.log(`Dashboard written: ${outFile}`);


