## API Tests (Jest + Supertest + Ajv)

Targets `https://jsonplaceholder.typicode.com` by default. Includes schema validation and negative tests. WireMock is provided to simulate 500s.

### Prerequisites
- Node 18+
- (Optional) Docker Desktop for WireMock

### Install
```bash
cd api-tests
npm install
```

### Run tests
```bash
npm test
```

### Reports
- Jest HTML: `api-tests/results/jest-report.html`
- JUnit XML: `api-tests/results/junit.xml` (CI-friendly)
- Postman (Newman): console by default; for HTML use:
```bash
npm run postman:html
```

Environment overrides:
```bash
API_BASE_URL=https://jsonplaceholder.typicode.com WIREMOCK_BASE_URL=http://localhost:8089 npm test
```

### WireMock (simulate 500)
```bash
cd api-tests/wiremock
docker compose up -d
# will expose http://localhost:8089/boom -> 500
```

### Postman
Run the collection:
```bash
cd api-tests
npm run postman
```


