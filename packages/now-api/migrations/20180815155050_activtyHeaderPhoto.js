exports.up = knex =>
  knex.schema.table('activities', t => {
    t.string('headerPhotoId');
    t.text('headerPhotoPreview');
  });

exports.down = knex =>
  knex.schema.table('activities', t => {
    t.dropColumn('headerPhotoId');
    t.dropColumn('headerPhotoPreview');
  });
