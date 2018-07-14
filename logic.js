var client = null;
var logs = null;

function onConnect() {
    setElementStatuses(2);
    log('Connected to the MQTT server');
}

function onFailure(err) {
    setElementStatuses(0);
    log("ERROR: " + err.errorMessage);
}

function onConnectionLost(responseObject) {
    setElementStatuses(0);
    if (responseObject.errorCode !== 0) {
        log("ERROR: " + responseObject.errorMessage);
    } else {
        log("Disconnected from the server");
    }
}

function onMessageArrived(message) {
    log("Message has been received from topic " + message.topic);
    var msg = "[" + (new Date()).toLocaleString() + "][topic: " + message.topic + "]\n" + message.payloadString + "\n\n";
    document.getElementById('inputMessagesTextArea').textContent =
        document.getElementById('inputMessagesTextArea').textContent + msg;
    document.getElementById('inputMessagesTextArea').scrollTop = document.getElementById('inputMessagesTextArea').scrollHeight;
}

function connect() {
    var brokerHost = document.getElementById('brokerHostInput').value;
    var brokerPort = parseInt(document.getElementById('brokerPortInput').value);
    var brokerPathInput = document.getElementById('brokerPathInput').value;
    var mqttClientIdInput = document.getElementById('mqttClientIdInput').value;
    try {
        client = new Paho.MQTT.Client(brokerHost, brokerPort, brokerPathInput, mqttClientIdInput);
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;
        client.connect({onSuccess: onConnect, onFailure: onFailure});
        setElementStatuses(1);
    } catch (err) {
        log("ERROR: " + err.message);
    }
}

function disconnect() {
    client.disconnect();
}

function sendMessage() {
    var outputTopic = document.getElementById('outputTopicInput').value;
    var textMessage = document.getElementById('outputMessageTextArea').value;
    if (outputTopic === "") {
        alert("Output topic must be specified");
        return;
    }
    if (textMessage === "") {
        alert("Output message must be specified");
        return;
    }
    try {
        var message = new Paho.MQTT.Message(textMessage);
        message.destinationName = outputTopic;
        client.send(message);
        log("Message has been sent");
    } catch (err) {
        log("ERROR: " + err.message);
    }
}

function subscribeTopic() {
    var inputTopic = document.getElementById('inputTopicInput').value;
    if (inputTopic === "") {
        alert("Input topic must be specified");
        return;
    }
    client.subscribe(inputTopic);
    log("Subscribed the topic " + inputTopic);
}

/**
 *
 * @param connectionStatus 0 - not connected, 1 - connecting, 2 - connected
 */
function setElementStatuses(connectionStatus) {
    if (connectionStatus === 0) {
        document.getElementById('connectButton').disabled = false;
        document.getElementById('connectButton').textContent = "Connect";
    } else if (connectionStatus === 1) {
        document.getElementById('connectButton').disabled = true;
        document.getElementById('connectButton').innerHTML = "<div class=\"loader\"></div>";
    } else {
        document.getElementById('connectButton').disabled = true;
        document.getElementById('connectButton').textContent = "Connect";
    }
    var connected = connectionStatus === 2;
    document.getElementById('disconnectButton').disabled = !connected;
    document.getElementById('outputTopicInput').disabled = !connected;
    document.getElementById('outputMessageTextArea').disabled = !connected;
    document.getElementById('sendMessageButton').disabled = !connected;
    document.getElementById('inputTopicInput').disabled = !connected;
    document.getElementById('subscribeTopicButton').disabled = !connected;
}

function log(message) {
    if (logs === null) {
        logs = getArrayWithLimitedLength(5);
    }
    var newLog = "[" + (new Date()).toLocaleString() + "] " + message;
    logs.push(newLog);
    document.getElementById('log').textContent = logs.join("\n");
}

function getArrayWithLimitedLength(length) {
    var array = new Array();
    array.push = function () {
        if (this.length >= length) {
            this.shift();
        }
        return Array.prototype.push.apply(this, arguments);
    };
    return array;
}
