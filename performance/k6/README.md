## k6 Performance Tests

Run a simple load test against your API using k6.

### Prerequisites
- Install k6: https://k6.io/docs/get-started/installation/

### Default scenario
- 100 virtual users for 60 seconds
- Target endpoint defaults to `http://localhost:3000/api/health`

### Run (Windows CMD)
```bat
k6 run performance\k6\load_test.js
```

### Environment overrides
Use env vars to change target and load profile:
```bat
set K6_BASE_URL=http://localhost:8080
set K6_ENDPOINT=/api/ping
set K6_VUS=150
set K6_DURATION=90s
k6 run performance\k6\load_test.js
```

Multi-endpoint (run several APIs at once):
```bat
set K6_BASE_URL=http://localhost:3000
rem comma-separated list
set K6_ENDPOINTS=/api/health,/api/ping,/api/users
rem split: split total VUs across endpoints (default). duplicate: full VUs per endpoint
set K6_SCENARIO_MODE=split
k6 run performance\k6\load_test.js
```

### Config file
Edit `performance/k6/config.json` for defaults, including thresholds and summary stats.

### Outputs
After a run, summary files are written to `performance/k6/results/`:
- JSON: detailed metrics
- HTML: quick visual summary of latency, errors, and throughput

### Aggregate dashboard
Build a simple dashboard aggregating all JSON summaries:
```bash
node performance/k6/dashboard/build.js
```
Open `performance/k6/dashboard/index.html` in your browser.

### Troubleshooting
- Target not running: you'll see warnings like `connectex: No connection could be made...`. Start your API or point `K6_BASE_URL`/`K6_ENDPOINT` to a reachable host.
- Different working dir: the script loads `config.json` relative to `load_test.js`. Always run `k6` from the project root or pass an absolute script path as shown above.
- Quick smoke test against a public endpoint:
```bat
set K6_BASE_URL=https://test.k6.io
set K6_ENDPOINT=/
k6 run performance\k6\load_test.js
```


