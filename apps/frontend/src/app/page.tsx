"use client"

import { useState } from "react"
import {
	TranslateRequest,
	TranslateResponse,
} from "@translatorapplication/shared-types"

const URL = "https://1u1tcpeox0.execute-api.eu-west-2.amazonaws.com/prod/"

export const translateText = async ({
	sourceLang,
	targetLang,
	text,
}: {
	sourceLang: string
	targetLang: string
	text: string
}): Promise<TranslateResponse> => {
	try {
		const request: TranslateRequest = {
			sourceLang,
			targetLang,
			text,
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

export default function Home() {
	const [text, setText] = useState<string>("")
	const [sourceLang, setSourceLang] = useState<string>("")
	const [targetLang, setTargetLang] = useState<string>("")
	const [outputText, setOutputText] = useState<TranslateResponse | null>(null)

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<form
				className="flex flex-col gap-4"
				onSubmit={async (event) => {
					event.preventDefault()
					const result = await translateText({
						sourceLang,
						targetLang,
						text,
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
						value={text}
						onChange={(event) => setText(event.target.value)}
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
			<pre
				className="mt-4"
				style={{ whiteSpace: "pre-wrap" }}
			>
				{JSON.stringify(outputText?.text, null, 2)}
			</pre>
		</main>
	)
}
