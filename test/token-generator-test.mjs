import rimraf from 'rimraf';
import fs from 'fs';
import powerAssert from 'power-assert';
const assert = powerAssert.customize({ output: { maxDepth: 3 } });
import sinon from 'sinon';
import { TokenGenerator } from '../src/lib/token-generator';

describe('TokenGenerator', () => {
  let consoleLogMock = () => { };
  let _consoleLog;
  beforeEach(() => {
    _consoleLog = console.log;
    console.log = consoleLogMock;
  });
  afterEach(() => {
    console.log = _consoleLog;
  });

  describe('#getCode', () => {
    let readlineMockBase;
    let oauth2ClientMockBase;
    beforeEach(() => {
      readlineMockBase = {
        createInterface() {
          return { question(text, fn) { fn(); }, close() { } };
        }
      };
      oauth2ClientMockBase = { generateAuthUrl() { } };
    });

    it('should call generateAuthUrl with', async () => {
      const sut = new TokenGenerator('', '', {}, readlineMockBase);
      oauth2ClientMockBase.generateAuthUrl = sinon.spy();
      await sut.getCode(oauth2ClientMockBase);
      assert(oauth2ClientMockBase.generateAuthUrl.calledOnce);
    });

    it(`should return question's callback function second arg.`, async () => {
      readlineMockBase.createInterface = () => {
        return {
          question(text, fn) { fn('test code'); },
          close() { }
        };
      };
      const sut = new TokenGenerator('', '', {}, readlineMockBase);
      const actual = await sut.getCode(oauth2ClientMockBase);
      assert(actual === 'test code');
    });

    it('should called close once', async () => {
      const closeSpy = sinon.spy();
      readlineMockBase.createInterface = () => {
        return {
          question(text, fn) { fn(); },
          close: closeSpy
        };
      }
      const sut = new TokenGenerator('', '', {}, readlineMockBase);
      await sut.getCode(oauth2ClientMockBase);
      assert(closeSpy.calledOnce);
    });
  });

  describe('#getAndStoreToken', () => {
    const token = { token: 'this is token' };
    const tokenPath = '.temp/token.json';
    const tokenDir = '.temp';

    beforeEach((done) => {
      rimraf(tokenDir, () => done());
    });

    it('should store specified path', async () => {
      const sut = new TokenGenerator(tokenPath, tokenDir, {}, {});
      const oauth2ClientMock = { getToken(code, fn) { fn(null, token); } };

      await sut.getAndStoreToken(oauth2ClientMock, 'code');
      const actual = JSON.parse(fs.readFileSync(tokenPath).toString());
      assert.deepStrictEqual(actual, token);
    });

    it('should reject when getToken cause error', async () => {
      const sut = new TokenGenerator(tokenPath, tokenDir, {}, {});
      const expectError = 'error';
      const oauth2ClientMock = { getToken(code, fn) { fn(expectError, {}); } };

      try {
        await sut.getAndStoreToken(oauth2ClientMock, 'code');
      } catch (err) {
        assert(err === expectError);
        return;
      }
      assert.fail();
    });
  });
});
