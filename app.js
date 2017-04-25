// settings stuff
'use strict';

const request = require('request');
const Botmaster = require('botmaster');
const mqtt = require('mqtt');
const express = require('express');
var bodyParser = require('body-parser');


const cfenv = require('cfenv');

const appEnv = cfenv.getAppEnv();

//var router = express.Router();


const messengerSettings = {
    credentials: {
        verifyToken: 'verify_me',
        pageToken: 'EAAJTsZAFAyPcBAKc6t1O0me1jzinQks3xNrujeKdK5ZCZCCIgXaFHMlXSDZC3tZBVbwn2JERU156pAvbQCjf2vs0wPKsFHR6sMZBaARC0XCaMa9g2q8h3wMNFzSZCfrmYzbZAlPLBq9PpQlvEX3AlZCoeDx1OqHavkSB8fqpbiZAiXVAZDZD',
        fbAppSecret: '1a0078588b4772807f34cc83ceca8514',
    },
    webhookEndpoint: '/webhook1234' // botmaster will mount this webhook on https://Your_Domain_Name/messenger/webhook1234
};
const twitterSettings = {
    credentials: {
        consumerKey: '4Bo2sw1e41j52A87oaDKWZm9n',
        consumerSecret: 'PSz8cwlOrBlOOsguwlGFtGSJgSSGJUmcJTI8RsBKxd15DyHPC2',
        accessToken: '771682422408769536-anL7xwA4J0oWSnigmRP11cpnIc4lBbK',
        accessTokenSecret: '6aHkOWnulN30hfjmmZ684IRX91uUnekaQHX839svRfQJA'
    }
};
//    credentials: {
  //      authToken: '288577179:AAHk7J29bF1hGxjYgJ9jdxscoWCW0N_TRPg',
  //  },
  //  webhookEndpoint: '/webhooks837373773739292',
//};

const telegramSettings = {
    credentials: {
        authToken: '257217551:AAFkQ5L2CSHhXTZx8W0pE5CUx8O7QIhUKH8',
    },
    webhookEndpoint: '/webhookshdhdhdh262727hhhd',
};



const socketioSettings = {
  id: 'watsoneudemo',
};

const slackSettings = {
  credentials: {
    clientId: '3487576868.124966588580',
    clientSecret: '73e3b394ff7578f3666b401f5a5b74ab',
    verificationToken: 'AyCdBvvDP3N8CAwfTUkuX3jS'
  },
  webhookEndpoint: '/webhookd24sr34se',
  storeTeamInfoInFile: true,
};



const botsSettings = [
{
    messenger: messengerSettings
},
{
    twitter: twitterSettings
},
{
    telegram: telegramSettings
},
{
    socketio:socketioSettings
},
{
    slack:slackSettings
}

];

const botmasterSettings = {
    botsSettings: botsSettings,
    port: appEnv.isLocal ? 3000 : appEnv.port
};



const botmaster = new Botmaster(botmasterSettings);
botmaster.app.use(express.static(__dirname + '/public'));
console.log('Botmaster connection established (Socket I/O, Telegram, Messenger, Slack and Twitter)');



