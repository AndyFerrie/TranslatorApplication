"use client"

import { useState } from "react"
import { useTranslate } from "@/hooks"

export default function Home() {
	const [sourceText, setSourceText] = useState<string>("")
	const [sourceLang, setSourceLang] = useState<string>("")
	const [targetLang, setTargetLang] = useState<string>("")

	const {
		isLoading,
		translations,
		translate,
		isTranslating,
		deleteTranslation,
		isDeleting,
	} = useTranslate()

	if (isLoading) {
		return <p>loading...</p>
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<form
				className="flex flex-col gap-4"
				onSubmit={(event) => {
					event.preventDefault()
					translate({
						sourceLang,
						targetLang,
						sourceText,
					})
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
					{isTranslating ? "Translating..." : "Translate"}
				</button>
			</form>

			<div className="flex flex-col">
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
							onClick={() => {
								deleteTranslation(item)
							}}
						>
							{isDeleting ? "..." : "X"}
						</button>
					</div>
				))}
			</div>
		</main>
	)
}
