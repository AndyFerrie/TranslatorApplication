"use client"

import { useState } from "react"
import {
	TranslateDBObject,
	TranslateRequest,
	TranslateResponse,
} from "@translatorapplication/shared-types"

const URL = "https://api.drewferrie.co.uk/"

const translateText = async ({
	sourceLang,
	targetLang,
	sourceText,
}: {
	sourceLang: string
	targetLang: string
	sourceText: string
}): Promise<TranslateResponse> => {
	try {
		const request: TranslateRequest = {
			sourceLang,
			targetLang,
			sourceText,
		}

		const result = await fetch(URL, {
			method: "POST",
			body: JSON.stringify(request),
		})

		const returnValue = (await result.json()) as Promise<TranslateResponse>

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

const getTranslations = async () => {
	try {
		const result = await fetch(URL, {
			method: "GET",
		})

		const returnValue = (await result.json()) as Array<TranslateDBObject>

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

export default function Home() {
	const [sourceText, setSourceText] = useState<string>("")
	const [sourceLang, setSourceLang] = useState<string>("")
	const [targetLang, setTargetLang] = useState<string>("")
	const [outputText, setOutputText] = useState<TranslateResponse | null>(null)
	const [translations, setTranslations] = useState<Array<TranslateDBObject>>(
		[]
	)

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<form
				className="flex flex-col gap-4"
				onSubmit={async (event) => {
					event.preventDefault()
					const result = await translateText({
						sourceLang,
						targetLang,
						sourceText,
					})
					setOutputText(result)
				}}
			>
				<div className="flex flex-col">
					<label
						className="mb-2"
						htmlFor="inputText"
					>
						Input Text
					</label>
					<textarea
						id="inputText"
						value={sourceText}
						onChange={(event) => setSourceText(event.target.value)}
					/>
				</div>

				<div className="flex flex-col">
					<label
						className="mb-2"
						htmlFor="sourceLang"
					>
						Source Language
					</label>
					<input
						id="sourceLang"
						value={sourceLang}
						onChange={(event) => setSourceLang(event.target.value)}
						type="text"
					/>
				</div>

				<div className="flex flex-col">
					<label
						className="mb-2"
						htmlFor="targetLang"
					>
						Target Language
					</label>
					<input
						id="targetLang"
						value={targetLang}
						onChange={(event) => setTargetLang(event.target.value)}
						type="text"
					/>
				</div>

				<button
					className="btn bg-blue-500 p-2 mt-2 rounded-md"
					type="submit"
				>
					Translate
				</button>
			</form>

			<div>
				<p>Result:</p>
				<pre
					className="mt-4"
					style={{ whiteSpace: "pre-wrap" }}
				>
					{JSON.stringify(outputText?.targetText, null, 2)}
				</pre>
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="button"
				onClick={async () => {
					const returnValue = await getTranslations()
					setTranslations(returnValue)
				}}
			>
				Get Translations
			</button>

			<div>
				<p>Result:</p>
				<pre
					className="mt-4"
					style={{ whiteSpace: "pre-wrap" }}
				>
					{translations.map((item) => (
						<div key={item.requestId}>
							<p>Translating: {item.sourceText}</p>
							<p>
								From: {item.sourceLang} To: {item.targetLang}
							</p>
							<p>Result: {item.targetText}</p>
						</div>
					))}
				</pre>
			</div>
		</main>
	)
}
