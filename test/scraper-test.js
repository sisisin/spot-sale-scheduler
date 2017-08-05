const assert = require('power-assert').customize({ output: { maxDepth: 3 } });
const { Comitia } = require('../src/scraper');
const comitiaHtml = require('./comitia-html');

describe('scraper', () => {
  describe('Comitia#dateFinder', () => {
    it('should get first date', () => {
      const actual = new Comitia().dateFinder(comitiaHtml);
      const expect = [
        { name: 'COMITIA121', date: new Date(2017, 7, 20) },
        { name: 'COMITIA122', date: new Date(2017, 10, 23) },
        { name: 'COMITIA123', date: new Date(2018, 1, 11) },
      ];
      assert.deepStrictEqual(actual, expect);
    });
  });
});
