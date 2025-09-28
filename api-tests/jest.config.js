module.exports = {
	testEnvironment: 'node',
	transform: {},
	roots: ['<rootDir>/tests'],
	reporters: [
		'default',
		[
			'jest-junit',
			{ outputDirectory: 'results', outputName: 'junit.xml' }
		],
		[
			'jest-html-reporters',
			{ publicPath: 'results', filename: 'jest-report.html', inlineSource: true, openReport: false }
		]
	],
};

