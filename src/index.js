'use strict'

const rp = require('request-promise-native').defaults({
    json: true,
    resolveWithFullResponse: true,
    simple: false
})

function getOrThrow(name) {
    const value = process.env[name]
    if (!value) {
        throw new Error('Missing required environment variable: ' + name)
    }
    return value
}

function readConfig() {
    return {
        targetUrl: getOrThrow('targetUrl'),
        apiKey: getOrThrow('apiKey'),
        slackUrl: getOrThrow('slackUrl')
    }
}

const config = readConfig()

exports.handler = function (event, context) {

    const options = {
        uri: config.targetUrl,
        method: 'GET',
        headers: {
            'api-key': config.apiKey
        }
    }

    rp(options)
        .then(response => {
            console.log('code:', response.statusCode, 'body:', response.body)
            if (response.statusCode >= 200 && response.statusCode < 300) {
                // OK
                return Promise.resolve(null)
            } else {
                console.error('Failed checking:', config.targetUrl)
                return rp({
                    uri: config.slackUrl,
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: {
                        username: 'AWS Health Checker',
                        text: '*Health check failed*\n' +
                            'Target: ' + config.targetUrl + '\n' +
                            'status code: ' + (response ? response.statusCode : null) +
                            '\nbody:' + (response ? JSON.stringify(response.body) : null),
                        icon_emoji: ':aws:'
                    }
                })
            }
        }
        )
        .then(response => {
            if (response) {
                if (!(response.statusCode >= 200 && response.statusCode < 300)) {
                    console.error('Failed to notify slack', response)
                } else {
                    console.log('slack notification successful')
                }
                context.done(null, 'Failed from Lambda')
            } else {
                context.done(null, 'OK from Lambda')
            }
        })
        .catch(err => {
            console.error('status check failed', err)
        })
}
