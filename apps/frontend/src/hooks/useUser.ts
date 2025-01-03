"use client"

import { useApp } from "@/components"
import { LoginFormData } from "@/lib"
import { signIn, getCurrentUser } from "aws-amplify/auth"
import { useEffect, useState } from "react"

export const useUser = () => {
	const [busy, setBusy] = useState<boolean>(false)
	const { user, setUser } = useApp()

	useEffect(() => {
		async function fetchUser() {
			setBusy(true)
			await getUser()
			setBusy(false)
		}
		fetchUser()
	}, [])

	const getUser = async () => {
		try {
			const currentUser = await getCurrentUser()
			setUser(currentUser)
		} catch (error) {
			console.error(error)
			setUser(null)
		}
	}

	const login = async ({ email, password }: LoginFormData) => {
		try {
			setBusy(true)
			await signIn({
				username: email,
				password,
				options: {
					userAttributes: {
						email,
					},
				},
			})
			await getUser()
		} catch (error: unknown) {
			console.error(error)
		} finally {
			setBusy(false)
		}
	}

	return {
		busy,
		user,
		login,
	}
}
