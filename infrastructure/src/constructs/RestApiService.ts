import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53Targets from "aws-cdk-lib/aws-route53-targets"
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as cognito from "aws-cdk-lib/aws-cognito"

export interface RestApiServiceProps extends cdk.StackProps {
	apiUrl: string
	certificate: acm.Certificate
	zone: route53.IHostedZone
	userPool?: cognito.UserPool
}

export class RestApiService extends Construct {
	public restApi: apiGateway.RestApi
	public authorizer?: apiGateway.CognitoUserPoolsAuthorizer
	constructor(
		scope: Construct,
		id: string,
		{ apiUrl, certificate, zone, userPool }: RestApiServiceProps
	) {
		super(scope, id)

		this.restApi = new apiGateway.RestApi(this, "translateApi", {
			domainName: {
				domainName: apiUrl,
				certificate,
			},
			defaultCorsPreflightOptions: {
				allowOrigins: apiGateway.Cors.ALL_ORIGINS,
				allowMethods: apiGateway.Cors.ALL_METHODS,
				allowCredentials: true,
				allowHeaders: apiGateway.Cors.DEFAULT_HEADERS,
			},
		})

		if (userPool) {
			this.authorizer = new apiGateway.CognitoUserPoolsAuthorizer(
				this.restApi,
				"authorizer",
				{
					cognitoUserPools: [userPool],
					authorizerName: "userPoolAuthorizer",
				}
			)
		}

		new route53.ARecord(this, "apiDns", {
			zone,
			recordName: "api",
			target: route53.RecordTarget.fromAlias(
				new route53Targets.ApiGateway(this.restApi)
			),
		})
	}

	addTranslateMethod({
		httpMethod,
		lambda,
		isAuth,
	}: {
		httpMethod: string
		lambda: lambda.IFunction
		isAuth?: boolean
	}) {
		let options: apiGateway.MethodOptions = {}
		if (isAuth) {
			if (!this.authorizer) {
				throw new Error("Authorizer is not set")
			}
			options = {
				authorizer: this.authorizer,
				authorizationType: apiGateway.AuthorizationType.COGNITO,
			}
		}
		this.restApi.root.addMethod(
			httpMethod,
			new apiGateway.LambdaIntegration(lambda),
			options
		)
	}
}
