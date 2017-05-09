// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
const resolve = require('path').resolve;
var Parse = require('parse/node');

Parse.initialize("1j5AUs95Nx9y4fbZJEXZNiOVEjcbJjalTFbxMGFQ", "xRbUuRWOv21pvLmBddf9gTcmcnyX1R9AHkjHNRnb","xRbUuRWOv21pvLmBddf9gTcmcnyX1R9AHkjHNRnb");
Parse.Cloud.useMasterKey();



// Parse.serverURL = 'http://localhost:1337/parse';
// var databaseUri = "mongodb://heroku_h5sc1hpx:jer7765m@ds023530.mlab.com:23530/heroku_h5sc1hpx";

Parse.serverURL = 'https://starpark.herokuapp.com/parse'
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;


if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '1j5AUs95Nx9y4fbZJEXZNiOVEjcbJjalTFbxMGFQ',
  masterKey: process.env.MASTER_KEY || 'xRbUuRWOv21pvLmBddf9gTcmcnyX1R9AHkjHNRnb', //Add your master key here. Keep it secret!
  clientKey: 'xRbUuRWOv21pvLmBddf9gTcmcnyX1R9AHkjHNRnb',
  serverURL: process.env.SERVER_URL || 'https://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  publicServerURL: 'https://starpark.herokuapp.com/parse',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'StarPark',
  emailAdapter: {
    module: 'parse-server-mailgun-adapter-template',
    options: {
      // The address that your emails come from 
      fromAddress: 'Starpark <postmaster@sandboxa1ec5ea321634f19b1e8eb5d2af355ba.mailgun.org>',
      // Your domain from mailgun.com 
      domain: 'sandboxa1ec5ea321634f19b1e8eb5d2af355ba.mailgun.org',
      // Your API key from mailgun.com 
      apiKey: 'key-3acca1a5886ee455c5612e9ad7dcd504',
       // Password reset email subject
      passwordResetSubject: 'Password Reset Request for %appname%',
      // Password reset email body
      passwordResetBody: 'Hi,\n\nYou requested a password reset for %appname%.\n\nClick here to reset it:\n%link%',
      //OPTIONAL (will send HTML version of email):
      // passwordResetBodyHTML: "<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml>........",
      

      // The template section 
      // templates: {
      //   passwordResetEmail: {
      //     subject: 'Reset your password',
      //     pathPlainText: resolve(__dirname, 'path/to/templates/password_reset_email.txt'),
      //     pathHtml: resolve(__dirname, 'path/to/templates/password_reset_email.html'),
      //     callback: (user) => { return { firstName: user.get('firstName') }}
      //     // Now you can use {{firstName}} in your templates 
      //   }
        // verificationEmail: {
        //   subject: 'Confirm your account',
        //   pathPlainText: resolve(__dirname, 'path/to/templates/verification_email.txt'),
        //   pathHtml: resolve(__dirname, 'path/to/templates/verification_email.html'),
        //   callback: (user) => { return { firstName: user.get('firstName') }}
        //   // Now you can use {{firstName}} in your templates 
        // },
        // customEmailAlert: {
        //   subject: 'Urgent notification!',
        //   pathPlainText: resolve(__dirname, 'path/to/templates/custom_alert.txt'),
        //   pathHtml: resolve(__dirname, 'path/to/templates/custom_alert.html'),
        // }
      // }
    }
  }
});

// if(user.language == 'en'){
//   api.passwordResetSubject = 'אסייג'
// }


// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();



// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.get('/payment', function(req, res) {
  // res.sendFile(path.join(__dirname, '/public/payment.html'))
    Parse.User.enableUnsafeCurrentUser()
    console.log('token '+ req.query.sessionToken);
    Parse.User.become(req.query.sessionToken).then(function (user) {
      user.set("paid",true)
      user.save().then(
        function(object){
             console.log("success")
             res.sendFile(path.join(__dirname, '/public/payment.html')) },
        function(error){
             console.log("error "+error.message)
    } )
      
  // The current user is now set to user.
}, function (error) {
  console.log("error "+error.message) 
});

    
});





var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, '0.0.0.0',function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
