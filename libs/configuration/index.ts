import { IEnvironmentVariable, DefinedAppEnvironmentType, DefinedAppEnvironmentEnum } from "libs/types";

require('dotenv').config();

const cachedEnvironmentVariables: Record<string, string> = {};

export const EnvironmentConfig: Readonly<IEnvironmentVariable> = {
	WORKINANCE_AWS_ACCESS_KEY_ID: getEnvVariable('WORKINANCE_AWS_ACCESS_KEY_ID'),
	WORKINANCE_AWS_SECRET_KEY: getEnvVariable('WORKINANCE_AWS_SECRET_KEY'),
	WORKINANCE_SERVER_SECRET_KEY: getEnvVariable('WORKINANCE_SERVER_SECRET_KEY'),
	NODE_ENV: getEnvVariable('NODE_ENV')?.toLowerCase() as DefinedAppEnvironmentType || DefinedAppEnvironmentEnum.DEVELOPMENT,
	WORKINANCE_SLACK_ERROR_LOG_URL: getEnvVariable('WORKINANCE_SLACK_ERROR_LOG_URL'),
	SENDCHAMP_SMS_ACCESS_KEY: getEnvVariable('SENDCHAMP_SMS_ACCESS_KEY'),
	BULK_SMS_NIG_API_KEY: getEnvVariable('BULK_SMS_NIG_API_KEY')
};


function getEnvVariable(key: keyof IEnvironmentVariable) {
	const envValue = process.env[key];
	if (cachedEnvironmentVariables[key] !== undefined) {
		return cachedEnvironmentVariables[key];
	}
	if (envValue !== undefined) {
		cachedEnvironmentVariables[key] = envValue;
		return envValue;
	}
	return undefined;
}