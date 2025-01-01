export type TranslateRequest = {
	sourceLang: string
	targetLang: string
	sourceText: string
}

export type TranslateResponse = {
	timestamp: string
	targetText: string
}

export type TranslateDBObject = TranslateRequest &
	TranslateResponse & {
		username: string
		requestId: string
	}
