$(function () {
	// Make connection
	var socket = io.connect('http://localhost:3000')

	// Buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")

	chatroom.append("<p class='message'>You joined the chat.</p>");

	// Error if text field is empty
	socket.on("error", (data) => {
		alert(data.message);
	})

	// Emit message
	send_message.click(function () {
		socket.emit('new_message', { message: message.val() })
	})

	// Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'><strong>" + data.username + "</strong>: " + data.message + "</p>")
	})

	// Emit a username
	send_username.click(function () {
		socket.emit('change_username', { username: username.val() })
	})

	// Listen on change_username
	socket.on("change_username", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'><strong>" + data.old_username + "</strong> changed name to <strong>" + data.username + "</strong>.</p>")
	})

	// Listen on disconnect
	socket.on("disconnect", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'><strong>" + data.username + " </strong>left the chat.</p>")
	})

	// Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	// Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i><strong>" + data.username + " </strong>is typing a message..." + "</i></p>")
	})

	socket.on("user_connected", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'><strong>" + data.username + " </strong>joined the chat.</p>")
	})

	socket.on("send_image", (data) => {
		feedback.html('');
		chatroom.append("<p class='message'><strong>" + data.username + ":</strong><br><br><img width='300px' height='200px' src='/uploads/" + data.image_path + "'></p>")
	})
});