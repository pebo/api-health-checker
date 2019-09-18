// @ts-check
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

async function sendSlackNotification(statusCode, message) {
    try {
        const response = await rp({
            uri: config.slackUrl,
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: {
                username: 'AWS Health Checker',
                text: '*Health check failed*\n' +
                    'Target: ' + config.targetUrl + '\n' +
                    'status code: ' + statusCode +
                    '\nbody:' + message,
                icon_emoji: ':aws:'
            }
        })
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
            console.error('Failed to notify slack', response)
        } else {
            console.log('slack notification successful')
        }
    } catch (err) {
        console.error('Slack communication error', err)
    }
}


exports.handler = async function (event, context) {

    const options = {
        uri: config.targetUrl,
        method: 'GET',
        headers: {
            'api-key': config.apiKey
        }
    }

    try {
        const response = await rp(options)
        console.log('code:', response.statusCode, 'body:', response.body)
        if (response.statusCode >= 200 && response.statusCode < 300) {
            return 'OK from Lambda'
        } else {
            // HTTP / API error
            console.error('Failed checking:', config.targetUrl)

            const statusCode = response ? response.statusCode : null
            const message = response ? JSON.stringify(response.body) : null
            await sendSlackNotification(statusCode, message)
            return 'Failed from Lambda'
        }

    } catch (err) {
        console.error('Network error checking:' + config.targetUrl, err)
        await sendSlackNotification(-1, 'Network error checking:' + config.targetUrl +":" + err)
        return err
    }

}
