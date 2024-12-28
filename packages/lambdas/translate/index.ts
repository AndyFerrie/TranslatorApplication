import * as clientTranslate from "@aws-sdk/client-translate"
import * as dynamodb from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import * as lambda from "aws-lambda"
import {
	TranslateDBObject,
	TranslateRequest,
	TranslateResponse,
} from "@translatorapplication/shared-types"

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env

if (!TRANSLATION_TABLE_NAME) {
	throw new Error("TRANSLATION_TABLE_NAME is empty")
}

if (!TRANSLATION_PARTITION_KEY) {
	throw new Error("TRANSLATION_PARTITION_KEY is empty")
}

const translateClient = new clientTranslate.TranslateClient({})
const dynamodbClient = new dynamodb.DynamoDBClient({})

export const translate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		if (!event.body) {
			throw new Error("body is empty")
		}

		const body = JSON.parse(event.body) as TranslateRequest
		const { sourceLang, targetLang, text } = body

		const now = new Date(Date.now()).toString()
		console.log(now)

		const translateCmd = new clientTranslate.TranslateTextCommand({
			SourceLanguageCode: sourceLang,
			TargetLanguageCode: targetLang,
			Text: text,
		})

		const result = await translateClient.send(translateCmd)
		console.log(result)

		if (!result.TranslatedText) {
			throw new Error("TranslatedText is empty")
		}

		const returnData: TranslateResponse = {
			timestamp: now,
			text: result.TranslatedText,
		}

		const tableObj: TranslateDBObject = {
			requestId: context.awsRequestId,
			...body,
			...returnData,
		}

		const tableInsertCommand: dynamodb.PutItemCommandInput = {
			TableName: TRANSLATION_TABLE_NAME,
			Item: marshall(tableObj),
		}

		await dynamodbClient.send(
			new dynamodb.PutItemCommand(tableInsertCommand)
		)

		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": true,
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			body: JSON.stringify(returnData),
		}
	} catch (e: any) {
		console.error(e)
		return {
			statusCode: 500,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": true,
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			body: JSON.stringify(e.toString()),
		}
	}
}

export const getTranslations: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context
) {
	try {
		const scanCommand: dynamodb.ScanCommandInput = {
			TableName: TRANSLATION_TABLE_NAME,
		}

		console.log("scanCommand", scanCommand)

		const { Items } = await dynamodbClient.send(
			new dynamodb.ScanCommand(scanCommand)
		)

		if (!Items) {
			throw new Error("no items found")
		}

		console.log("Items", Items)

		const returnData = Items.map(
			(item) => unmarshall(item) as TranslateDBObject
		)
		console.log("returnData", returnData)

		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": true,
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			body: JSON.stringify(returnData),
		}
	} catch (e: any) {
		console.error(e)
		return {
			statusCode: 500,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": true,
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			body: JSON.stringify(e.toString()),
		}
	}
}
