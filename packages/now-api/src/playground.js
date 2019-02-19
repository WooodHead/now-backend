const lambdaPlayground = require('graphql-playground-middleware-lambda')
  .default;

exports.playgroundHandler = lambdaPlayground({
  endpoint: '/Prod/graphql',
});
