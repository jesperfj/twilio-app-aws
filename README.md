# Twilio Application Model for AWS

Twilio makes it easy to build powerful Voice, Video and Messaging applications with very little code. A Twilio application is some code that Twilio can call via web hooks. The code decides how to connect calls, play messages and many other things. This repo will set you up with a simple Hello World app on AWS using AWS API Gateway and AWS Lambda. Your usage as part of trying this out should fall within the free tier and not cost you anything.

The baseline template in this repo follows best practices for production systems. Once you've got Hello World working, you should be well on your way to create a fully scalable production communications app.

# Configure AWS

* [Download AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [Set up credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration)

# Configure Twilio

* [Create account if you don't have one](https://www.twilio.com/try-twilio)

After you have created an account, grab your Twilio account SID and authentication token from this console page and same them in a file named `.twilio` in this directory. Example:

```
$ cat .twilio
TWILIO_ACCOUNT_SID=AC1234567abcdef...
TWILIO_AUTH_TOKEN=0123456789abcdef...
```

# Set up the application infrastructure

Twilio applications work by receiving web hooks from Twilio and executing code that decides what to do. This project sets you up with everything you need to do just that on AWS. The following command will set up an API Gateway and a default Lambda function to give you a "Hello World" example:

    bin/create-stack


# Buy a phone number

This might sound daunting but it's easy and cheap and you can throw it away any time. This command will cost you the astronomical sum of $1:

    bin/buy-number

If you keep the number, you will be charged $1 every month.

# Get rid of the number

To stop paying for a number release the number with:

    bin/release-number <number>

Use the `bin/numbers` command to check the list of numbers that you have purchased.

# Use an existing number

If you're already a Twilio developer and you have an existing number you want to repurpose, you can do this:

    bin/setup-number <your-number>

You can get a list of your existing numbers with:

    bin/numbers

# Package and deploy the function

First grab the dependencies:

    (cd twilio-function; npm install)

Then deploy the function code with

    bin/deploy

(Standing in the root of this project directory). Finally, set the environment for the function with

    bin/setenv

# Try it out

* Call your number. You should hear a message and some music.
* Send a text to your number. You should receive a reply
* Make a call by hitting the REST API: `curl $(bin/gwurl)/call?to=<some-number>`

# Make a change and redeploy

You can find the function code in [`twilio-function/index.js`](twilio-function/index.js). E.g. try change the response message in `helloSMS()`. Now redeploy with

    bin/deploy

It is as simple as that. Just remember to run `npm install` in the `twilio-function` directory if you are introducing new dependencies. 

# View function logs

Viewing logs using just AWS CLI is cumbersome. Instead, use a dedicated tool like [awslogs](https://github.com/jorgebastida/awslogs) or [cw](https://github.com/lucagrulla/cw). The former is Python. The latter is Go. Otherwise they seem pretty similar. The Log Group for your Lambda function is `/aws/lambda/twilio-function`. So you can tail logs with `awslogs` like this:

    awslogs get -G /aws/lambda/twilio-function -w

# View API Gateway logs

To view the logs from API Gateway you must first grant permission for the AWS API Gateway service to write logs to CloudWatch. This is a one-time configuration for your AWS Account, so you may already have done it. Once configured, you can tail logs with

    awslogs get -G $(bin/gwloggroup) -w

`bin/gwloggroup` is a helper script that determines the CloudWatch Log Group name based on the CloudFormation stack you created earlier.

# Set log retention

By default, logs will never get deleted. You can set log retention for the Gateway and Lambda Log Groups with this helper script:

    bin/set-log-retention <days>

# TODO

* Add request validation for callbacks
* Add token authorization for REST API calls

