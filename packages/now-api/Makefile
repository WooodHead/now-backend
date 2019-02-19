# The command used to run scripts in package.json. This can either be `npm run` or `yarn`.
PACKAGE_COMMAND=yarn
PACKAGE_RUNNER=$(PACKAGE_COMMAND)

.PHONY: __install_deps __typecheck help build deploy package stage start-local test

AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity \
	--query Account \
	--output text)
AWS_DEFAULT_REGION  ?= $(shell aws configure get region)

# SAM requires a bucket to store artifacts during deployment - there is an account-shared bucket for
# this that we can use (see https://github.com/meetup/serverless-at-meetup/tree/master/aws-account-bootstrap)
SAM_BUCKET := sam-artifacts-$(AWS_ACCOUNT_ID)-$(AWS_DEFAULT_REGION)


PROJECT             ?= now
COMPONENT           ?= api
STAGE               ?= prod

TARGET_STACK_NAME   ?= $(PROJECT)-$(COMPONENT)-$(STAGE)

help:
	@echo Public targets:
	@grep -E '^[^_#][^_][a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo "Private targets: (use at own risk)"
	@grep -E '^__[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[35m%-20s\033[0m %s\n", $$1, $$2}'


__install_deps: ## Ensures dependencies are installed
	$(PACKAGE_COMMAND) install
	# @ls node_modules > /dev/null 2>&1 || $(PACKAGE_COMMAND) install

build: __install_deps ## Runs the Babel compiler, so the project can be run
	$(PACKAGE_RUNNER) build

stage: build ## Stages an application to be built for distribution
	$(PACKAGE_RUNNER) stage

start-local: build ## Starts the lambda locally
	sam local start-api --template sam-template.yaml

test: build ## Executes the unit tests.
	$(PACKAGE_RUNNER) test

package: stage ## Creates a package of the lambda and uploads it to S3
	echo $(SAM_BUCKET)
	sam package \
	--template-file sam-template.yaml \
	--s3-bucket $(SAM_BUCKET) \
	--s3-prefix $(TARGET_STACK_NAME) \
	--output-template-file dist/packaged-template.yaml

deploy: package ## Packages and deploys the lambda to AWS
	aws cloudformation deploy \
	--template-file dist/packaged-template.yaml \
	--stack-name $(TARGET_STACK_NAME) \
	--capabilities CAPABILITY_IAM \
	--parameter-overrides Stage=$(STAGE)
	@API_BASE_URL=$$(aws cloudformation describe-stacks \
	--stack-name  $(TARGET_STACK_NAME) \
	--query 'Stacks[].Outputs[?OutputKey==`GraphQLApi`].OutputValue' \
	--output text); \
	echo "** Serverless application created/updated!"; \
	echo "** Application / Stack name: $(TARGET_STACK_NAME)"; \
	echo ; \
	echo "Public API Base: $$API_BASE_URL"; \
	echo "CloudFormation console: https://console.aws.amazon.com/cloudformation/home?region=$(AWS_DEFAULT_REGION)#/stacks/$(TARGET_STACK_NAME)";
	@LAMBDA_ARN=$$(aws cloudformation describe-stacks \
	--stack-name  $(TARGET_STACK_NAME) \
	--query 'Stacks[].Outputs[?OutputKey==`GraphQLFunction`].OutputValue' \
	--output text); \
	echo "Lambda console: https://console.aws.amazon.com/lambda/home?region=${AWS_DEFAULT_REGION}#/functions/$$LAMBDA_ARN";

remove: ## Removes the cloudformation stack associated with the lambda
	aws cloudformation delete-stack --stack-name $(TARGET_STACK_NAME)
