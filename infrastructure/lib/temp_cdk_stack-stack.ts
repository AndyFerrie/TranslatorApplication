import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as Lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as iam from "aws-cdk-lib/aws-iam"

export class TempCdkStackStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		// a policy that allows the lambda to access the translate service
		const translateAccessPolicy = new iam.PolicyStatement({
			actions: ["translate:TranslateText"],
			resources: ["*"],
		})

		const lambdaFunc = new lambdaNodejs.NodejsFunction(this, "translate", {
			entry: "lambda/translate.ts",
			handler: "index",
			runtime: Lambda.Runtime.NODEJS_20_X,
			initialPolicy: [translateAccessPolicy],
		})

		const restApi = new apiGateway.RestApi(this, "translateApi")
		restApi.root.addMethod(
			"POST",
			new apiGateway.LambdaIntegration(lambdaFunc)
		)
	}
}
