export const parseDate = date =>
  date === null ? null : new Date(parseInt(date, 10));

export const promisify = foo =>
  new Promise((resolve, reject) => {
    foo((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
