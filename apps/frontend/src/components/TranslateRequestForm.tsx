"use client"

import { useTranslate } from "@/hooks"
import { TranslateRequest } from "@translatorapplication/shared-types"
import React from "react"
import { useForm, SubmitHandler } from "react-hook-form"

export const TranslateRequestForm = () => {
	const { translate, isTranslating } = useTranslate()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TranslateRequest>()

	const onSubmit: SubmitHandler<TranslateRequest> = (data, event) => {
		if (event) {
			event.preventDefault()
		}
		translate(data)
	}

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="sourceText"
				>
					Input Text
				</label>
				<textarea
					id="sourceText"
					rows={3}
					{...register("sourceText", { required: true })}
				/>
				{errors.sourceText && <span>field required</span>}
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
					type="text"
					{...register("sourceLang", { required: true })}
				/>
				{errors.sourceLang && <span>field required</span>}
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
					type="text"
					{...register("targetLang", { required: true })}
				/>
				{errors.targetLang && <span>field required</span>}
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				{isTranslating ? "Translating..." : "Translate"}
			</button>
		</form>
	)
}
