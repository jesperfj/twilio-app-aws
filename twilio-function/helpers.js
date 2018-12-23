module.exports = {
    rsp: function(body) {
        return {
            'statusCode': 200,
            'body': body,
            'headers': {'Content-Type': 'application/xml'}
        }
    },

    ok: function() {
        return {
            'statusCode': 200,
            'body': 'OK'
        }
    },

    // Getting the base URL for an API gateway request is a little tricky. event.path
    // does not contain the stage part. event.requestContext.path has everything.
    baseurl: function(event) {
        return "https://"+event.requestContext.domainName+
            event.requestContext.path.substring(0,event.requestContext.path.length-event.path.length)
    }
}
