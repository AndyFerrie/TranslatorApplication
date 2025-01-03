"use client"

import { useToast } from "@/hooks/use-toast"
import { AuthUser } from "aws-amplify/auth"
import React, { useContext, createContext, useState } from "react"

type AppContext = {
	user: AuthUser | null | undefined
	setUser: (user: AuthUser | null) => void
	setError: (msg: string) => void
	resetError: () => void
}

const AppContext = createContext<AppContext>({
	user: null,
	setUser: () => {},
	setError: () => {},
	resetError: () => {},
})

function useInitialApp(): AppContext {
	const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
	const { toast, dismiss } = useToast()

	return {
		user,
		setUser,
		setError: (msg) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: msg,
			})
		},
		resetError: () => {
			dismiss()
		},
	}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
	const initialValue = useInitialApp()
	return (
		<AppContext.Provider value={initialValue}>
			{children}
		</AppContext.Provider>
	)
}

export function useApp() {
	return useContext(AppContext)
}
