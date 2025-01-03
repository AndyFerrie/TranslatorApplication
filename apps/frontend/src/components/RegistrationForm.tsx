"use client"

import React from "react"
import { RegistrationFormData, SignUpState } from "@/lib"
import { signUp } from "aws-amplify/auth"
import { useForm, SubmitHandler } from "react-hook-form"

export const RegistrationForm = ({
	onStepChange,
}: {
	onStepChange: (step: SignUpState) => void
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegistrationFormData>()

	const onSubmit: SubmitHandler<RegistrationFormData> = async (
		{ email, password, password2 },
		event
	) => {
		if (event) {
			event.preventDefault()
		}

		try {
			if (password !== password2) {
				throw new Error("passwords do not match")
			}

			const { nextStep } = await signUp({
				username: email,
				password: password,
				options: {
					userAttributes: {
						email,
					},
					autoSignIn: true,
				},
			})

			onStepChange(nextStep)
		} catch (error: unknown) {
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
					htmlFor="password"
				>
					Password
				</label>
				<input
					id="password"
					type="password"
					{...register("password", { required: true })}
				/>
				{errors.password && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="password2"
				>
					Retype Password
				</label>
				<input
					id="password2"
					type="password"
					{...register("password2", { required: true })}
				/>
				{errors.password2 && <span>field required</span>}
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				{"register"}
			</button>
		</form>
	)
}
