resource "aws_iam_role" "now-cloudwatchlogs-to-splunk" {
  name        = "now-cloudwatchlogs-to-splunk"
  description = "Role now to send cloudwatch logs to splunk"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
          "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "now-cloudwatchlogs-to-splunk-CloudWatchLogsReadOnlyAccess" {
  role       = "${aws_iam_role.now-cloudwatchlogs-to-splunk.id}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "now-cloudwatchlogs-to-splunk-AWSLambdaBasicExecutionRole" {
  role       = "${aws_iam_role.now-cloudwatchlogs-to-splunk.id}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.now-cloudwatchlogs-to-splunk.function_name}"
  principal     = "events.amazonaws.com"
}
