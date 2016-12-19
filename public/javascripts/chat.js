var socket = io();
var form = document.getElementById('f');
var input = document.getElementById('m');
var messages = document.getElementById('messages');

form.onsubmit = function() {
    socket.emit('chat message', input.value);
    input.value = '';
    return false;
};

socket.on('chat message', function(msg) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(msg));
    messages.appendChild(li);
});
