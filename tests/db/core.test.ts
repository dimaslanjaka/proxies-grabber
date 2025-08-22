import DBConstructor from '../../src/db/core';
import fs from 'fs-extra';
import path from 'upath';

describe('DBConstructor', () => {
  const testFolder = path.join(__dirname, 'test-db');
  let db: DBConstructor;

  beforeAll(() => {
    fs.removeSync(testFolder);
    db = new DBConstructor(testFolder);
  });

  afterAll(() => {
    fs.removeSync(testFolder);
  });

  test('push and get string', () => {
    db.push('key1', 'value1');
    expect(db.get('key1')).toBe('value1');
  });

  test('push and get number', () => {
    db.push('key2', 123);
    expect(db.get('key2')).toBe(123);
  });

  test('push and get float', () => {
    db.push('key3', 123.45);
    expect(db.get('key3')).toBeCloseTo(123.45);
  });

  test('push and get array', () => {
    const arr = [1, 2, 3];
    db.push('key4', arr);
    expect(db.get('key4')).toEqual(arr);
  });

  test('push and get object', () => {
    const obj = { a: 1, b: 'test' };
    db.push('key5', obj);
    expect(db.get('key5')).toEqual(obj);
  });

  test('exists returns true for existing key', () => {
    db.push('key6', 'exists');
    expect(db.exists('key6')).toBe(true);
  });

  test('exists returns false for non-existing key', () => {
    expect(db.exists('nope')).toBe(false);
  });

  test('get returns fallback for non-existing key', () => {
    expect(db.get('nope', 'fallback')).toBe('fallback');
  });

  test('edit updates array element by object match', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' }
    ];
    db.push('key7', arr);
    const newObj = { id: 2, name: 'bb' };
    const result = db.edit('key7', newObj, { id: 2 } as any);
    expect(result).toBe(true);
    expect(db.get('key7')).toContainEqual(newObj);
  });

  test('edit returns false if object not found in array', () => {
    db.push('key8', [{ id: 1 }]);
    const result = db.edit('key8', { id: 2 }, { id: 2 });
    expect(result).toBe(false);
  });

  test('edit replaces value if no by param', () => {
    db.push('key9', 'old');
    const result = db.edit('key9', 'new');
    expect(result).toBe(true);
    expect(db.get('key9')).toBe('new');
  });
});
