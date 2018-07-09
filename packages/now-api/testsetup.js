import 'js-joda-timezone';

import sql from './src/db/sql';

afterAll(() => sql.destroy());
