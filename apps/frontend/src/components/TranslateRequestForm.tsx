"use client"

import { useTranslate } from "@/hooks"
import { TranslateRequest } from "@translatorapplication/shared-types"
import React, { useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useApp } from "./AppProvider"
import { Combobox, ComboboxOption } from "./ui/combobox"
import { Language, LANGUAGE_LIST } from "@/lib"

const languageOptions: Array<ComboboxOption<Language>> = LANGUAGE_LIST.map(
	(item) => ({
		value: item.name,
		label: item.name,
		data: item,
	})
)

export const TranslateRequestForm = () => {
	const { translate, isTranslating } = useTranslate()
	const { selectedTranslation } = useApp()

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<TranslateRequest>()

	useEffect(() => {
		if (selectedTranslation) {
			setValue("sourceLang", selectedTranslation?.sourceLang)
			setValue("sourceText", selectedTranslation?.sourceText)
			setValue("targetLang", selectedTranslation?.targetLang)
		} else {
			setValue("sourceLang", "")
			setValue("sourceText", "")
			setValue("targetLang", "")
		}
	}, [selectedTranslation, setValue])

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
				<Label
					className="mb-2"
					htmlFor="sourceText"
				>
					Input Text
				</Label>
				<Textarea
					id="sourceText"
					rows={3}
					{...register("sourceText", { required: true })}
				/>
				{errors.sourceText && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="sourceLang"
				>
					Source Language
				</Label>
				<Combobox
					placeholder="Language"
					options={languageOptions}
					selected={languageOptions.find(
						(i) => i.data.code === selectedTranslation?.sourceLang
					)}
					onSelect={(a) => {
						if (a.data.code === getValues("sourceLang")) {
							setValue("sourceLang", "")
						} else {
							setValue("sourceLang", a.data.code)
						}
					}}
					{...register("sourceLang", { required: true })}
				/>
				{errors.sourceLang && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="targetLang"
				>
					Target Language
				</Label>
				<Combobox
					placeholder="Language"
					options={languageOptions}
					selected={languageOptions.find(
						(i) => i.data.code === selectedTranslation?.targetLang
					)}
					onSelect={(a) => {
						if (a.data.code === getValues("targetLang")) {
							setValue("targetLang", "")
						} else {
							setValue("targetLang", a.data.code)
						}
					}}
					{...register("targetLang", { required: true })}
				/>
				{errors.targetLang && <span>field required</span>}
			</div>

			<Button type="submit">
				{isTranslating ? "Translating..." : "Translate"}
			</Button>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="targetText"
				>
					Translated text:
				</Label>
				<Textarea
					readOnly
					id="targetText"
					rows={3}
					value={selectedTranslation?.targetText || ""}
				/>
			</div>
		</form>
	)
}
