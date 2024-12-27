import * as clientTranslate from "@aws-sdk/client-translate"
import * as lambda from "aws-lambda"

const translateClient = new clientTranslate.TranslateClient({})

export const index: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent
) {
	try {
		if (!event.body) {
			throw new Error("body is empty")
		}

		const body = JSON.parse(event.body)
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

		const returnData = {
			timestamp: now,
			text: result.TranslatedText,
		}

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
