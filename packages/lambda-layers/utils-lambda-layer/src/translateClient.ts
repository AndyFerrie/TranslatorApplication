import * as clientTranslate from "@aws-sdk/client-translate"
import { TranslateRequest } from "@translatorapplication/shared-types"

export async function getTranslation({
	sourceLang,
	targetLang,
	sourceText,
}: TranslateRequest) {
	const translateClient = new clientTranslate.TranslateClient({})

	const translateCmd = new clientTranslate.TranslateTextCommand({
		SourceLanguageCode: sourceLang,
		TargetLanguageCode: targetLang,
		Text: sourceText,
	})

	const result = await translateClient.send(translateCmd)

	return result
}