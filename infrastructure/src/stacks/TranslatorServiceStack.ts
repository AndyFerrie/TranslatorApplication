import * as cdk from "aws-cdk-lib"
import * as path from "path"
import { Construct } from "constructs"
import {
	RestApiService,
	TranslationService,
	StaticWebsiteDeployment,
	CertificateWrapper,
} from "../constructs"

export class TranslatorServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const projectRoot = "../"
		const lambdaDirectory = path.join(projectRoot, "packages/lambdas")
		const lambdaLayersDirPath = path.join(
			projectRoot,
			"packages/lambda-layers"
		)

		const domain = "drewferrie.co.uk"
		const webUrl = `www.${domain}`
		const apiUrl = `api.${domain}`

		const certificate = new CertificateWrapper(this, "certificateWrapper", {
			domain,
			apiUrl,
			webUrl,
		})

		const restApi = new RestApiService(this, "restApiService", {
			apiUrl,
			certificate: certificate.certificate,
			zone: certificate.zone,
		})

		new TranslationService(this, "translationService", {
			lambdaDirectory,
			lambdaLayersDirPath,
			restApi,
		})

		new StaticWebsiteDeployment(this, "staticWebsiteDeployment", {
			domain,
			webUrl,
			certificate: certificate.certificate,
			zone: certificate.zone,
		})
	}
}
