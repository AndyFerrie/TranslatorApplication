import { SignUpOutput, SignInOutput } from "aws-amplify/auth"

export type SignUpState = SignUpOutput["nextStep"]
export type SignInState = SignInOutput["nextStep"]

export type RegistrationFormData = {
	email: string
	password: string
	password2: string
}

export type RegisterConfirmation = {
	email: string
	verificationCode: string
}

export type LoginFormData = {
	email: string
	password: string
}
