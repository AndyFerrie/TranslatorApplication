"use client"

import React from "react"
import { RegisterConfirmation, SignUpState } from "@/lib"
import { confirmSignUp } from "aws-amplify/auth"
import { useForm, SubmitHandler } from "react-hook-form"

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

	const onSubmit: SubmitHandler<RegisterConfirmation> = async (
		{ email, verificationCode },
		event
	) => {
		if (event) {
			event.preventDefault()
		}

		try {
			const { nextStep } = await confirmSignUp({
				confirmationCode: verificationCode,
				username: email,
			})

			onStepChange(nextStep)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="email"
				>
					Email
				</label>
				<input
					id="email"
					type="email"
					{...register("email", { required: true })}
				/>
				{errors.email && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="verificationCode"
				>
					Verification Code
				</label>
				<input
					id="verificationCode"
					type="string"
					{...register("verificationCode", { required: true })}
				/>
				{errors.verificationCode && <span>field required</span>}
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				{"confirm"}
			</button>
		</form>
	)
}
