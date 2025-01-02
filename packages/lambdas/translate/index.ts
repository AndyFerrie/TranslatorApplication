import * as lambda from "aws-lambda"
import {
	gateway,
	getTranslation,
	exception,
	translationTable,
} from "/opt/nodejs/utils-lambda-layer"
import {
	TranslateDBObject,
	TranslateRequest,
	TranslateResponse,
} from "@translatorapplication/shared-types"

const {
	TRANSLATION_TABLE_NAME,
	TRANSLATION_PARTITION_KEY,
	TRANSLATION_SORT_KEY,
} = process.env

if (!TRANSLATION_TABLE_NAME) {
	throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME")
}

if (!TRANSLATION_PARTITION_KEY) {
	throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY")
}

if (!TRANSLATION_SORT_KEY) {
	throw new exception.MissingEnvironmentVariable("TRANSLATION_SORT_KEY")
}

const translateTable = new translationTable({
	tableName: TRANSLATION_TABLE_NAME,
	partitionKey: TRANSLATION_PARTITION_KEY,
	sortKey: TRANSLATION_SORT_KEY,
})

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
	const claims = event.requestContext.authorizer?.claims
	if (!claims) {
		throw new Error("User not authenticated")
	}

	const username = claims["cognito:username"]
	if (!username) {
		throw new Error("Username does not exist")
	}
	return username
}

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData()
		}

		const body = JSON.parse(event.body) as TranslateRequest

		const now = new Date(Date.now()).toString()
		console.log(now)

		const result = await getTranslation(body)
		console.log(result)

		if (!result.TranslatedText) {
			throw new exception.MissingParameters("TranslatedText")
		}

		const returnData: TranslateResponse = {
			timestamp: now,
			targetText: result.TranslatedText,
		}

		return gateway.createSuccessJsonResponse(returnData)
	} catch (e: any) {
		console.error(e)
		return gateway.createErrorJsonResponse(e)
	}
}

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		const username = getUsername(event)

		if (!event.body) {
			throw new exception.MissingBodyData()
		}

		const body = JSON.parse(event.body) as TranslateRequest

		const now = new Date(Date.now()).toString()
		console.log(now)

		const result = await getTranslation(body)
		console.log(result)

		if (!result.TranslatedText) {
			throw new exception.MissingParameters("TranslatedText")
		}

		const returnData: TranslateResponse = {
			timestamp: now,
			targetText: result.TranslatedText,
		}

		const tableObj: TranslateDBObject = {
			requestId: context.awsRequestId,
			username,
			...body,
			...returnData,
		}

		await translateTable.insert(tableObj)

		return gateway.createSuccessJsonResponse(returnData)
	} catch (e: any) {
		console.error(e)
		return gateway.createErrorJsonResponse(e)
	}
}

export const getUserTranslations: lambda.APIGatewayProxyHandler =
	async function (
		event: lambda.APIGatewayProxyEvent,
		context: lambda.Context
	) {
		try {
			const username = getUsername(event)

			// const returnData = await translateTable.getAll()
			const returnData = await translateTable.query({ username })
			return gateway.createSuccessJsonResponse(returnData)
		} catch (e: any) {
			console.error(e)
			return gateway.createErrorJsonResponse(e)
		}
	}

export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
	async function (
		event: lambda.APIGatewayProxyEvent,
		context: lambda.Context
	) {
		try {
			const username = getUsername(event)

			if (!event.body) {
				throw new exception.MissingBodyData()
			}

			let body = JSON.parse(event.body) as { requestId: string }

			if (!body.requestId) {
				throw new exception.MissingParameters("requestId")
			}

			let requestId = body.requestId

			const returnData = await translateTable.delete({
				username,
				requestId,
			})
			return gateway.createSuccessJsonResponse(returnData)
		} catch (e: any) {
			console.error(e)
			return gateway.createErrorJsonResponse(e)
		}
	}
