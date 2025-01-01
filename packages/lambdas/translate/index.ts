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

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env

if (!TRANSLATION_TABLE_NAME) {
	throw new exception.MissingEnvironmentVariable("TRANSLATION_TABLE_NAME")
}

if (!TRANSLATION_PARTITION_KEY) {
	throw new exception.MissingEnvironmentVariable("TRANSLATION_PARTITION_KEY")
}

const translateTable = new translationTable({
	tableName: TRANSLATION_TABLE_NAME,
	partitionKey: TRANSLATION_PARTITION_KEY,
})

export const translate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		const claims = event.requestContext.authorizer?.claims
		if (!claims) {
			throw new Error("User not authenticated")
		}

		const username = claims["cognito:username"]
		if (!username) {
			throw new Error("Username does not exist")
		}

		console.log(username)

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

export const getTranslations: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		const returnData = await translateTable.getAll()
		return gateway.createSuccessJsonResponse(returnData)
	} catch (e: any) {
		console.error(e)
		return gateway.createErrorJsonResponse(e)
	}
}
