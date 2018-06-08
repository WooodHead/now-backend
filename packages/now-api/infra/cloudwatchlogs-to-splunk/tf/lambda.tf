resource "aws_lambda_function" "now-cloudwatchlogs-to-splunk" {
  function_name    = "now-cloudwatchlogs-to-splunk"
  handler          = "index.handler"
  runtime          = "nodejs4.3"
  filename         = "src/function.zip"
  role             = "${aws_iam_role.now-cloudwatchlogs-to-splunk.arn}"
  source_code_hash = "${base64sha256(file("src/function.zip"))}"
  timeout          = 120
}
