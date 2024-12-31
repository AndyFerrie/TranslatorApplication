import * as lambda from "aws-cdk-lib/aws-lambda"
import * as fs from "fs"
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import * as path from "path"
import { lambdaDirectory } from "./appPaths"
import * as iam from "aws-cdk-lib/aws-iam"

export type LambdaWrapperProps = {
	lambdaRelativePath: string
	handler: string
	initialPolicy: Array<iam.PolicyStatement>
	lambdaLayers: Array<lambda.ILayerVersion>
	environment: Record<string, string>
}

const bundling: lambdaNodejs.BundlingOptions = {
	minify: true,
	externalModules: ["/opt/nodejs/utils-lambda-layer"],
}

export const createNodeJsLambda = (
	scope: Construct,
	lambdaName: string,
	{
		lambdaRelativePath,
		handler,
		initialPolicy,
		lambdaLayers,
		environment,
	}: LambdaWrapperProps
) => {
	const lambdaPath = path.join(lambdaDirectory, lambdaRelativePath)

	if (!fs.existsSync(lambdaPath)) {
		throw new Error("lambda path doesn't exist")
	}

	return new lambdaNodejs.NodejsFunction(scope, lambdaName, {
		entry: lambdaPath,
		handler,
		runtime: lambda.Runtime.NODEJS_20_X,
		initialPolicy,
		layers: lambdaLayers,
		environment,
		bundling,
	})
}
