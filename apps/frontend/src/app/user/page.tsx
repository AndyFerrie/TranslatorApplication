"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, signOut } from "aws-amplify/auth"
import { LoginForm } from "@/components"

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
	return (
		<div>
			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				onClick={async () => {
					await signOut()
					onSignedOut()
				}}
			>
				Logout
			</button>
		</div>
	)
}
export default function User() {
	const [user, setUser] = useState<object | null | undefined>(undefined)

	useEffect(() => {
		async function fetchUser() {
			try {
				const currentUser = await getCurrentUser()
				setUser(currentUser)
			} catch (error) {
				console.error(error)
				setUser(null)
			}
		}
		fetchUser()
	}, [])

	if (user === undefined) {
		return <p>loading...</p>
	}

	if (user) {
		return (
			<Logout
				onSignedOut={() => {
					setUser(null)
				}}
			/>
		)
	}

	return (
		<LoginForm
			onSignedIn={async () => {
				const currentUser = await getCurrentUser()
				setUser(currentUser)
			}}
		/>
	)
}
