"use client"

import React from "react"
import { RegisterConfirmation, SignUpState } from "@/lib"
import { useForm, SubmitHandler } from "react-hook-form"
import { useUser } from "@/hooks"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export const ConfirmSignUp = ({
	onStepChange,
}: {
	onStepChange: (step: SignUpState) => void
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterConfirmation>()

	const { busy, confirmRegister } = useUser()

	const onSubmit: SubmitHandler<RegisterConfirmation> = async (
		data,
		event
	) => {
		if (event) {
			event.preventDefault()
		}

		confirmRegister(data).then((nextStep) => {
			if (nextStep) {
				onStepChange(nextStep)
			}
		})
	}

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="email"
				>
					Email
				</Label>
				<Input
					id="email"
					type="email"
					{...register("email", { required: true })}
				/>
				{errors.email && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="verificationCode"
				>
					Verification Code
				</Label>
				<Input
					id="verificationCode"
					type="string"
					{...register("verificationCode", { required: true })}
				/>
				{errors.verificationCode && <span>field required</span>}
			</div>

			<Button type="submit">{busy ? "Confirming..." : "Confirm"}</Button>
		</form>
	)
}
