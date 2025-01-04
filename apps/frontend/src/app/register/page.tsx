"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SignInState, SignUpState } from "@/lib"
import { RegistrationForm } from "@/components/RegistrationForm"
import { ConfirmSignUp } from "@/components"
import { useUser } from "@/hooks"

function AutoSignIn({
	onStepChange,
}: {
	onStepChange: (step: SignInState) => void
}) {
	const { autoLogin } = useUser()

	useEffect(() => {
		autoLogin().then((nextStep) => {
			if (nextStep) {
				onStepChange(nextStep)
			}
		})
	}, [autoLogin, onStepChange])
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
