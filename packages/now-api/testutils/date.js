import { changeNow, now } from '../src/db/sql';

const RealDate = global.Date;
const RealDbNow = now();

export const mockNow = isoDate => {
  global.Date = class extends RealDate {
    constructor() {
      return new RealDate(isoDate);
    }
  };
  changeNow(isoDate);
};

export const restoreNow = () => {
  global.Date = RealDate;
  changeNow(RealDbNow);
};
