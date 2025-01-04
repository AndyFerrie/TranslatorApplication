import * as lambda from "aws-lambda"
import {
	gateway,
	getTranslation,
	exception,
	translationTable,
} from "/opt/nodejs/utils-lambda-layer"
import {
	TranslateResult,
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

const getCurrentTime = () => {
	return Date.now()
}

const formatTime = (time: number) => {
	return new Date(time).toString()
}

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData()
		}

		const request = JSON.parse(event.body) as TranslateRequest

		const nowEpoch = getCurrentTime()
		const targetText = await getTranslation(request)

		const response: TranslateResponse = {
			timestamp: formatTime(nowEpoch),
			targetText,
		}

		const result: TranslateResult = {
			requestId: nowEpoch.toString(),
			username: "",
			...request,
			...response,
		}

		return gateway.createSuccessJsonResponse(result)
	} catch (e: any) {
		console.error(e)
		return gateway.createErrorJsonResponse(e.toString())
	}
}

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData()
		}

		const username = getUsername(event)

		const request = JSON.parse(event.body) as TranslateRequest

		const nowEpoch = getCurrentTime()

		const targetText = await getTranslation(request)

		const response: TranslateResponse = {
			timestamp: formatTime(nowEpoch),
			targetText,
		}

		const result: TranslateResult = {
			requestId: nowEpoch.toString(),
			username,
			...request,
			...response,
		}

		await translateTable.insert(result)

		return gateway.createSuccessJsonResponse(result)
	} catch (e: any) {
		console.error(e)
		return gateway.createErrorJsonResponse(e.toString())
	}
}

export const getUserTranslations: lambda.APIGatewayProxyHandler =
	async function (event: lambda.APIGatewayProxyEvent) {
		try {
			const username = getUsername(event)

			const response = await translateTable.query({
				username,
				requestId: "",
			})
			return gateway.createSuccessJsonResponse(response)
		} catch (e: any) {
			console.error(e)
			return gateway.createErrorJsonResponse(e)
		}
	}

export const deleteUserTranslation: lambda.APIGatewayProxyHandler =
	async function (event: lambda.APIGatewayProxyEvent) {
		try {
			const username = getUsername(event)

			if (!event.body) {
				throw new exception.MissingBodyData()
			}

			let request = JSON.parse(event.body) as { requestId: string }

			if (!request.requestId) {
				throw new exception.MissingParameters("requestId")
			}

			let requestId = request.requestId

			const response = await translateTable.delete({
				username,
				requestId,
			})
			return gateway.createSuccessJsonResponse(response)
		} catch (e: any) {
			console.error(e)
			return gateway.createErrorJsonResponse(e)
		}
	}
