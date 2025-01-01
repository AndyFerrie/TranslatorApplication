"use client"
import { useEffect, useState } from "react"
import {
	signUp,
	confirmSignUp,
	autoSignIn,
	SignUpOutput,
	SignInOutput,
} from "aws-amplify/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

type SignUpState = SignUpOutput["nextStep"]
type SignInState = SignInOutput["nextStep"]

function RegistrationForm({
	onStepChange,
}: {
	onStepChange: (step: SignUpState) => void
}) {
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [password2, setPassword2] = useState<string>("")

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={async (event) => {
				event.preventDefault()
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
				} catch (error) {
					console.log(error)
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

			<div className="flex flex-col">
				<label
					className="mb-2"
					htmlFor="password2"
				>
					Retype Password:
				</label>
				<input
					id="password2"
					value={password2}
					onChange={(event) => setPassword2(event.target.value)}
					type="password"
				/>
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				Register
			</button>

			<Link
				className="hover:underline"
				href="/user"
			>
				Login
			</Link>
		</form>
	)
}

function ConfirmSignUp({
	onStepChange,
}: {
	onStepChange: (step: SignUpState) => void
}) {
	const [verificationCode, setVerificationCode] = useState<string>("")
	const [email, setEmail] = useState<string>("")

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={async (event) => {
				event.preventDefault()
				try {
					const { nextStep } = await confirmSignUp({
						confirmationCode: verificationCode,
						username: email,
					})

					onStepChange(nextStep)
				} catch (error) {
					console.log(error)
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
					htmlFor="verificationCode"
				>
					Verification Code:
				</label>
				<input
					id="verificationCode"
					value={verificationCode}
					onChange={(event) =>
						setVerificationCode(event.target.value)
					}
					type="text"
				/>
			</div>

			<button
				className="btn bg-blue-500 p-2 mt-2 rounded-md"
				type="submit"
			>
				Confirm
			</button>
		</form>
	)
}

function AutoSignIn({
	onStepChange,
}: {
	onStepChange: (step: SignInState) => void
}) {
	useEffect(() => {
		const asyncSignIn = async () => {
			const { nextStep } = await autoSignIn()
			onStepChange(nextStep)
		}
		asyncSignIn()
	}, [onStepChange])
	return <div>Signing in...</div>
}

export default function Register() {
	const router = useRouter()
	const [step, setStep] = useState<SignInState | SignUpState | null>(null)

	useEffect(() => {
		if (!step) return
		if ((step as SignInState).signInStep === "DONE") {
			router.push("/")
		}
	}, [router, step])

	if (step) {
		if ((step as SignUpState).signUpStep === "CONFIRM_SIGN_UP") {
			return <ConfirmSignUp onStepChange={setStep} />
		}
		if ((step as SignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
			return <AutoSignIn onStepChange={setStep} />
		}
	}
	return <RegistrationForm onStepChange={setStep} />
}
