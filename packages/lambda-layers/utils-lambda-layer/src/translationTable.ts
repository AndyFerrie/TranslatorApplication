import * as dynamodb from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import {
	TranslatePrimaryKey,
	TranslateResult,
} from "@translatorapplication/shared-types"

export class translationTable {
	tableName: string
	partitionKey: string
	sortKey: string
	dynamodbClient: dynamodb.DynamoDBClient

	constructor({
		tableName,
		partitionKey,
		sortKey,
	}: {
		tableName: string
		partitionKey: string
		sortKey: string
	}) {
		this.tableName = tableName
		this.partitionKey = partitionKey
		this.sortKey = sortKey
		this.dynamodbClient = new dynamodb.DynamoDBClient({})
	}

	async insert(data: TranslateResult) {
		const tableInsertCommand: dynamodb.PutItemCommandInput = {
			TableName: this.tableName,
			Item: marshall(data),
		}

		await this.dynamodbClient.send(
			new dynamodb.PutItemCommand(tableInsertCommand)
		)
	}

	async query({ username }: TranslatePrimaryKey) {
		const queryCommand: dynamodb.QueryCommandInput = {
			TableName: this.tableName,
			KeyConditionExpression: "#PARTITION_KEY = :username",
			ExpressionAttributeNames: {
				"#PARTITION_KEY": "username",
			},
			ExpressionAttributeValues: {
				":username": { S: username },
			},
			ScanIndexForward: true,
		}

		const { Items } = await this.dynamodbClient.send(
			new dynamodb.QueryCommand(queryCommand)
		)

		if (!Items) {
			return []
		}

		const returnData = Items.map(
			(item) => unmarshall(item) as TranslateResult
		)
		return returnData
	}

	async delete(item: TranslatePrimaryKey) {
		const deleteCommand: dynamodb.DeleteItemCommandInput = {
			TableName: this.tableName,
			Key: {
				[this.partitionKey]: { S: item.username },
				[this.sortKey]: { S: item.requestId },
			},
		}

		await this.dynamodbClient.send(
			new dynamodb.DeleteItemCommand(deleteCommand)
		)

		return item
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
			(item) => unmarshall(item) as TranslateResult
		)
		return returnData
	}
}
