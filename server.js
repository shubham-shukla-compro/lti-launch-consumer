const express = require('express');
const bodyParser = require('body-parser');
const oauthSignature = require('oauth-sign');
const axios = require('axios');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/lti-launch', (req, res) => {
    // LTI parameters
    const ltiParams = {
        oauth_consumer_key: '400646F33F483B515F3000A03FD029DA',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        oauth_nonce: generateNonce(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        user_id: '12345',
        roles: 'student',
        context_id: '683684'
        // ... any other LTI parameters you need
    };

    // Create the OAuth signature
    const signature = oauthSignature.hmacsign(
        'POST',
        'https://cloud.santillanawicco.com/wiccoblti',
        ltiParams,
        '23943683e54814c58303f7d09ba41c7b'
    );

    // Add the signature to your parameters
    ltiParams.oauth_signature = signature;

    // Ideally, you'd redirect the user with a POST form submission to the Tool Provider's launch URL. 
    // You can serve a page with a hidden form containing the LTI parameters and auto-submit it using JavaScript.

    let formInputs = Object.keys(ltiParams).map(key => `<input type="hidden" name="${key}" value="${ltiParams[key]}">`).join('\n');

    res.send(`
        <html>
            <body onload="document.forms[0].submit();">
                <form action="https://cloud.santillanawicco.com/wiccoblti?WCSID=683684" method="post">
                    ${formInputs}
                    <input type="submit" value="Launch LTI Tool">
                </form>
            </body>
        </html>
    `);
});

function generateNonce(length = 16) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// const httpsOptions = {
//   key: fs.readFileSync('./private-key.pem'),
//   cert: fs.readFileSync('./certificate.pem'),
//   passphrase: 'testphrase'
// };

// https.createServer(httpsOptions, app).listen(8000, () => {
//   console.log('Server running on https://localhost:8000');
// });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
