import * as lambda from "aws-lambda"

const createGatewayResonse = ({
	statusCode,
	body,
}: {
	statusCode: number
	body: string
}): lambda.APIGatewayProxyResult => {
	return {
		statusCode,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
		body,
	}
}

export const createSuccessJsonResponse = (body: object) =>
	createGatewayResonse({
		statusCode: 200,
		body: JSON.stringify(body),
	})

export const createErrorJsonResponse = (body: object) =>
	createGatewayResonse({
		statusCode: 500,
		body: JSON.stringify(body),
	})
