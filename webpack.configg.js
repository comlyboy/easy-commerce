
//@ts-check
const path = require("path");
const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const base = require("./webpack.base.js");


/**
 * @param {string} url
 */
function getFullPath(url) {
	return path.resolve(__dirname, url);
}

const config = merge(base, {
	mode: 'none',
	// entry: getFullPath('src/serverless.ts'),
	devtool: "source-map",
	stats: 'minimal',
	output: {
		libraryTarget: "commonjs",
		path: path.join(__dirname, ".webpack"),
		filename: "serverless.js",
	},
	performance: {
		// Turn off size warnings for entry points
		hints: false
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
					// extractComments: "all",
					compress: {
						drop_console: false,
						drop_debugger: true,
					},
				},
			}),
		],
	},
});

module.exports = config;
