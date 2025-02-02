import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import {
	RestApiService,
	TranslationService,
	StaticWebsiteDeployment,
	CertificateWrapper,
	UserAuthSupportService,
} from "../constructs"
import { getConfig } from "../helpers"

const config = getConfig()

export class TranslatorServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const domain = config.domain
		const webUrl = `${config.webSubdomain}.${domain}`
		const apiUrl = `${config.apiSubdomain}.${domain}`

		const certificate = new CertificateWrapper(this, "certificateWrapper", {
			domain,
			apiUrl,
			webUrl,
		})

		const userAuth = new UserAuthSupportService(this, "userAuthSupport")

		const restApi = new RestApiService(this, "restApiService", {
			apiUrl,
			certificate: certificate.certificate,
			zone: certificate.zone,
			userPool: userAuth.userPool,
		})

		new TranslationService(this, "translationService", {
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
