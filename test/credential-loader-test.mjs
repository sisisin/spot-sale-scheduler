import rimraf from 'rimraf';
import fs from 'fs';
import powerAssert from 'power-assert';
const assert = powerAssert.customize({ output: { maxDepth: 3 } });
import sinon from 'sinon';
import { CredentialLoader } from '../src/lib/credential-loader';

describe('CredentialLoader', () => {
  beforeEach(() => { deleteEnvironmentVariable(); });
  afterEach(() => { deleteEnvironmentVariable(); });

  it('should load credential from file', async () => {
    const sut = new CredentialLoader('./test/test-credential.json');
    const actual = await sut.load();
    const expect = await import('./test-credential.json');
    assert.deepStrictEqual(actual, expect.default);
  });

  it('should call #loadFromEnv when credential file is not exist', async () => {
    const notFoundPath = '';
    const sut = new CredentialLoader(notFoundPath);
    sut.loadFromEnv = sinon.spy();
    const actual = await sut.load();
    assert(sut.loadFromEnv.calledOnce);
  });

  it('should load credential from environment variable', async () => {
    const ACCESS_TOKEN = 'at from env';
    const REFRESH_TOKEN = 'ft from env';
    const TOKEN_TYPE = 'tt from env';
    const EXPIRY_DATE = 'ed from env';

    process.env.ACCESS_TOKEN = ACCESS_TOKEN;
    process.env.REFRESH_TOKEN = REFRESH_TOKEN;
    process.env.TOKEN_TYPE = TOKEN_TYPE;
    process.env.EXPIRY_DATE = EXPIRY_DATE;

    const sut = new CredentialLoader('');
    const actual = sut.loadFromEnv();
    assert.deepStrictEqual(actual, {
      access_token: ACCESS_TOKEN,
      refresh_token: REFRESH_TOKEN,
      token_type: TOKEN_TYPE,
      expiry_date: EXPIRY_DATE
    });
  });

  it('should throw when env vars lacked', async () => {
    const sut = new CredentialLoader('');

    try {
      const actual = sut.loadFromEnv();
    } catch (err) {
      assert(err.message === 'You need spot-sale-scheduler.json or environment variables');
      return;
    }
    assert.fail();
  });
});

function deleteEnvironmentVariable() {
  delete process.env.ACCESS_TOKEN;
  delete process.env.REFRESH_TOKEN;
  delete process.env.TOKEN_TYPE;
  delete process.env.EXPIRY_DATE;
}
