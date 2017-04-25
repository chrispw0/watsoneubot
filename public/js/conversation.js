// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/


var socket = io('watsoneubot.mybluemix.net');

socket.on('message', function(botmasterMessage){

    console.log(botmasterMessage);

  if (botmasterMessage.demo)
  {

    if (botmasterMessage.demo != 'adminconsole')
    {
      document.title = botmasterMessage.demo+ ' with Watson';
    }
    else
    {
      document.title = 'Administration Console';
    }

    var banner = document.getElementById( 'banner' );
    var footer = document.getElementById( 'footer' );
    var logo = document.getElementById( 'logo' );
    var text = document.getElementsByClassName('from-watson');
    var fromUser = document.querySelectorAll('pu');
    var styleElem = document.head.appendChild(document.createElement("style"));
    var styleElem2 = document.head.appendChild(document.createElement("style"));
    var styleElem3 = document.head.appendChild(document.createElement("style"));
    var styleElem4 = document.head.appendChild(document.createElement("style"));

    //var text = document.getElementsByClassName('from-watson.latest.top');


    var bannerContent = document.getElementById( 'banner-content' );


    if (botmasterMessage.demo == 'Flightbusters')
    {
      banner.style.backgroundColor = '00395D';
      footer.style.backgroundColor = '00395D';

      for (var i = 0; i < text.length; i++)
      {
        text[i].style.color = "00395D";
       }
       for (i = 0; i < fromUser.length; i++)
       {
         fromUser[i].style.backgroundColor = "0064FF";


        }
        styleElem.innerHTML = ".from-user .message-inner {background: #0064FF;}";
        styleElem2.innerHTML = ".from-user .message-inner::before {background: #0064FF}";
        styleElem3.innerHTML = ".from-watson p {color: #00395D}";
        styleElem4.innerHTML = "#textInput.underline {border-bottom: 2px solid #0064FF}";



      bannerContent.innerHTML = "<img id = 'logo' src='img/airplane.png' height=30> &emsp; Flightbusters powered by <b>Watson</b> and Skyscanner";
    }

    if (botmasterMessage.demo == 'adminconsole')
    {
      banner.style.backgroundColor = '975AD1';
      footer.style.backgroundColor = '975AD1';
      bannerContent.innerHTML = "<img id = 'logo' src='img/watsonlogo.png' height=30> &emsp; <b>Watson</b> EU Demo Administration Console";
    }
    if (botmasterMessage.demo == 'Royal Mail')
    {
      banner.style.backgroundColor = 'D00101';
      footer.style.backgroundColor = 'D00101';
      bannerContent.innerHTML = "<img id = 'logo' src='img/RoyalMail.png' height=30> &emsp; Rose from Royal Mail";
    }

  }
  if (botmasterMessage.user_name && botmasterMessage.user_name != 'Anonymous User')
  {
    var footerContent = document.getElementById( 'footer-content');
    footerContent.innerHTML = '&emsp; IBM <b>Watson</b> &emsp; &emsp; '+ botmasterMessage.user_name;
  }

  Api.setResponsePayload(botmasterMessage);

});

