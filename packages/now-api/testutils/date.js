const RealDate = global.Date;

export const mockNow = isoDate => {
  global.Date = class extends RealDate {
    constructor() {
      return new RealDate(isoDate);
    }
  };
};

export const restoreNow = () => {
  global.Date = RealDate;
};
