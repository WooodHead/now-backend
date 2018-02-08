import db from './db';

export const allEvents = () => db.events();
export const event = (root, { id }) => db.event(id);
