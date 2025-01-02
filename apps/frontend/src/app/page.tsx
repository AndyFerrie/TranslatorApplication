"use client"

import { useState } from "react"
import {
	TranslateDBObject,
	TranslateRequest,
	TranslateResponse,
} from "@translatorapplication/shared-types"
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth"

const URL = "https://api.drewferrie.co.uk"

const translatePublicText = async ({
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

		const result = await fetch(`${URL}/public`, {
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
const translateUsersText = async ({
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

		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "POST",
			body: JSON.stringify(request),
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})

		const returnValue = (await result.json()) as Promise<TranslateResponse>

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

const getUsersTranslations = async () => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})

		const returnValue = (await result.json()) as Array<TranslateDBObject>

		return returnValue
	} catch (e: unknown) {
		console.error(e)
		throw e
	}
}

const deleteUserTranslation = async (item: {
	requestId: string
	username: string
}) => {
	try {
		const authToken = (await fetchAuthSession()).tokens?.idToken?.toString()

		const result = await fetch(`${URL}/user`, {
			method: "DELETE",
			body: JSON.stringify(item),
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
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
					let result = null
					try {
						const user = await getCurrentUser()

						if (user) {
							result = await translateUsersText({
								sourceLang,
								targetLang,
								sourceText,
							})
						} else {
							throw new Error("User not logged in")
						}
					} catch (error) {
						console.log(error)
						result = await translatePublicText({
							sourceLang,
							targetLang,
							sourceText,
						})
					}
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
					const returnValue = await getUsersTranslations()
					setTranslations(returnValue)
				}}
			>
				Get Translations
			</button>

			<div className="flex flex-col">
				<h3 className="mt-4 text-lg">Your saved translations:</h3>
				{translations.map((item) => (
					<div
						className="flex flex-col justify-between rounded-lg p-4 m-4 bg-slate-400"
						key={item.requestId}
					>
						<p>From: {item.sourceLang}</p>
						<p className="bg-slate-200 p-1 rounded-md my-2">
							{item.sourceText}
						</p>
						<p>To: {item.targetLang}</p>
						<p className="bg-slate-200 p-1 rounded-md my-2">
							{item.targetText}
						</p>
						<button
							className="btn bg-red-500 hover:bg-red-400 rounded-md mt-2"
							type="button"
							onClick={async () => {
								const returnValue = await deleteUserTranslation(
									{
										requestId: item.requestId,
										username: item.username,
									}
								)
								setTranslations(returnValue)
							}}
						>
							X
						</button>
					</div>
				))}
			</div>
		</main>
	)
}
