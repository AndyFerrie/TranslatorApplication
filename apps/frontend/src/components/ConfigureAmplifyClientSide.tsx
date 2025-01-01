"use client"
import { Amplify } from "aws-amplify"

Amplify.configure(
	{
		Auth: {
			Cognito: {
				userPoolId: "us-east-1_DxqQhdd2i",
				userPoolClientId: "27hqc4217c06r808k6shc0fpnv",
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
