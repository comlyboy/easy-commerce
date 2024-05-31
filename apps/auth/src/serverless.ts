import { APIGatewayProxyCallbackV2, APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, Context } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { bootstrapApplication } from './auth';

let serverInstance: APIGatewayProxyHandlerV2;

async function bootstrapLambdaApi(): Promise<APIGatewayProxyHandlerV2<never>> {
	if (!serverInstance) {
		console.log('LOG => Initializing new Lambda API instance');
		const { application } = await bootstrapApplication();
		await application.init();
		const expressInstance = application.getHttpAdapter().getInstance();
		serverInstance = serverlessExpress({ app: expressInstance });
	}
	return serverInstance;
}

export async function handler(event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallbackV2) {
	context.callbackWaitsForEmptyEventLoop = false;
	const server = await bootstrapLambdaApi();
	return await server(event, context, callback);
}