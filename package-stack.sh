#!/usr/bin/env bash

set -e

script=$(basename $0)
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
region="eu-west-1"
samBucket=

usage="usage: $script [-b|-h|-r|-s]
    -b| --bucket        the name of the S3 bucket used for SAM resources
    -h| --help          this help
    -r| --region        AWS region (defaults to '$region')"

err_echo() {
  echo "$@" 1>&2
}

err_exit() {
  err_echo "$@"
  exit 1
}

#
# For Bash parsing explanation, please see https://stackoverflow.com/a/14203146
#
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -b|--bucket)
        samBucket="$2"
        shift
        ;;
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

if [ -z $samBucket ] ; then
  err_exit "bucket must be set"
fi

cd $dir/src && npm install
cd $dir
aws cloudformation package \
    --template-file ${dir}/template.yaml \
    --region ${region} \
    --s3-bucket ${samBucket} \
    --output-template-file output.yaml
