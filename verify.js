const {TWILIO_AUTH_TOKEN,TWILIO_SID,TWILIO_SERVICE} = require('./config')
const client = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);

// client.verify.v2.services
//                 .create({friendlyName: 'My Verify Service'})
//                 .then(service => console.log(service.sid));

async function sendSMS(){
    const response = await client.verify.v2.services(TWILIO_SERVICE)
                                            .verifications
                                            .create({
                                                to:'+14438892716',
                                                channel:'sms',
                                                templateSid:'HJ152393dff43d3a2c1554ab0f28291dbe',
                                                templateCustomSubstitutions: JSON.stringify({
                                                    friendlyName:"Message.ly"
                                                })
                                            })

    console.log(response)
}

async function verifySMSCode(code){
    const response = await client.verify.v2.services(TWILIO_SERVICE)
                                            .verificationChecks
                                            .create({
                                                to:'+14438892716',
                                                code
                                            })
    console.log(response)
}

module.exports = {
    sendSMS,
    verifySMSCode,
    client
}