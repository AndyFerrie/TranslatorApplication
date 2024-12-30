import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as iam from "aws-cdk-lib/aws-iam"
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb"
import * as path from "path"
import { RestApiService } from "./RestApiService"

export interface TranslationServiceProps extends cdk.StackProps {
	lambdaDirectory: string
	lambdaLayersDirPath: string
	restApi: RestApiService
}

export class TranslationService extends Construct {
	public restApi: apiGateway.RestApi
	constructor(
		scope: Construct,
		id: string,
		{
			lambdaDirectory,
			lambdaLayersDirPath,
			restApi,
		}: TranslationServiceProps
	) {
		super(scope, id)

		const translateLambdaPath = path.resolve(
			path.join(lambdaDirectory, "translate/index.ts")
		)

		const utilsLambdaLayerPath = path.resolve(
			path.join(lambdaLayersDirPath, "utils-lambda-layer")
		)

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

		const utilsLambdaLayer = new lambda.LayerVersion(
			this,
			"utilsLambdaLayer",
			{
				code: lambda.Code.fromAsset(utilsLambdaLayerPath),
				compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			}
		)

		const translateLambda = new lambdaNodejs.NodejsFunction(
			this,
			"translateLambda",
			{
				entry: translateLambdaPath,
				handler: "translate",
				runtime: lambda.Runtime.NODEJS_20_X,
				initialPolicy: [translateServicePolicy, translateTablePolicy],
				layers: [utilsLambdaLayer],
				environment: {
					TRANSLATION_TABLE_NAME: table.tableName,
					TRANSLATION_PARTITION_KEY: "requestId",
				},
			}
		)

		restApi.addTranslateMethod({
			httpMethod: "POST",
			lambda: translateLambda,
		})

		const getTranslationsLambda = new lambdaNodejs.NodejsFunction(
			this,
			"getTranslationsLambda",
			{
				entry: translateLambdaPath,
				handler: "getTranslations",
				runtime: lambda.Runtime.NODEJS_20_X,
				initialPolicy: [translateTablePolicy],
				layers: [utilsLambdaLayer],
				environment: {
					TRANSLATION_TABLE_NAME: table.tableName,
					TRANSLATION_PARTITION_KEY: "requestId",
				},
			}
		)

		restApi.addTranslateMethod({
			httpMethod: "GET",
			lambda: getTranslationsLambda,
		})
	}
}
