import { getAuthInputsFromLambdaRequest } from '../classicApiAuth';

describe('getAuthInputsFromLambdaRequest', () => {
  const lambdaIn = {
    cookie: 'one=1; two=2',
    Host: 'tsoh',
    'X-Forwarded-Proto': 'https',
    'User-Agent': 'ua',
  };
  const { cookies, host, protocol, userAgent } = getAuthInputsFromLambdaRequest(
    lambdaIn
  );

  it("parses the 'one' cookie", () => {
    expect(cookies.one).toBe('1');
  });

  it("parses the 'two' cookie", () => {
    expect(cookies.two).toBe('2');
  });

  it('parses the host', () => {
    expect(host).toBe('tsoh');
  });

  it('parses the protocol', () => {
    expect(protocol).toBe('https');
  });

  it('parses the userAgent', () => {
    expect(userAgent).toBe('ua');
  });
});
