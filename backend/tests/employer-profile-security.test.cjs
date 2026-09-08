const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createEmployerProfileSchema, updateEmployerProfileSchema } = require('../src/schemas/employer.schema');
const EmployerProfile = require('../src/models/EmployerProfile').default;
const { updateProfile } = require('../src/controllers/employerController');

test('profile endpoints reject ownership and other unexpected fields', () => {
  const valid = { name: 'Avincom', description: 'Engineering and assembly', industry: 'IT', taskType: 'project' };
  for (const schema of [createEmployerProfileSchema, updateEmployerProfileSchema]) {
    assert.equal(schema.safeParse({ body: valid }).success, true);
    for (const field of ['userId', 'ownerId', '_id']) {
      assert.equal(schema.safeParse({ body: { ...valid, [field]: '507f1f77bcf86cd799439011' } }).success, false);
    }
  }
  assert.equal(updateEmployerProfileSchema.safeParse({ body: {} }).success, false);
  assert.equal(updateEmployerProfileSchema.safeParse({ body: { budgetRange: null } }).success, true);
});

test('controller updates only the authenticated owner and allowlisted fields even without middleware', async (t) => {
  const owner = '507f1f77bcf86cd799439011';
  const other = '507f1f77bcf86cd799439012';
  const update = t.mock.method(EmployerProfile, 'findOneAndUpdate', async (filter, change) => {
    assert.deepEqual(filter, { userId: owner });
    assert.deepEqual(change, { $set: { name: 'Updated name', budgetRange: null } });
    return null;
  });
  let status;
  const res = { status(value) { status = value; return this; }, json() { return this; } };
  await updateProfile({ user: { userId: owner }, body: { name: 'Updated name', budgetRange: null, userId: other, ownerId: other, _id: other } }, res);
  assert.equal(update.mock.callCount(), 1);
  assert.equal(status, 404);
});

test('unauthenticated profile updates do not reach the database', async (t) => {
  const update = t.mock.method(EmployerProfile, 'findOneAndUpdate', async () => { throw new Error('Unexpected database call'); });
  let status;
  const res = { status(value) { status = value; return this; }, json() { return this; } };
  await updateProfile({ body: { name: 'Updated name' } }, res);
  assert.equal(status, 401);
  assert.equal(update.mock.callCount(), 0);
});
