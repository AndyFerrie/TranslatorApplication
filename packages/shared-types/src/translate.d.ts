export type TranslateRequest = {
	sourceLang: string
	targetLang: string
	text: string
}

export type TranslateResponse = {
	timestamp: string
	text: string
}

export type TranslateDBObject = TranslateRequest &
	TranslateResponse & {
		requestId: string
	}
