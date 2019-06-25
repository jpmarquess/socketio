const express = require('express');
const fs = require("fs");
const multer = require('multer');
const path = require('path');
const app = express();

var user;

// Set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('./public'));

//routes
app.get('/', (req, res) => {
    res.render('index');
})

// Listen on port 3000
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at http://%s:%s", host, port);

    fs.open("log.txt", "a", function (err, fd) { });
});

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('img');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Socket.io
const io = require("socket.io")(server)

// Listen on every connection
io.on('connection', (socket) => {
    function writeLog(data) {
        fs.appendFile("log.txt", data, function (err) {
            if (err) throw err;
            console.log("Saved");
        });
    }

    socket.username = "Anonymous";
    user = socket.username;
    console.log("User connected");

    socket.broadcast.emit("user_connected", { username: socket.username });

    // Listen on change_username
    socket.on('change_username', (data) => {
        var old_username = socket.username;

        if (!data.username.replace(/\s/g, '').length) {
            io.sockets.emit('error', { message: "Username field is empty !" })
        } else {
            socket.username = data.username;
            user = socket.username;
            io.sockets.emit('change_username', { username: user, old_username: old_username });
        }
    })

    // Listen on new_message
    socket.on('new_message', (data) => {
        if (!data.message.replace(/\s/g, '').length) {
            io.sockets.emit('error', { message: "Message field is empty !" });
        } else {
            //broadcast the new message
            io.sockets.emit('new_message', { message: data.message, username: socket.username });

            var log = socket.username + " " + data.message + " " + new Date() + "\n";

            writeLog(log);
        }
    })

    // Listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })

    // Listen on disconnect
    socket.on('disconnect', () => {
        io.sockets.emit('disconnect', { username: socket.username });
        console.log("User disconnected");
    });

    // Post image
    app.post('/', (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                res.render('index', {
                    msg: err
                });
            } else {
                if (req.file == undefined) {
                    res.render('index', {
                        msg: 'Error: No File Selected!'
                    });
                } else {
                    io.sockets.emit("send_image", { image_path: req.file.filename, username: user });
                }
            }
        });
    });
})
