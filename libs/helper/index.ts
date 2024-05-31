import { HttpStatus } from "@nestjs/common";
import { getCurrentInvoke } from "@vendia/serverless-express";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Request, Response } from "express";

import { ObjectType } from "libs/types";
import validator from "validator";
import { Context } from "vm";

export class BaseController {
	returnResponse<TBody extends ObjectType | ObjectType[]>(response: Response, statusCode: HttpStatus, data: any) {
		response.status(statusCode).json(data);
	}
}

export function getCurrentInvocation(): { event: APIGatewayProxyEventV2; context: Context; } {
	const invocation = getCurrentInvoke();
	return {
		event: invocation.event as APIGatewayProxyEventV2 || null,
		context: invocation.context as Context || null,
	};
}

export function getIpAddress(req: Request) {
	const ipAddress = req.ip;
	const remoteAddress = req.socket?.remoteAddress;
	const xForwardedFor = req.headers["x-forwarded-for"];
	if (xForwardedFor && typeof xForwardedFor === "string") {
		const ipCurrent = xForwardedFor.split(",")[0].trim();
		if (validator.isIP(ipCurrent)) {
			return ipCurrent;
		}
	}
	if (remoteAddress && typeof remoteAddress === "string" && validator.isIP(remoteAddress)) {
		return remoteAddress;
	}
	if (ipAddress && typeof ipAddress === "string" && validator.isIP(ipAddress)) {
		return ipAddress;
	}
	return "";
}

export class ApiResponse<TBody extends ObjectType | ObjectType[]> {
	readonly message: string;
	readonly data: TBody;
	readonly error: any;

	constructor({ data, message, error }: {
		data?: TBody;
		error?: any;
		message?: string;
	}) {
		this.data = data || null;
		this.message = message || null;
		this.error = error || null;
	}

}
