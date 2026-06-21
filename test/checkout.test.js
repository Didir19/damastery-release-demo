'use strict';
const assert = require('assert');
const { validateOrder } = require('../src/checkout');

// happy path
assert.strictEqual(validateOrder({ orderId: 'o-1', amount: 129 }), true);

// rejects non-positive amount
assert.throws(() => validateOrder({ orderId: 'o-2', amount: -5 }));

// rejects missing orderId
assert.throws(() => validateOrder({ amount: 10 }));

console.log('all checkout validation tests passed');
