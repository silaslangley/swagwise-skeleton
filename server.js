/* ================= REQUIRE MODULES ===================== */

var express      = require('express'),
    app          = express(),
    path         = require('path'),
    fs           = require('fs'),
    logger       = require('morgan'),
    mongoose     = require('mongoose'),
    uriUtil      = require('mongodb-uri'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    passport     = require('passport'),
    session      = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt        = require('bcrypt-nodejs');
    http         = require('http'),
    https        = require('https');


/* ===================== CONFIGURATION ==================== */

var app = express();

var privateKey   = fs.readFileSync('cert/server.key', 'utf8');
var certificate  = fs.readFileSync('cert/server.crt', 'utf8');
var credentials  = {key: privateKey, cert: certificate};

var httpServer   = http.createServer(app);
var httpsServer  = https.createServer(credentials, app);

var port = process.env.PORT || 9001;					                // Default port or port 9001
var sslport = 8443;                                                     // 8443 for development, 443 for production

/*
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for
 * plenty of time in most operating environments.
 */

var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS : 30000
        }
    }
};

/*
 * Mongoose uses a different connection string format than MongoDB's standard.
 * Use the mongodb-uri library to help you convert from the standard format to
 * Mongoose's format.
 */

var mongodbUri = 'mongodb://swagwise:geekwise@ds045679.mongolab.com:45679/geekwise';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
var conn = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/swagwise');

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function() {
    // Wait for the database connection to establish, then start the app.
    httpServer.listen(port);                                          // startup our app at http://localhost:9001
    httpsServer.listen(sslport);                                      // startup our HTTPS server on http://localhost:8443 or :443
    console.log('Get your swagger on at http://localhost:' + port);   // shoutout to the user
    console.log('Get your secure swagger on at https://localhost:' + sslport);   // shoutout to the user
});
/*
mongoose.connect('mongodb://localhost:27017/swag');
mongoose.connection.once('open', function() {
    app.listen(port);                                                 // startup our app at http://localhost:9001
    console.log('Get your swagger on at http://localhost:' + port);   // shoutout to the user
});
*/

/* ================= REGISTER MODULES ===================== */

app.use(logger('dev'));                                 		        // log every request to the console
app.use(bodyParser.json());                             		        // have the ability to simulate DELETE and PUT
app.use(bodyParser.urlencoded());                       		        // have the ability to simulate DELETE and PUT
app.use(cookieParser());                                		        // have the ability to parse cookies
app.use(express.static(path.join(__dirname, 'app')));		            // set the static files location
app.use(session({ 
    secret: 'blackwidow straw',
    saveUninitialized: true,
    resave: true }));                       // Encryption key/salt
app.use(passport.initialize());                                         // Initializes passport
app.use(passport.session());
app.use(function(req, res, next) {
    if (req.user) {
        res.cookie('user', JSON.stringify(req.user));
    }
    next();
});

/* ======================== MODELS ========================= */
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
    if(~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

/* ===================== PASSPORT ========================= */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var User = mongoose.model('User');

    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local', new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
    var User = mongoose.model('User');

    User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);

        function cb(err, isMatch) {
            if (err) return done(err);
            if (isMatch) return done(null, user);
            return done(null, false);
        }
        bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    });
}));

/* ======================== ROUTES ========================= */

require('./admin-routes.js')(app);
require('./routes.js')(app);

exports = module.exports = app;                                         // expose app
