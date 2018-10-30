#!/usr/bin/env bash
set -e

script=$(basename $0)
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
region="eu-west-1"
stackName=

usage="usage: $script [-h|-r|-s]
    -h| --help          this help
    -r| --region        AWS region (defaults to '$region')
    -s| --stack-name    stack name

    Specify the following env variables:
    - apiKey
    - targetUrl
    - slackUrl"

#
# For Bash parsing explanation, please see https://stackoverflow.com/a/14203146
#
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -h|--help)
        echo "$usage"
        exit 0
        ;;
        -r|--region)
        region="$2"
        shift
        ;;
        -s|--stack-name)
        stackName="$2"
        shift
        ;;
        *)
        # Unknown option
        ;;
    esac
    shift # past argument or value
done

ENV_FILE=$dir/$stackName.env
test -f $ENV_FILE && source $ENV_FILE

if [ -z $apiKey ] || [ -z $targetUrl ] || [ -z $slackUrl ]; then
  echo "$usage"
  exit 1
fi

parameters="ApiKey=$apiKey TargetUrl=$targetUrl SlackUrl=$slackUrl"

aws cloudformation deploy \
    --template-file ${dir}/output.yaml \
    --region ${region} \
    --stack-name ${stackName} \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides $parameters
