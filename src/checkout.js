'use strict';

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient({});
const ORDERS_TABLE = process.env.ORDERS_TABLE;

/**
 * Validate an incoming checkout request.
 * Rejects missing fields and non-positive amounts.
 */
function validateOrder(order) {
  if (!order || typeof order !== 'object') {
    throw new Error('order payload is required');
  }
  if (!order.orderId || typeof order.orderId !== 'string') {
    throw new Error('orderId is required and must be a string');
  }
  if (typeof order.amount !== 'number' || order.amount <= 0) {
    throw new Error('amount must be a positive number');
  }
  if (order.amount > 100000) {
    throw new Error('amount exceeds per-order ceiling');
  }
  return true;
}

/**
 * Persist a validated order to DynamoDB.
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
      ConditionExpression: 'attribute_not_exists(orderId)',
    })
  );
}

exports.handler = async (event) => {
  try {
    const order = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    validateOrder(order);
    await persistOrder(order);
    return { statusCode: 200, body: JSON.stringify({ ok: true, orderId: order.orderId }) };
  } catch (err) {
    console.error('checkout failed:', err.message);
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};

module.exports.validateOrder = validateOrder;
