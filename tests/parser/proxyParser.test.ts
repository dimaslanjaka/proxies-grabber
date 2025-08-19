import { describe, it, expect } from '@jest/globals';
import { extractProxies } from '../../src/parser/proxyParser.js';

describe('extractProxies', () => {
  it('extracts IP:PORT', () => {
    const input = '1.2.3.4:8080\n5.6.7.8:3128';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080' }, { proxy: '5.6.7.8:3128' }]);
  });

  // it('extracts IP:PORT:USER:PASS', () => {
  //   const input = '1.2.3.4:8080:user:pass';
  //   const result = extractProxies(input);
  //   expect(result).toEqual([{ proxy: '1.2.3.4:8080', username: 'user', password: 'pass' }]);
  // });

  it('extracts user:pass@ip:port', () => {
    const input = 'user:pass@1.2.3.4:8080';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080', username: 'user', password: 'pass' }]);
  });

  it('extracts ip:port@user:pass', () => {
    const input = '1.2.3.4:8080@user:pass';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080', username: 'user', password: 'pass' }]);
  });

  it('extracts IP PORT (whitespace)', () => {
    const input = '1.2.3.4 8080';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080' }]);
  });

  it('extracts from JSON format', () => {
    const input = '{"ip":"1.2.3.4","port":"8080"}';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080' }]);
  });

  it('returns unique proxies, preferring credentials', () => {
    const input = '1.2.3.4:8080\nuser:pass@1.2.3.4:8080';
    const result = extractProxies(input);
    expect(result).toEqual([{ proxy: '1.2.3.4:8080', username: 'user', password: 'pass' }]);
  });

  it('returns empty array for empty or whitespace input', () => {
    expect(extractProxies('')).toEqual([]);
    expect(extractProxies('   ')).toEqual([]);
    expect(extractProxies()).toEqual([]);
  });
});
