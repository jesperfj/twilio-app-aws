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
    console.log(JSON.stringify(context))
    console.log(JSON.stringify(event))
    if(event.path === '/call') {
        await makecall(event)
        return ok()
    } else if(event.path === '/ambient') {
        return rsp(ambient())
    } else if(event.path === '/electronica') {
        return rsp(electronica())
    } else if(event.path === '/conference') {
        return rsp(conference(event))
    } else {
        return rsp('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello Monkey</Say><Play>http://demo.twilio.com/hellomonkey/monkey.mp3</Play></Response>')
    }
};

async function makecall(event) {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const cb = "https://"+event.requestContext.domainName+'/'+event.queryStringParameters.then
    console.log("CALLBACK: "+cb)
    console.log("FROM PHONE: "+process.env.TWILIO_PHONE_NUMBER)
    console.log("TO PHONE: "+event.queryStringParameters.to)
    const call = await client.calls
        .create({
            url: cb,
            to: event.queryStringParameters.to,
            from: process.env.TWILIO_PHONE_NUMBER
        })
    console.log("Call initiated: "+call.sid)
}

function ambient(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Hi There')
    response.play({}, 'http://com.twilio.music.ambient.s3.amazonaws.com/gurdonark_-_Exurb.mp3')
    response.play({}, 'http://com.twilio.music.ambient.s3.amazonaws.com/aerosolspray_-_Living_Taciturn.mp3')
    response.play({}, 'http://com.twilio.music.ambient.s3.amazonaws.com/gurdonark_-_Plains.mp3')
    response.say('Goodbye')
    return(response.toString())
}

function electronica(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Hi There')
    response.play({}, 'http://com.twilio.music.electronica.s3.amazonaws.com/Kaer_Trouz_-_Seawall_Stepper.mp3')
    response.play({}, 'http://com.twilio.music.electronica.s3.amazonaws.com/spenceyb_-_O-T-S-H-T_%28Razma_World_IV_Remix%29.mp3')
    response.play({}, 'http://com.twilio.music.electronica.s3.amazonaws.com/teru_-_110_Downtempo_Electronic_4.mp3')
    response.say('Goodbye')
    return(response.toString())
}

function conference(event) {
    console.log("Sending someone into conference")
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.dial().conference("MyConference", {
        startConferenceOnEnter: true
    })
    return(response.toString())
}
