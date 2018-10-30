# api-health-checker

An AWS lambda function that pings an api endpoint regulary and reports erros found to a slack channel.

Note for production setup the consider encrypting the apiKey and slack web hook.

# Configuration

- Create a S3 bucket for storing the ZIP deployment package, e.g. `aws s3 mb s3://bucket-name --region eu-west-1`. 

- Create a web hook for the slack channel.


Create an env file per stack, e.g. `prod-myapi-health-checker.env`

```
apiKey=mykey
targetUrl=https://example.com/path
slackUrl=https://hooks.slack.com/services/..
```

Command to package and deploy the function.

```
./package-stack.sh -b mySamBucket

./deploy-stack.sh -s prod-myapi-health-checker
```

`sam local invoke --debug "apiHealthChecker" -e event.json`



## Debug in VS Code

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Attach to SAM Local",
            "type": "node",
            "request": "attach",
            "address": "localhost",
            "port": 5858,
            "localRoot": "${workspaceRoot}/src",
            "remoteRoot": "/var/task",
            "protocol": "inspector"
        }
    ]
}
```

`sam local invoke --debug -d 5858 "apiHealthChecker" -e event.json`

