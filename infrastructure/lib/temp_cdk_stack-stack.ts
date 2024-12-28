import * as cdk from "aws-cdk-lib"
import * as path from "path"
import { Construct } from "constructs"
import * as Lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as iam from "aws-cdk-lib/aws-iam"
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb"

export class TempCdkStackStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const projectRoot = "../"
		const lambdaDirectory = path.join(projectRoot, "packages/lambdas")

		const table = new dynamoDb.Table(this, "translations", {
			tableName: "translations",
			partitionKey: {
				name: "requestId",
				type: dynamoDb.AttributeType.STRING,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		})

		const translateServicePolicy = new iam.PolicyStatement({
			actions: ["translate:TranslateText"],
			resources: ["*"],
		})

		const translateTablePolicy = new iam.PolicyStatement({
			actions: [
				"dynamodb:PutItem",
				"dynamodb:Scan",
				"dynamodb:GetItem",
				"dynamodb:DeleteItem",
			],
			resources: ["*"],
		})

		const translateLambdaPath = path.resolve(
			path.join(lambdaDirectory, "translate/index.ts")
		)
		const lambdaFunc = new lambdaNodejs.NodejsFunction(this, "translate", {
			entry: translateLambdaPath,
			handler: "index",
			runtime: Lambda.Runtime.NODEJS_20_X,
			initialPolicy: [translateServicePolicy, translateTablePolicy],
			environment: {
				TRANSLATION_TABLE_NAME: table.tableName,
				TRANSLATION_PARTITION_KEY: "requestId",
			},
		})

		const restApi = new apiGateway.RestApi(this, "translateApi")

		restApi.root.addMethod(
			"POST",
			new apiGateway.LambdaIntegration(lambdaFunc)
		)
	}
}
