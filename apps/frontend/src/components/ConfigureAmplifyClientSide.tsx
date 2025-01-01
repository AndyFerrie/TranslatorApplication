"use client"
import { Amplify } from "aws-amplify"

Amplify.configure(
	{
		Auth: {
			Cognito: {
				userPoolId: "us-east-1_X8ki8pBBp",
				userPoolClientId: "3egnr61min3h9msshg15c4vq40",
			},
		},
	},
	{
		ssr: true,
	}
)

export function ConfigureAmplify() {
	return null
}
