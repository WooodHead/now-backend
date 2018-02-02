const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
`;

const resolvers = {};

exports.default = makeExecutableSchema({
  typeDefs,
  resolvers,
});
