"use client"

import React from "react"
import { RegistrationFormData, SignUpState } from "@/lib"
import { useForm, SubmitHandler } from "react-hook-form"
import { useUser } from "@/hooks"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

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

	const { busy, register: accountRegister } = useUser()

	const onSubmit: SubmitHandler<RegistrationFormData> = async (
		data,
		event
	) => {
		if (event) {
			event.preventDefault()
		}
		accountRegister(data).then((nextStep) => {
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
					disabled={busy}
					id="email"
					type="email"
					{...register("email", { required: true })}
				/>
				{errors.email && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="password"
				>
					Password
				</Label>
				<Input
					disabled={busy}
					id="password"
					type="password"
					{...register("password", { required: true })}
				/>
				{errors.password && <span>field required</span>}
			</div>

			<div className="flex flex-col">
				<Label
					className="mb-2"
					htmlFor="password2"
				>
					Retype Password
				</Label>
				<Input
					disabled={busy}
					id="password2"
					type="password"
					{...register("password2", { required: true })}
				/>
				{errors.password2 && <span>field required</span>}
			</div>

			<Button type="submit">
				{busy ? "Registering..." : "Register"}
			</Button>
		</form>
	)
}
