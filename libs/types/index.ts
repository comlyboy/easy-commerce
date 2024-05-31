export interface IBaseId {
	id: string;
}

export type ObjectType = Record<string, any>;

export interface IEnvironmentVariable {
	[key: string]: string;
}

export enum DefinedAppEnvironmentEnum {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
	STAGING = 'staging'
}

export type DefinedAppEnvironmentType = `${DefinedAppEnvironmentEnum}`;