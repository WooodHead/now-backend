import { use as jsJodaUse } from 'js-joda';
import jsJodaTimezone from 'js-joda-timezone';

import sql from './src/db/sql';

jsJodaUse(jsJodaTimezone);

afterAll(() => sql.destroy());
