var cc = require("./contactcenter.js")
var testnumber = require("./testnumber.js")

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        console.log("Request received: "+JSON.stringify(event))
        if(event.path.startsWith("/cc")) {
            console.log("Contact Center request")
            return cc.route(event,context)
        } else if(event.path.startsWith("/testnumber")) {
            console.log("Test number request")
            return testnumber.route(event,context)
        } else if(event.path === '/call') {
            await makecall(event)
            return ok()
        } else if(event.path === '/hellooutbound') {
            return rsp(helloVoice(event))
        } else if(event.path === '/sms') {
            return rsp(helloSMS(event))
        } else if(event.path === '/voice') {
            return rsp(helloVoice(event))
        } else if(event.path === '/smsfallback') {
            return rsp(smsFallback(event))
        } else if(event.path === '/voicefallback') {
            return rsp(voiceFallback(event))
        } else if(event.path === '/status') {
            console.log("Callback status event: "+event)
            return ok()
        } else {
            // Unknown path. Send voice response (could be wrong)
            return rsp('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Path not configured.</Say></Response>')
        }
    } catch(exception) {
        console.log("Exception raised when executing Lambda: "+exception)
        return {
            statusCode: 500,
            body: exception.toString()
        }
    }
}

async function makecall(event) {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const cb = baseurl(event)+"/hellooutbound"
    console.log("CALLBACK: "+cb)
    console.log("FROM PHONE: "+process.env.TWILIO_PHONE_NUMBER)
    console.log("TO PHONE: "+event.queryStringParameters.to)
    const call = await client.calls.create({
            url: cb,
            to: event.queryStringParameters.to,
            from: process.env.TWILIO_PHONE_NUMBER
        })
    console.log("Call initiated: "+call.sid)
}

function helloVoice(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say("Hello there. Let's play some music!")
    response.play({}, 'http://com.twilio.music.ambient.s3.amazonaws.com/gurdonark_-_Exurb.mp3')
    response.say('Goodbye')
    return(response.toString())
}

function helloSMS(event) {
    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    const response = new MessagingResponse();
    response.message().body('Hello World!');
    return(response.toString())
}

function smsFallback(event) {
    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    const response = new MessagingResponse();
    response.message().body('Ooops. Something went wrong. Sorry.');
    return(response.toString())
}

function voiceFallback(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say("Sorry. Something went wrong.")
    return(response.toString())
}

// Helper functions

function rsp(body) {
    return {
        'statusCode': 200,
        'body': body,
        'headers': {'Content-Type': 'application/xml'}
    }
}

function ok() {
    return {
        'statusCode': 200,
        'body': 'OK'
    }
}

// Getting the base URL for an API gateway request is a little tricky. event.path
// does not contain the stage part. event.requestContext.path has everything.
function baseurl(event) {
    return "https://"+event.requestContext.domainName+
        event.requestContext.path.substring(0,event.requestContext.path.length-event.path.length)
}
