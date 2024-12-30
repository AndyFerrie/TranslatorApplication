import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53Targets from "aws-cdk-lib/aws-route53-targets"
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as lambda from "aws-cdk-lib/aws-lambda"

export interface RestApiServiceProps extends cdk.StackProps {
	apiUrl: string
	certificate: acm.Certificate
	zone: route53.IHostedZone
}

export class RestApiService extends Construct {
	public restApi: apiGateway.RestApi
	constructor(
		scope: Construct,
		id: string,
		{ apiUrl, certificate, zone }: RestApiServiceProps
	) {
		super(scope, id)

		this.restApi = new apiGateway.RestApi(this, "translateApi", {
			domainName: {
				domainName: apiUrl,
				certificate,
			},
		})

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
	}: {
		httpMethod: string
		lambda: lambda.IFunction
	}) {
		this.restApi.root.addMethod(
			httpMethod,
			new apiGateway.LambdaIntegration(lambda)
		)
	}
}
