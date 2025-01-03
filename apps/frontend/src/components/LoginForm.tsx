"use client"

import React from "react"
import { LoginFormData } from "@/lib"
import { signIn } from "aws-amplify/auth"
import { useForm, SubmitHandler } from "react-hook-form"

export const LoginForm = ({ onSignedIn }: { onSignedIn: () => void }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>()

	const onSubmit: SubmitHandler<LoginFormData> = async (
		{ email, password },
		event
	) => {
		if (event) {
			event.preventDefault()
		}

		try {
			await signIn({
				username: email,
				password,
				options: {
					userAttributes: {
						email,
					},
				},
			})
			onSignedIn()
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

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				{"login"}
			</button>
		</form>
	)
}
