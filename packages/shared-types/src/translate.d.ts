export type TranslateRequest = {
	sourceLang: string
	targetLang: string
	sourceText: string
}

export type TranslateResponse = {
	timestamp: string
	targetText: string
}

export type TranslatePrimaryKey = {
	username: string
	requestId: string
}

export type TranslateResult = TranslateRequest &
	TranslateResponse &
	TranslatePrimaryKey

export type TranslateResultList = Array<TranslateResult>