// when botmaster receives a message from the chat channel
botmaster.on('update', (bot, update) => {
    console.log('Incoming from '+bot.type+ ': '+ update.sender.id + ' ' + update.message.text );
    var user_name=null;
    var device=null;
    var email_address=null;

    if (bot.type == 'telegram')
    {
        user_name = update.raw.message.from.first_name + ' ' + update.raw.message.from.last_name;
        device = 'Telegram';
    }
    else
    {
        if (bot.type == 'twitter')
        {
            user_name = update.raw.direct_message.sender.name;
            device = 'Twitter';
        }
        else
        {

            if (update.raw.device !== undefined)
            {
              if (bot.type == 'slack')
              {
                device = 'slack';
                update.sender.id = update.sender.id.replace(/\./g,'---');
              }
              else
              {
                device = update.raw.device;
              }

            }
            else
            {
              if (bot.type == 'slack')
              {
                device = 'slack';
                update.sender.id = update.sender.id.replace(/\./g,'---');
              }
              else
              {
                console.log(update.raw);

              }



            }
            if (update.raw.user_name !== undefined && user_name === null)
            {
              user_name = update.raw.user_name;
            }
            if (update.raw.email_address !== undefined)
            {
              email_address = update.raw.email_address;
            }
        }

    }
    if (bot.type == 'messenger')
     {
       bot.getUserInfo(update.sender.id).then((res)=>{

       if (res.first_name === undefined)
       {
         user_name = null;
       }
       else
       {
         user_name = res.first_name + ' ' + res.last_name;
       }
       var payload = {"input":{"text":update.message.text,
       "user":'X'+update.sender.id,
       "bottype":'messenger',"user_name":user_name, "device":'messenger',"email_address":email_address }};

     request({
         uri: "http://watsoneudemo.mybluemix.net/v3/message",
         method: "POST",
         json: payload
     }, function(error, response, body) {


                //bot.sendTextMessageTo(body.output.text, update.sender.id);

         });
     });
   }
   else
   {

    if (update.raw.demo !== undefined)
    {
      var payload = {"input":{"text":update.message.text,
      "user":'X'+update.sender.id,
      "bottype":bot.type, "demo":update.raw.demo,"user_name":user_name, "device":device, "email_address":email_address}};
    }
    else
    {
      var payload = {"input":{"text":update.message.text,
      "user":'X'+update.sender.id,
      "bottype":bot.type,"user_name":user_name, "device":device,"email_address":email_address }};
    }

    request({
        uri: "http://watsoneudemo.mybluemix.net/v3/message",
        method: "POST",
        json: payload
    }, function(error, response, body) {


               //bot.sendTextMessageTo(body.output.text, update.sender.id);

        });
   }

    });
//});


botmaster.app.use(bodyParser.json());



// A message is received back from the middle layer on the response web hook

botmaster.app.post('/response', function(req, res) {

    console.log('Received: ' + JSON.stringify(req.body));
    res.send(req.body);
    var bottype = req.body.output.bottype;
    var bot = botmaster.getBot({type: bottype})
    var cascade = [];
    if (req.body.output.text)
    {
      var text_length = req.body.output.text.length;
    }
    else
    {
        var text_length = 0;
    }


    var sender_id = req.body.output.user.substring(1).replace(/---/g,'.');

    if (req.body.output.buttons !== undefined)
    {

      if (req.body.context && req.body.context.customer_name && req.body.context.bottype == 'socketio')
      {
        var demo = req.body.context.customer_name;
        cascade.push({"raw":{"recipient":{"id":sender_id},"demo":demo}});
      }
      if (req.body.context && req.body.context.user_name && req.body.context.bottype == 'socketio')
      {
        var user_name = req.body.context.user_name;
        cascade.push({"raw":{"recipient":{"id":sender_id},"user_name":user_name}});
      }
      for (var i = 0; i < text_length; i++)
      {
        var string_no_buttons = (req.body.output.text[i].replace(/<mct:input>.*<\/mct:input>/g,' '));
        cascade.push({"text":string_no_buttons});
      }
      cascade.push({"buttons":req.body.output.buttons});


    }
    else
    {
      for (var j = 0; j < text_length; j++)
      {
        var buttons = (req.body.output.text[j].match(/<mct:input>[^<]*/g));
        if (buttons !== null)
        {
          var arrayLength = buttons.length;
        }
        else
        {
          var arrayLength = 0;
        }

        for (var i = 0; i < arrayLength; i++)
        {
            buttons[i] = buttons[i].substring(11);
        }
        var string_no_buttons = (req.body.output.text[j].replace(/<mct:input>.*<\/mct:input>/g,' '));

        if (!req.body.output.text[j].includes('SHOWIMAGE'))
        {


             if (req.body.context && req.body.context.customer_name && req.body.context.bottype == 'socketio')
             {
               var demo = req.body.context.customer_name;
               cascade.push({"raw":{"recipient":{"id":sender_id},"demo":demo}});
             }
             if (req.body.context && req.body.context.user_name && req.body.context.bottype == 'socketio')
             {
               var user_name = req.body.context.user_name;
               cascade.push({"raw":{"recipient":{"id":sender_id},"user_name":user_name}});
             }

             cascade.push({"text":string_no_buttons});
             if (arrayLength > 0)
             {
                //bot.sendDefaultButtonMessageTo(buttons,req.body.output.user.substring(1));
                cascade.push({"buttons":buttons});
              }
        }
      }


    }

    if (req.body.output.action && req.body.output.action.substring(0,9) == 'showImage')

    {
               var image_url=req.body.output.action.substring(14);
               cascade.push({"attachment":{
             "type": 'image',
             "payload": {
               "url": image_url
             }}});
               //bot.sendAttachmentFromURLTo('image', image_url, req.body.output.user.substring(1));
    }
    for (var j = 0; j < text_length; j++)
    {
      if (req.body.output.text[j].includes('SHOWIMAGE') )
      {
        var image_url=req.body.output.text[j].substring(15);
      //bot.sendAttachmentFromURLTo('image', image_url, req.body.output.user.substring(1));
      cascade.push({"attachment":{
        "type": 'image',
        "payload": {
          "url": image_url
        }}});
      }
    }


    bot.sendCascadeTo(cascade,sender_id)

    .catch((err) => {
      console.log(err);
    })
});







