"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth"
import Link from "next/link"

function Login({ onSignedIn }: { onSignedIn: () => void }) {
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={async (event) => {
				event.preventDefault()
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
					if (error instanceof Error) {
						setError(error.message)
					} else {
						setError(String(error))
					}
				}
			}}
		>
			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="email"
				>
					Email:
				</label>
				<input
					id="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					type="email"
				/>
			</div>

			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="password"
				>
					Password:
				</label>
				<input
					id="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					type="password"
				/>
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				Login
			</button>

			<Link
				className="hover:underline"
				href="/register"
			>
				Register
			</Link>
			{error && <p className="text-red-600 font-bold">{error}</p>}
		</form>
	)
}

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
				console.log(error)
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
		<Login
			onSignedIn={async () => {
				const currentUser = await getCurrentUser()
				setUser(currentUser)
			}}
		/>
	)
}
