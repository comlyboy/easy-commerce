import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';
import morgan from "morgan";
import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

import { EnvironmentConfig, DefinedAppEnvironmentEnum, AllExceptionFilter, HttpExceptionFilter, getCurrentInvocation, getIpAddress } from 'libs';
import { AuthModule } from './auth.module';

// https://stackoverflow.com/questions/68932747/adding-nestjs-as-express-module-results-in-nest-being-restarted
// https://stackoverflow.com/questions/54349998/use-nestjs-package-in-nodejs-express-project/67719723#67719723
export async function bootstrapApplication() {
	const application = await NestFactory.create<NestExpressApplication>(AuthModule, {
		logger: EnvironmentConfig.NODE_ENV !== DefinedAppEnvironmentEnum.DEVELOPMENT ? false : ['verbose']
	});
	application.setGlobalPrefix('api');
	application.enableCors();
	application.use(helmet());
	application.useGlobalFilters(new AllExceptionFilter(), new HttpExceptionFilter());
	application.useGlobalPipes(new ValidationPipe({
		whitelist: true, transform: true,
		transformOptions: { enableImplicitConversion: true }
	}));
	application.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
			handler: (req: Request, res: Response) => {
				res.status(HttpStatus.TOO_MANY_REQUESTS)
					.send({ message: 'Too many network requests!' });
			},
			keyGenerator: (req) => {
				return getIpAddress(req);
			}
		})
	);

	morgan.token('id', request => {
		return getCurrentInvocation().event?.requestContext?.requestId || Date.now().toString();
	});
	morgan.token('invocationId', request => {
		return getCurrentInvocation().context?.awsRequestId;
	});
	application.use(morgan('LOG => :id | :invocationId | :date[iso] | :method | :status | :url - :total-time ms'));
	return { application };
}