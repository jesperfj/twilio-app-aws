# Twilio Application Model for AWS

Twilio makes it easy to build powerful Voice, Video and Messaging applications with very little code. A Twilio application is some code that Twilio can call via web hooks. The code decides how to connect calls, play messages and many other things. This repo will set you up with a simple Hello World app on AWS using AWS API Gateway and AWS Lambda. Your usage as part of trying this out should fall within the free tier and not cost you anything.

The baseline template in this repo follows best practices for production systems. Once you've got Hello World working, you should be well on your way to create a fully scalable production communications app.


# Configure AWS

* [Download AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [Set up credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration)

# Configure Twilio

* [Create account if you don't have one](https://www.twilio.com/try-twilio)

After you have created an account, grab your Twilio account SID and authentication token from this console page and same them in .twilio in this directory. Example:

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

# Try it out

