import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as iam from "aws-cdk-lib/aws-iam"
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb"
import * as path from "path"
import { RestApiService } from "./RestApiService"
import { createNodeJsLambda, lambdaLayersDirPath } from "../helpers"

export interface TranslationServiceProps extends cdk.StackProps {
	restApi: RestApiService
}

export class TranslationService extends Construct {
	public restApi: apiGateway.RestApi
	constructor(
		scope: Construct,
		id: string,
		{ restApi }: TranslationServiceProps
	) {
		super(scope, id)

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

		const translateLambda = createNodeJsLambda(this, "translateLambda", {
			lambdaRelativePath: "translate/index.ts",
			handler: "translate",
			initialPolicy: [translateServicePolicy, translateTablePolicy],
			lambdaLayers: [utilsLambdaLayer],
			environment: {
				TRANSLATION_TABLE_NAME: table.tableName,
				TRANSLATION_PARTITION_KEY: "requestId",
			},
		})

		restApi.addTranslateMethod({
			httpMethod: "POST",
			lambda: translateLambda,
			isAuth: true,
		})

		const getTranslationsLambda = createNodeJsLambda(
			this,
			"getTranslationsLambda",
			{
				lambdaRelativePath: "translate/index.ts",
				handler: "getTranslations",
				initialPolicy: [translateTablePolicy],
				lambdaLayers: [utilsLambdaLayer],
				environment: {
					TRANSLATION_TABLE_NAME: table.tableName,
					TRANSLATION_PARTITION_KEY: "requestId",
				},
			}
		)

		restApi.addTranslateMethod({
			httpMethod: "GET",
			lambda: getTranslationsLambda,
			isAuth: true,
		})
	}
}
