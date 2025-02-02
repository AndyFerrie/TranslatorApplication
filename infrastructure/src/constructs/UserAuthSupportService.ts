import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as cognito from "aws-cdk-lib/aws-cognito"

export interface UserAuthSupportServiceProps extends cdk.StackProps {}

export class UserAuthSupportService extends Construct {
	userPool: cognito.UserPool
	constructor(
		scope: Construct,
		id: string,
		props?: UserAuthSupportServiceProps
	) {
		super(scope, id)

		this.userPool = new cognito.UserPool(this, "translatorUserPool", {
			selfSignUpEnabled: true,
			signInAliases: { email: true },
			autoVerify: { email: true },
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		})

		const userPoolClient = new cognito.UserPoolClient(
			this,
			"translatorUserPoolClient",
			{
				userPool: this.userPool,
				userPoolClientName: "translator-web-client",
				generateSecret: false,
				supportedIdentityProviders: [
					cognito.UserPoolClientIdentityProvider.COGNITO,
				],
			}
		)

		new cdk.CfnOutput(this, "userPoolId", {
			value: this.userPool.userPoolId,
		})

		new cdk.CfnOutput(this, "userPoolClientId", {
			value: userPoolClient.userPoolClientId,
		})
	}
}
