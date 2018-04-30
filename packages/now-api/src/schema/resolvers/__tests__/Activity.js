import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';
import { getToday } from '../Activity';

describe('getToday', () => {
  jsJodaUse(jsJodaTimezone);

  const RealDate = global.Date;

  const mockDate = isoDate => {
    global.Date = class extends RealDate {
      constructor() {
        return new RealDate(isoDate);
      }
    };
  };

  afterEach(() => {
    global.Date = RealDate;
  });

  it("gives today's date at 8:30pm", () => {
    mockDate('2018-04-30T20:30:00-04:00');
    expect(getToday()).toEqual('2018-04-30');
  });

  it("gives tomorrow's date at 9:00pm", () => {
    mockDate('2018-04-30T21:00:00-04:00');
    expect(getToday()).toEqual('2018-05-01');
  });
});
