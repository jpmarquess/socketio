$(function () {
	//make connection
	var socket = io.connect('http://localhost:3000')

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	name = prompt("Qual o nome que deseja usar ?");
	chatroom.append("<p class='message'>You joined the chat.</p>")
	socket.emit('new_user', name);

	//Emit message
	send_message.click(function () {
		socket.emit('new_message', { message: message.val() })
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	//Emit a username
	send_username.click(function () {
		socket.emit('change_username', { username: username.val() })
	})

	//Listen on change_username
	socket.on("change_username", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'>" + data.old_username + " changed name to " + data.username + "</p>")
	})

	//Listen on disconnect
	socket.on("disconnect", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'>" + data.username + " disconnected</p>")
	})

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	socket.on("user_connected", (name) => {
		feedback.html('');
		chatroom.append("<p class='message'>" + name + " joined the chat." + "</p>")
	})

	socket.on("send_image", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'>" + data.username + "<img width='300px' height='200px' src='/uploads/" + data.image_path + "'></p>")
	})
});