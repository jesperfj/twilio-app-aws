var h = require("./helpers.js")

module.exports.route = async (event, context) => {
    // Assume this is mounted on /testnumber. Quick and dirty way to get a subpath.
    const subpath = event.path.substring("/testnumber".length)
    console.log("routing subpath "+subpath)
    if(subpath === '/call') {
        await makecall(event)
        return h.ok()
    } else if(subpath === '/voice') {
        return h.rsp(electronica())
    } else if(subpath === '/voicefallback') {
        return h.rsp(voiceFallback(event))
    } else if(subpath === '/status') {
        console.log("Test number callback status event: "+JSON.stringify(event))
        return h.ok()
    } else {
        return h.rsp('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello from contact center</Say></Response>')
    }
}

async function makecall(event) {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const cb = "https://"+event.requestContext.domainName+'/'+event.queryStringParameters.then
    console.log("CALLBACK: "+cb)
    console.log("FROM PHONE: "+process.env.TEST_NUMBER)
    console.log("TO PHONE: "+event.queryStringParameters.to)
    const call = await client.calls
        .create({
            url: cb,
            to: event.queryStringParameters.to,
            from: process.env.TWILIO_PHONE_NUMBER
        })
    console.log("Call from test number initiated: "+call.sid)
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

function voiceFallback(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say("Sorry. Something went wrong.")
    return(response.toString())
}