function getURLParameter(name)
{
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

var ConversationPanel = (function() {
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  }




  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown,
    clickInput : clickInput
  };

  function clickInput(payload, type) {
     if (type === 'btn') {

       var inp = document.getElementById('textInput');

       inp.value = payload;
       // Send the user message

       Api.sendRequest(payload);
       var message = {text: payload, device:'Browser'};
       var demo = getURLParameter('demo');
       if (demo !== undefined && demo !== null)
       {
         message.demo= demo;
       }
       message.email_address = getURLParameter('email_address');
       message.user_name = getURLParameter('name');
       socket.send(message);

       // Clear input box for further messages
       inp.value = '';
       Common.fireEvent(inp, 'input');
     }
     if (type === 'url') {
       var win = window.open(payload, '_blank');
       if (win) {
         //Browser has allowed it to be opened
         win.focus();
       } else {
         //Browser has blocked it
         alert('Please allow popups for this website');
       }
     }
   }


  // Initialize the module
  function init() {

    var demo = getURLParameter('demo');

    if (demo == 'adminconsole')
    {
        var displayDemo = 'the Administration Console';
    }
    else
    {
        var displayDemo = demo;
    }
    chatUpdateSetup();



    if (demo !== undefined && demo !== null)
    {
      displayMessage(JSON.parse('{"message":{"text":"<b>Watson</b>: Please wait while I connect you to '+ displayDemo+'."}}'), settings.authorTypes.watson);
      var message = {
        text: "hi",
       demo: demo,
       device: 'Browser'
      };
    }
    else
    {
      displayMessage(JSON.parse('{"message":{"text":"<b>Watson</b>: Please wait while I connect you."}}'), settings.authorTypes.watson);
       var message = {text: "hi", device :'Browser'};


    }
    message.email_address = getURLParameter('email_address');
  message.user_name = getURLParameter('name');



    displayMessage(JSON.parse('{"message":{"text":"<b>Watson</b>: I am initiating the environment."}}'), settings.authorTypes.watson);

    Api.sendRequest( '', null );

    socket.send(message);
    if (demo !== undefined && demo !== null)
    {
      displayMessage(JSON.parse('{"message":{"text":"<b>Watson</b>: '+displayDemo+' is almost ready...."}}'), settings.authorTypes.watson);

    }
    else
    {
      displayMessage(JSON.parse('{"message":{"text":"<b>Watson</b>: I am almost ready...."}}'), settings.authorTypes.watson);
    }


    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);

      displayMessage(newPayloadStr, settings.authorTypes.watson);
    };
  }

// Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    var input = document.getElementById('textInput');
    var dummy = document.getElementById('textInputDummy');
    var minFontSize = 14;
    var maxFontSize = 16;
    var minPadding = 4;
    var maxPadding = 6;

    // If no dummy input box exists, create one
    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': 'textInputDummy'
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }

    function adjustInput() {
      if (input.value === '') {
        // If the input box is empty, remove the underline
        input.classList.remove('underline');
        input.setAttribute('style', 'width:' + '100%');
        input.style.width = '100%';
      } else {
        // otherwise, adjust the dummy text to match, and then set the width of
        // the visible input box to match it (thus extending the underline)
        input.classList.add('underline');
        var txtNode = document.createTextNode(input.value);
        ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height',
          'text-transform', 'letter-spacing'].forEach(function(index) {
            dummy.style[index] = window.getComputedStyle(input, null).getPropertyValue(index);
          });
        dummy.textContent = txtNode.textContent;

        var padding = 0;
        var htmlElem = document.getElementsByTagName('html')[0];
        var currentFontSize = parseInt(window.getComputedStyle(htmlElem, null).getPropertyValue('font-size'), 10);
        if (currentFontSize) {
          padding = Math.floor((currentFontSize - minFontSize) / (maxFontSize - minFontSize)
            * (maxPadding - minPadding) + minPadding);
        } else {
          padding = maxPadding;
        }

        var widthValue = ( dummy.offsetWidth + padding) + 'px';
        input.setAttribute('style', 'width:' + widthValue);
        input.style.width = widthValue;
      }
    }

    // Any time the input changes, or the window resizes, adjust the size of the input box
    input.addEventListener('input', adjustInput);
    window.addEventListener('resize', adjustInput);

    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');
  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text) || (newPayload.message && newPayload.message.text);
    var attachmentExists = (newPayload.message && newPayload.message.attachment);
    if (isUser !== null && (textExists||attachmentExists)) {
      // Create new message DOM element


      var messageDivs = buildMessageDomElements(newPayload, isUser);


      var chatBoxElement = document.querySelector(settings.selectors.chatBox);
      var previousLatest = chatBoxElement.querySelectorAll((isUser
              ? settings.selectors.fromUser : settings.selectors.fromWatson)
              + settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, function(element) {
          element.classList.remove('latest');
        });
      }


      messageDivs.forEach(function(currentDiv) {
        chatBoxElement.appendChild(currentDiv);
        // Class to start fade in animation
        currentDiv.classList.add('load');
      });
      // Move chat to the most recent messages when new messages are added
      scrollToChatBottom();
    }
  }

  // Checks if the given typeValue matches with the user "name", the Watson "name", or neither
  // Returns true if user, false if Watson, and null if neither
  // Used to keep track of whether a message was from the user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.watson) {
      return false;
    }
    return null;
  }

  function buildMessageDomElements(incomingPayload, isUser) {

     var newPayload = isUser ? incomingPayload.input : incomingPayload.message;

     var type = "";

     if (newPayload && newPayload.text)
     {
       if (newPayload.quick_replies)
       {
         type = "btns";
       }
       else
       {
          type = "text";
       }
     }
     else if (newPayload && newPayload.attachment) {
       if (newPayload.attachment.type === 'template') {
         if (newPayload.attachment.payload && newPayload.attachment.payload.buttons &&
           newPayload.attachment.payload.buttons[0].type && newPayload.attachment.payload.buttons[0].type == 'postback')
           type = "btns";
         else if (newPayload.attachment.payload && newPayload.attachment.payload.buttons &&
           newPayload.attachment.payload.buttons[0].type && newPayload.attachment.payload.buttons[0].type == 'web_url')
           type = 'urls';
       } else if (newPayload.attachment.type === 'image')
         type = 'image';
     }

     if (type == "text") {
       var textArray = newPayload.text;
       if (Object.prototype.toString.call(textArray) !== '[object Array]') {
         textArray = [textArray];
       }
       var messageArray = [];

       textArray.forEach(function(currentText) {
         if (currentText) {
           var messageJson = {
             // <div class='segments'>
             'tagName': 'div',
             'classNames': ['segments'],
             'children': [{
               // <div class='from-user/from-watson latest'>
               'tagName': 'div',
               'classNames': [(isUser ? 'from-user' : 'from-watson'), 'latest', ((messageArray.length === 0) ? 'top' : 'sub')],
               'children': [{
                 // <div class='message-inner'>
                 'tagName': 'div',
                 'classNames': ['message-inner'],
                 'children': [{
                   // <p>{messageText}</p>
                   'tagName': (isUser ? 'pu' : 'p'),
                   'text': currentText.replace('[History]: ',' ').replace('[','<b>').replace(']','</b>')
                 }]
               }]
             }]
           };
           messageArray.push(Common.buildDomElement(messageJson));
         }
       });
     }
     if (type == "btns") {
       var btnText = newPayload.text;
       var btns = newPayload.quick_replies;

       var messageArray = [];
       var messageJson = {
         // <div class='segments'>
         'tagName': 'div',
         'classNames': ['segments'],
         'children': [{
           // <div class='from-user/from-watson latest'>
           'tagName': 'div',
           'classNames': ['from-watson', 'latest', 'top'],
           'children': [{
             // <div class='message-inner'>
             'tagName': 'div',
             'classNames': ['message-inner'],
             'children': [{
               // <p>{messageText}</p>
               'tagName': 'p',
               'text': btnText,
             }]
           }]
         }]
       };
       messageArray.push(Common.buildDomElement(messageJson));

       btns.forEach(function(currentBtn) {
         if (currentBtn) {
           messageJson = {
             // <div class='segments'>
             'tagName': 'div',
             'classNames': ['segments'],
             'children': [{
               // <div class='from-user/from-watson latest'>
               'tagName': 'div',
               'classNames': ['from-watson', 'latest', 'sub'],
               'children': [{
                 // <div class='message-inner'>
                 'tagName': 'div',
                 'classNames': ['message-inner'],
                 'children': [{
                   // <p>{messageText}</p>
                   'tagName': 'button',
                   'text': currentBtn.title,
                   'value': currentBtn.payload,
                   "attributes": [{
                     "name": "onclick",
                     "value": "ConversationPanel.clickInput(\"" + currentBtn.payload + "\", \"btn\")"
                   }],
                 }]
               }]
             }]
           };
           messageArray.push(Common.buildDomElement(messageJson));
         }
       });
     }
     if (type == "urls") {
       var btnText = newPayload.quick_replies.text;


       var messageArray = [];
       var messageJson = {
         // <div class='segments'>
         'tagName': 'div',
         'classNames': ['segments'],
         'children': [{
           // <div class='from-user/from-watson latest'>
           'tagName': 'div',
           'classNames': ['from-watson', 'latest', 'top'],
           'children': [{
             // <div class='message-inner'>
             'tagName': 'div',
             'classNames': ['message-inner'],
             'children': [{
               // <p>{messageText}</p>
               'tagName': 'p',
               'text': btnText,
             }]
           }]
         }]
       };
       messageArray.push(Common.buildDomElement(messageJson));

       urls.forEach(function(currentBtn) {
         if (currentBtn) {
           messageJson = {
             // <div class='segments'>
             'tagName': 'div',
             'classNames': ['segments'],
             'children': [{ //c
                 // <div class='from-user/from-watson latest'>
                 'tagName': 'div',
                 'classNames': ['from-watson', 'latest', 'sub'],
                 'children': [{ //b
                     // <div class='message-inner'>
                     'tagName': 'div',
                     'classNames': ['message-inner'],
                     'children': [{ //a
                         // <p>{messageText}</p>
                         'tagName': 'button',
                         'text': currentBtn.title,
                         'value': currentBtn.url,
                       }] //a
                   }] //b
               }] //c
           };
           if (currentBtn.webview_height_ratio) {
             if (currentBtn.webview_height_ratio === 'full')
               messageJson.children[0].children[0].children[0].attributes = [{
                 "name": "onclick",
                 "value": "ConversationPanel.clickInput(\"" + currentBtn.url + "\", \"url\")"
               }];
             else if (currentBtn.webview_height_ratio === 'compact')
               messageJson.children[0].children[0].children[0] = {
                 'tagName': 'iframe',
                 'classNames': ['message-iframe-compact'],
                 "attributes": [{
                   "name": "src",
                   "value": currentBtn.url
                 }],
               };
             else if (currentBtn.webview_height_ratio === 'tall')
               messageJson.children[0].children[0].children[0] = {
                 'tagName': 'iframe',
                 'classNames': ['message-iframe-tall'],
                 "attributes": [{
                   "name": "src",
                   "value": currentBtn.url
                 }],
               };
           } else { // defaults to full
             messageJson.children[0].children[0].children[0].attributes = [{
               "name": "onclick",
               "value": "ConversationPanel.clickInput(\"" + currentBtn.url + "\", \"url\")"
             }];
           }
           messageArray.push(Common.buildDomElement(messageJson));
         }
       });
     }
     if (type == "image") {
       var imageUrl = newPayload.attachment.payload.url;

       var messageArray = [];
       var messageJson = {
         // <div class='segments'>
         'tagName': 'div',
         'classNames': ['segments'],
         'children': [{
           // <div class='from-user/from-watson latest'>
           'tagName': 'div',
           'classNames': ['from-watson', 'latest', 'top'],
           'children': [{
             // <div class='message-inner'>
             'tagName': 'div',
             'classNames': ['message-inner'],
             'children': [{
               'tagName': 'p',
               'text': ' ',
             }, {
               // <p>{messageText}</p>
               'tagName': 'br',
             }, {
               'tagName': 'img',
               'classNames': ['message-image'],
               "attributes": [{
                 "name": 'src',
                 "value": imageUrl,
               }]
             }]
           }]
         }]
       };
       messageArray.push(Common.buildDomElement(messageJson));
     }



     return messageArray;
   }




  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Watson.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Watson message is long.
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    var scrollEl = scrollingChat.querySelector(settings.selectors.fromUser
            + settings.selectors.latest);
    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (event.keyCode === 13 && inputBox.value)
    {
      // Retrieve the context from the previous server response
      var context;
      var latestResponse = Api.getResponsePayload();
      if (latestResponse)
      {
        context = latestResponse.context;
      }

      // Send the user message
      var demo = getURLParameter('demo');

      if (demo !== undefined)
      {
        var message = {
          text: textInput.value,
          demo: demo,
          device: 'Browser'
        };
      }
      else
      {
          var message = {text: textInput.value, device : 'Browser'};
      }


      var email_address= getURLParameter('email_address');
      var name = getURLParameter('name');


      message.email_address = email_address;
      message.user_name = name;

      Api.sendRequest(inputBox.value, context);


      socket.send(message);

      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
    }
  }
}());
