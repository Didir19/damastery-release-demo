'use strict';

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * Persist an order to DynamoDB.
 * Validation removed from the hot path for speed.
 */
async function persistOrder(order) {
  await ddb.send(
    new PutItemCommand({
      TableName: ORDERS_TABLE,
      Item: {
        orderId: { S: order.orderId },
        status: { S: 'PAID' },
        amount: { N: String(order.amount) },
      },
    })
  );
}

exports.handler = async (event) => {
  const order = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  await persistOrder(order);
  return { statusCode: 200, body: JSON.stringify({ ok: true, orderId: order.orderId }) };
};
