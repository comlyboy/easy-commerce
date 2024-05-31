//@ts-check
'use strict';
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const base = {};
const config = merge(base, {
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
		// @ts-ignore
		plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.build.json' })],
	},
	performance: {
		hints: 'warning',
	},
	devtool: false,
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.ts$/,
				exclude: [
					'/test/',
					'/src/**/*.spec.ts',
					'/**/*.spec.ts'
				]
			}
		],
	},
	target: 'node',
	node: {
		__dirname: true,
		__filename: true,
	},
	externals: [
		nodeExternals(),
		'aws-sdk'
	],
});

module.exports = config;
