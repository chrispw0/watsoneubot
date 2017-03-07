var socket = io('');

// just get the html elements we will be needing by ID
var form = document.getElementById('form');
var textInput = document.getElementById('text-input');
var messages = document.getElementById('messages');

form.onsubmit = function(event) {
  // just making sure the page isn't refreshed
  event.preventDefault();
  // don't do anything if there is no text
  if (!textInput.value) {
    return;
  }
  // Add the user message to the web page
  messages.insertAdjacentHTML('beforeend',
    `<li class="user-message">${textInput.value}</li>`);
  // create a botmaster compatible message from the text input by user
  const message = {
    text: textInput.value 

  };
  // just send a stringified version of it over the webSocket
  socket.send(JSON.stringify(message));
  // finally, clear the user textInput field
  textInput.value = '';
};

socket.on('message', function(botmasterMessage){
  var messageObject = JSON.parse(botmasterMessage);
  var textMessage = messageObject.message.text;

  messages.insertAdjacentHTML('beforeend',
    `<li class="botmaster-message">${textMessage}</li>`);
});
