import http from 'http';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer((req, res) => {
	if (req.method === 'GET' && (req.url === '/api/health' || req.url === '/api/health/')) {
		const body = JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() });
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(body);
		return;
	}

	res.writeHead(404, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
	console.log(`Mock API listening on http://localhost:${PORT}`);
});


