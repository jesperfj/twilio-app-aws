var h = require("./helpers.js")

module.exports.route = async (event, context) => {
    // Assume this is mounted on /cc. Quick and dirty way to get a subpath.
    const subpath = event.path.substring(3)
    console.log("routing subpath "+subpath)
    if(subpath === '/call') {
        await makecall(event)
        return h.ok()
    } else if(subpath === '/ambient') {
        return h.rsp(ambient())
    } else if(subpath === '/electronica') {
        return h.rsp(electronica())
    } else if(subpath === '/conference') {
        return h.rsp(conference(event))
    } else if(subpath === '/voice') {
        return h.rsp(ambient())
    } else if(subpath === '/voicefallback') {
        return h.rsp(voiceFallback(event))
    } else if(subpath === '/status') {
        console.log("Callback status event: "+event)
        return h.ok()
    } else {
        return h.rsp('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello from contact center</Say></Response>')
    }
}

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

function voiceFallback(event) {
    const VoiceResponse = require('twilio').twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say("Sorry. Something went wrong.")
    return(response.toString())
}
