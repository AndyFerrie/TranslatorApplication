"use client"

import { useTranslate } from "@/hooks"
import { TranslateRequestForm } from "@/components"

export default function Home() {
	const { isLoading, translations, deleteTranslation, isDeleting } =
		useTranslate()

	if (isLoading) {
		return <p>loading...</p>
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<TranslateRequestForm />

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
