import { bootstrapApplication } from './auth';

async function bootstrap() {
	const { application } = await bootstrapApplication();
	await application.listen(3330);
}
bootstrap();
