import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { Request, Response } from 'express';
import { UtilityService } from 'libs';
import { ResponseMessageEnum } from 'libs/constants';
import { ApiResponse } from 'libs/helper';
import { ObjectType } from 'libs/types';



@Catch()
export class AllExceptionFilter implements ExceptionFilter {
	catch(exception: ObjectType, host: ArgumentsHost) {
		const http = host.switchToHttp();
		const response = http.getResponse<Response>();
		const { method, url } = http.getRequest<Request>();
		let statusCode = exception instanceof HttpException ? exception?.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.INTERNAL_SERVER_ERROR;
		let message = exception.response?.message as string || exception?.message || ResponseMessageEnum.INTERNAL_SERVER_ERROR;
		if (Array.isArray(message)) {
			message = JSON.stringify(message);
		}

		if (message === 'invalid signature') {
			statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
			message = 'Invalid token signature!';
		}
		if (message === 'jwt malformed' || message === 'jwt must be provided') {
			statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
			message = 'Invalid verification token!';
		}
		if (message === 'jwt expired') {
			statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
			message = 'Token is expired!';
		}
		if (message === 'NOT_A_NUMBER') {
			message = 'Not a valid phone number!';
		}

		const error: any = {
			statusCode,
			timestamp: new UtilityService().GenerateISODate(),
			method,
			path: url,
			message
		};

		response.status(statusCode).json(new ApiResponse({ error, message }));
	}
}