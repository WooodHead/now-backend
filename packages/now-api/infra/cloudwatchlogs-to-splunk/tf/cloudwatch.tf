resource "aws_cloudwatch_log_subscription_filter" "now-cloudwatchlogs-to-splunk" {
  name           = "now-cloudwatchlogs-to-splunk"
  log_group_name = "/aws/elasticbeanstalk/now-api-prod/var/log/eb-docker/containers/eb-current-app/stdouterr.log"

  filter_pattern  = ""
  destination_arn = "${aws_lambda_function.now-cloudwatchlogs-to-splunk.arn}"
  depends_on      = ["aws_iam_role_policy_attachment.now-cloudwatchlogs-to-splunk-CloudWatchLogsReadOnlyAccess", "aws_iam_role_policy_attachment.now-cloudwatchlogs-to-splunk-AWSLambdaBasicExecutionRole"]
}
