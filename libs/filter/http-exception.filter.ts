import { UtilityService } from '@app/utility';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiResponse, DefinedAppEnvironmentEnum, EnvironmentConfig } from 'libs';
import { ResponseMessageEnum } from 'libs/constants';


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

	catch(exception: HttpException, host: ArgumentsHost) {
		const http = host.switchToHttp();
		const response = http.getResponse<Response>();
		const { method, url } = http.getRequest<Request>();
		let statusCode = exception?.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
		let message:string = (exception as Record<string, any>)?.response?.message || exception?.message || ResponseMessageEnum.INTERNAL_SERVER_ERROR;
		if (Array.isArray(message)) {
			message = JSON.stringify(message);
		}

		if (statusCode > 499 && (message === '' || !message)) {
			message = ResponseMessageEnum.INTERNAL_SERVER_ERROR
		}

		if (message === 'Unauthorized' && statusCode === HttpStatus.UNAUTHORIZED) {
			statusCode = HttpStatus.UNAUTHORIZED;
			message = ResponseMessageEnum.LOGIN_SESSION_EXPIRED;
		}

		const error: any = {
			statusCode,
			timestamp: new UtilityService().GenerateISODate(),
			method,
			path: url,
			message
		};

		if (statusCode > 499 && statusCode < 600) {
			if (EnvironmentConfig.NODE_ENV !== DefinedAppEnvironmentEnum.DEVELOPMENT) {
				// SendErrorToSlack({ ...error });
				// new SlackLogger().log(error);
				console.log(`ERROR => ${JSON.stringify(error)}`);
			}
		}

		response.status(statusCode).json(new ApiResponse({ error, message: error.message }));
	}
}