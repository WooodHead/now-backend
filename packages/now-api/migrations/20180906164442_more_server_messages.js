const uuid = require('uuid/v4');

exports.up = async knex => {
  await knex.raw('ALTER TABLE "serverMessages" ADD COLUMN "json" jsonb');
  return knex('serverMessages').insert([
    {
      id: uuid(),
      key: 'featureVideo',
      text:
        'https://s3.amazonaws.com/now-vid.meetup.com/office-test-1/hls/office-test-1.m3u8',
    },
    {
      id: uuid(),
      key: 'featureThumbnail',
      json: {
        id: 'vid/0f1b7d94d2b738b41d23ebf2ab379411.jpg',
        baseUrl: 'https://now.meetup.com/images',
        preview:
          'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoAEcDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAQDBQYHAv/EAC4QAAIBAwMCBAUEAwAAAAAAAAECAwAEEQUSIRMxBhRBUSIjYYGRFTJxsWKhwf/EABgBAQEBAQEAAAAAAAAAAAAAAAMCAQAE/8QAHREAAgIDAQEBAAAAAAAAAAAAAAECEQMSITFBgf/aAAwDAQACEQMRAD8A6Pq84FmrskkYWZDkr/kKyKdKS7vAjAh7uUpj15zS97rVqvhsQzau/nHcfJbdwAcg57dhSulpFcdZhM3TWX5cS4C/Fj4jxz7UrlX4efHCi92KiLkFRnutPrtAXhjkdwaUiJlhRiSp+lOIc4IYfc4zTRVqyrrhIY1ZskdxTkQCso5+1LjcCMLn3pSTXbe21630mSKVppkDF0xtTJwM+vp6VkopemxbNEcKw/ipJJgIWAPIHrVfqV/Bp0IuJyRHuVcjnknApZ9ctJIztZskcfDRapCqQvqVxiPkgc0UldyeZQCJ17+tFRqytkcntxe3URMcDyFSdrlcj6/1V7p2rXGlaTczXrRph/lQy5TqMBkAfiptHvLK1iksri+iR15VO3OKzXi67W51GK1gPU2KD8PufQV1r0lWbbw34rfXElE0CwtEBllfhifoe35rS9RCiEyRqPd2rjyeb0+A2CqDJN8MijB44PB96h/Wbi1ji8rIRGJGZVc7sHPH+qWOZ10iWPvDuCX1s0Elws8bpChd9rdgBz/VcxvfFeo/qI1pWikYfLiYIMReu1h6kZ7nvUfh7xBe6vcXOn35ZrW4tmRzbxAMuSMHNIS2F5PqojtVVWMaRmJTnfhcZPGOcV2SWyVCYajJ2jT3/ja513SYbSa0RGYrI0sbHBIyMbT2/PpUMGsRwyRwzXccWSAS7D4R71j9Sv7i3byXTWEwjYxTv3J/7VVvJbJOT9aPZ/TZKOz18OsQ3MFuqw2dzFNAoyrRHI55ornNhqclmR0ZDGx5LHsftRSKSDo2L32kWGkNeTWGZFXG3jDHsACfesM10LrU+tBbFQ8m4R7tx/NFFC5WXVMmitr25u5TIREYyzSySNgID3P1+1KusPSkCMWw2EOMZ+38UUViNaLfSLqPTZofLzGTe3zduVLA+n9/mnINaGm397cWKGPe2V6r7yg7bc/zmiirT4SVeo3Ml8wurl+rcSMxmY9ic8YHpxVZPEUbI/ae1FFQ30SlqeMMACQQD2NFFFaiHw//2Q==',
        blocked: false,
      },
    },
  ]);
};

exports.down = async knex => {
  await knex('serverMessages')
    .whereIn('key', ['featureVideo', 'featureThumbnail'])
    .del();
  return knex.raw('ALTER TABLE "serverMessages" DROP COLUMN "json"');
};