// asyncronous task to get a client_id
function getClientId(bot, update, user_name, cb) {
    // try to get details from store
    request({
        uri: "http://watsoneudemo.mybluemix.net/getclientdetailsbybotmasterid",
        method: "POST",
        json: {
            "botmasterid": update.sender.id
        },
    }, function(error, response, body) {
        // if we are succesful callback with the client id
        if (!error && response.statusCode == 200 && body.length > 0) {
            var client_id = body[0].client_id;
            cb(null, client_id);
            // if we are not assume that the error is that the record does not exist
            // create one and return the resulting client_id
        } else {
            request({
                uri: "http://watsoneudemo.mybluemix.net/v2/register",
                method: "POST",
                json: {
                    "botmasterid": update.sender.id,
                    "bottype": bot.type,
                    "device": 'Botmaster (' + bot.type + ')',
                    "user_name": user_name,
                    "locality" : "Unknown"
                }
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var client_id = body.client_id;
                    var customer_name = body.customer_name;
                    cb(null, client_id, customer_name);
                } else {
                    // if this does not work then we error
                    console.log('error calling register ' + err.stack);
                    cb(error);
                }
            });

        }
    });
}

function getChatId (bot,update,client_id, cb)
{
  // try to get details from store
  request({
      uri: "http://watsoneudemo.mybluemix.net/getclientchat",
      method: "POST",
      json: {
          "client_id": client_id
      },
  }, function(error, response, body) {
      // if we are succesful callback with the client id

      if (!error && response.statusCode == 200) {
          var chat_id = body.chat_id;
          cb(null, chat_id);
          // if we are not assume that the error is that the record does not exist
          // create one and return the resulting client_id
      } else {
                  // if this does not work then we error
                  console.log('error finding chats ');
                  cb(error);
              }
          });

      }

      function callChooser (bot,update,client_id, user_name, cb)
      {

        request({
            uri: "http://watsoneudemo.mybluemix.net/v2/newchat",
            method: "POST",
            json: {
                "customer_name" : "Demo Chooser",
                "client_id" : client_id,
                "user_name":user_name,
                "device":bot.type,
                "locality":"Unknown"
            },
        }, function(error, response, body) {
            // if we are succesful callback with the chat id

            if (!error && response.statusCode == 200) {
                var chat_id = body.chat_id;
                var   response = body.response;
                cb(null, chat_id, response);
                // if we are not assume that the error is that the record does not exist
                // create one and return the resulting client_id
            } else {
                        // if this does not work then we error
                        console.log('error registering chat ');
                        cb(error);
                    }
                });

            }

function checkIfBotChat(chat_id, cb) {

                request({
                    uri: "http://watsoneudemo.mybluemix.net/getchatdetails",
                    method: "POST",
                    json: {
                        "chat_id": chat_id
                    },
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.length > 0) {
                        var client_id = body[0].client_id;
                        request({
                            uri: "http://watsoneudemo.mybluemix.net/getclientdetails",
                            method: "POST",
                            json: {
                                "client_id":client_id
                            }
                        }, function(error, response, body) {

                                if (body[0].botmasterid !== undefined)
                                {
                                    var botmasterid = body[0].botmasterid;
                                    var bottype = body[0].bottype;
                                }
                                else
                                {
                                    var botmasterid = 0;
                                }
                                cb(null, botmasterid, bottype);


                            });
                          }
                            else
                            {
                                // if this does not work then we error
                                console.log('error calling register ' + err.stack);
                                cb(error);
                            }



                });
            }


// catch botmaster errors
botmaster.on('error', (bot, err) => {
    console.log(err.stack);
    console.log('there was an error');
});
