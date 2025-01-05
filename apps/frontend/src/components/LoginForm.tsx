"use client"

import React from "react"
import { LoginFormData } from "@/lib"
import { useForm, SubmitHandler } from "react-hook-form"
import { useUser } from "@/hooks/useUser"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export const LoginForm = ({ onSignedIn }: { onSignedIn?: () => void }) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>()

	const { login, busy } = useUser()

	const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
		if (event) {
			event.preventDefault()
		}
		login(data).then(() => {
			if (onSignedIn) {
				onSignedIn()
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

			<Button type="submit">{busy ? "Logging in..." : "Login"}</Button>
		</form>
	)
}
