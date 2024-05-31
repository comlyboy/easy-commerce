import { APIGatewayProxyCallbackV2, APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, Context } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { bootstrapApplication } from './app';

let serverInstance: APIGatewayProxyHandlerV2;
async function bootstrapLambdaApi(): Promise<APIGatewayProxyHandlerV2<never>> {
	// https://youtu.be/9a74LuU2EoU
	// https://towardsaws.com/5-ways-to-speed-up-your-lambda-function-2163f63ffc49
	// https://lumigo.io/learn/aws-lambda-timeout-best-practices/
	if (!serverInstance) {
		console.log('LOG => Initializing new Lambda API instance');
		const { application } = await bootstrapApplication();
		await application.init();
		const expressInstance = application.getHttpAdapter().getInstance();
		serverInstance = serverlessExpress({ app: expressInstance });
	}
	return serverInstance;
}
// https://www.serverless.com/framework/docs/providers/aws/events/http-api#lambda-request-authorizers

export async function handler(event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallbackV2) {
	context.callbackWaitsForEmptyEventLoop = false;
	const server = await bootstrapLambdaApi();
	return await server(event, context, callback);
}