import powerAssert from 'power-assert';
const assert = powerAssert.customize({ output: { maxDepth: 3 } });
import { CalendarClient } from '../src/lib/calendar-client';

describe('CalendarClient', () => {
  describe('register', () => {
    const httpClientMock = {
      async listEvents() {
        return { items: [{ summary: 'COMITIA112' }, { summary: 'ComicMarket92' }] };
      },
      async insertEvent(name, date) {
        // return events as it is
        return { items: { name, date } };
      }
    };
    const sut = new CalendarClient(httpClientMock, {});

    it('should proessed one item', async () => {
      const schedules = [{ name: 'COMITIA112', date: new Date(2017, 7, 20) }];
      const actual = await sut.register(schedules);
      assert(actual, schedules);
    });

    it('should not proccessed', async () => {
      const schedules = [{ name: 'unmatched!', date: new Date(2017, 7, 20) }];
      const actual = await sut.register(schedules);
      assert(actual, schedules);
    });

    it('should proccessed all items', async () => {
      const schedules = [
        { name: 'COMITIA112', date: new Date(2017, 7, 20) },
        { name: 'ComicMarket92', date: new Date(2017, 7, 11) }
      ];
      const actual = await sut.register(schedules);
      assert(actual, schedules);
    });
  });
});
