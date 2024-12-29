import * as dynamodb from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { TranslateDBObject } from "@translatorapplication/shared-types"

export class translationTable {
	tableName: string
	partitionKey: string
	dynamodbClient: dynamodb.DynamoDBClient

	constructor({
		tableName,
		partitionKey,
	}: {
		tableName: string
		partitionKey: string
	}) {
		this.tableName = tableName
		this.partitionKey = partitionKey
		this.dynamodbClient = new dynamodb.DynamoDBClient({})
	}

	async insert(data: TranslateDBObject) {
		const tableInsertCommand: dynamodb.PutItemCommandInput = {
			TableName: this.tableName,
			Item: marshall(data),
		}

		await this.dynamodbClient.send(
			new dynamodb.PutItemCommand(tableInsertCommand)
		)
	}

	async getAll() {
		const scanCommand: dynamodb.ScanCommandInput = {
			TableName: this.tableName,
		}

		const { Items } = await this.dynamodbClient.send(
			new dynamodb.ScanCommand(scanCommand)
		)

		if (!Items) {
			return []
		}

		const returnData = Items.map(
			(item) => unmarshall(item) as TranslateDBObject
		)
		return returnData
	}
}
