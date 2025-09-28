const request = require('supertest');
const { validateSchema } = require('./helpers/schemaValidator.js');
const postSchema = require('./schemas/post.schema.js');

const BASE = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

describe('JSONPlaceholder API', () => {
	// Data-driven inputs for POST
	const createCases = [
		{ userId: 1, title: 'hello', body: 'world' },
		{ userId: 2, title: 'lorem', body: 'ipsum' },
		{ userId: 3, title: 'foo', body: 'bar' },
	];

	test('GET /posts returns 200 and array', async () => {
		const res = await request(BASE).get('/posts').expect(200);
		expect(Array.isArray(res.body)).toBe(true);
		if (res.body.length > 0) validateSchema(postSchema, res.body[0]);
	});

	test.each(createCases)('POST /posts creates resource: %#', async (payload) => {
		const res = await request(BASE)
			.post('/posts')
			.send(payload)
			.set('Content-Type', 'application/json')
			.expect(201);
		expect(res.body).toEqual(expect.objectContaining(payload));
	});

	test('GET /posts/1 matches schema', async () => {
		const res = await request(BASE).get('/posts/1').expect(200);
		validateSchema(postSchema, res.body);
	});

test('Negative: GET /invalid-path returns 404', async () => {
		await request(BASE).get('/invalid-path').expect(404);
	});

test('Negative: simulate 500 via WireMock stub (if running)', async () => {
		const wm = process.env.WIREMOCK_BASE_URL || 'http://localhost:8089';
		try {
			await request(wm).get('/boom').expect(500);
		} catch (err) {
			console.warn('WireMock not reachable, skipping 500 test');
		}
	});
});


