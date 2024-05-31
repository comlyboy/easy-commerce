import { bootstrapApplication } from './app';

async function bootstrap() {
	const { application } = await bootstrapApplication();
	await application.listen(3331);
}
bootstrap();
