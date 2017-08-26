import powerAssert from 'power-assert';
const assert = powerAssert.customize({ output: { maxDepth: 3 } });
import { Comitia, Comiket } from '../src/lib/scrape';
import { comitiaHtml } from './comitia-html';
import { comiketHtml } from './comiket-html';

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

  describe('Comiket#dateFinder', () => {
    it('should get schedules', () => {
      const actual = new Comiket().dateFinder(comiketHtml);
      const expect = [
        { name: 'コミックマーケット９３', date: new Date(2017, 11, 29) },
        { name: 'コミックマーケット９３', date: new Date(2017, 11, 30) },
        { name: 'コミックマーケット９３', date: new Date(2017, 11, 31) },
      ];
      assert.deepStrictEqual(actual, expect);
    });
  });
});
