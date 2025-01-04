/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useApp } from "@/components"
import {
	LoginFormData,
	RegisterConfirmation,
	RegistrationFormData,
	SignInState,
	SignUpState,
} from "@/lib"
import {
	signIn,
	getCurrentUser,
	signOut,
	signUp,
	confirmSignUp,
	autoSignIn,
} from "aws-amplify/auth"
import { useCallback, useEffect, useState } from "react"

export const useUser = () => {
	const [busy, setBusy] = useState<boolean>(false)
	const { user, setUser, setError, resetError } = useApp()

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
		} catch (error: unknown) {
			console.error(error)
			setUser(null)
		}
	}

	const login = useCallback(async ({ email, password }: LoginFormData) => {
		try {
			setBusy(true)
			resetError()
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
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		} finally {
			setBusy(false)
		}
	}, [])

	const logout = useCallback(async () => {
		try {
			setBusy(true)
			resetError()
			await signOut()
			setUser(null)
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		} finally {
			setBusy(false)
		}
	}, [])

	const register = async ({
		email,
		password,
		password2,
	}: RegistrationFormData): Promise<SignUpState | null> => {
		let returnValue = null
		try {
			setBusy(true)
			resetError()
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
			returnValue = nextStep as SignUpState
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		} finally {
			setBusy(false)
			return returnValue
		}
	}

	const confirmRegister = async ({
		email,
		verificationCode,
	}: RegisterConfirmation): Promise<SignUpState | null> => {
		let returnValue = null
		try {
			setBusy(true)
			resetError()
			const { nextStep } = await confirmSignUp({
				confirmationCode: verificationCode,
				username: email,
			})
			returnValue = nextStep as SignUpState
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		} finally {
			setBusy(false)
			return returnValue
		}
	}

	const autoLogin = useCallback(async (): Promise<SignInState | null> => {
		let returnValue = null
		try {
			setBusy(true)
			resetError()
			const { nextStep } = await autoSignIn()
			returnValue = nextStep as SignInState
			await getUser()
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError(String(error))
			}
		} finally {
			setBusy(false)
			return returnValue
		}
	}, [])

	return {
		busy,
		user,
		login,
		logout,
		register,
		confirmRegister,
		autoLogin,
	}
}
