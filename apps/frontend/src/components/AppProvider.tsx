"use client"

import { AuthUser } from "aws-amplify/auth"
import React, { useContext, createContext, useState } from "react"

type AppContext = {
	user: AuthUser | null | undefined
	setUser: (user: AuthUser | null) => void
}

const AppContext = createContext<AppContext>({
	user: null,
	setUser: () => {},
})

function useInitialApp(): AppContext {
	const [user, setUser] = useState<AuthUser | null | undefined>(undefined)

	return {
		user,
		setUser,
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
