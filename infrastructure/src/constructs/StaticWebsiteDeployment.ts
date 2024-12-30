import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53Targets from "aws-cdk-lib/aws-route53-targets"
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import { frontendDistPath } from "../helpers"

export interface StaticWebsiteDeploymentProps extends cdk.StackProps {
	domain: string
	webUrl: string
	certificate: acm.Certificate
	zone: route53.IHostedZone
}

export class StaticWebsiteDeployment extends Construct {
	public restApi: apiGateway.RestApi
	constructor(
		scope: Construct,
		id: string,
		{ domain, webUrl, certificate, zone }: StaticWebsiteDeploymentProps
	) {
		super(scope, id)

		const viewerCertificate =
			cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
				aliases: [domain, webUrl],
			})

		const bucket = new s3.Bucket(this, "WebsiteBucket", {
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "404.html",
			publicReadAccess: true,
			blockPublicAccess: {
				blockPublicAcls: false,
				blockPublicPolicy: false,
				ignorePublicAcls: false,
				restrictPublicBuckets: false,
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		})

		const distro = new cloudfront.CloudFrontWebDistribution(
			this,
			"WebsiteCloudfrontDist",
			{
				viewerCertificate,
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: bucket,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
							},
						],
					},
				],
			}
		)

		new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
			destinationBucket: bucket,
			sources: [s3deploy.Source.asset(frontendDistPath)],
			distribution: distro,
			distributionPaths: ["/*"],
		})

		new route53.ARecord(this, "route53Domain", {
			zone,
			recordName: domain,
			target: route53.RecordTarget.fromAlias(
				new route53Targets.CloudFrontTarget(distro)
			),
		})

		new route53.ARecord(this, "route53FullUrl", {
			zone,
			recordName: "www",
			target: route53.RecordTarget.fromAlias(
				new route53Targets.CloudFrontTarget(distro)
			),
		})
	}
}
