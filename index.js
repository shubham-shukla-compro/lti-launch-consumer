const oauthSignature = require('oauth-signature');
const axios = require('axios');

// LTI parameters
const ltiParams = {
    oauth_consumer_key: '400646F33F483B515F3000A03FD029DA',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
    oauth_nonce: generateNonce(),
    oauth_timestamp: Math.floor(Date.now() / 1000),
    user_id: '12345',  // replace with your user ID
    roles: 'student',  // or 'instructor', etc.
    // ... any other LTI parameters you need
};

// Create the OAuth signature
const signature = oauthSignature.generate(
    'POST',
    'https://cloud.santillanawicco.com/wiccoblti?WCSID=683684',  // replace with your Tool Provider's launch URL
    ltiParams,
    '23943683e54814c58303f7d09ba41c7b'
);

// Add the signature to your parameters
ltiParams.oauth_signature = signature;

// Post the launch data to the Tool Provider
axios.post('https://cloud.santillanawicco.com/wiccoblti?WCSID=683684', ltiParams)
    .then(response => {
        // Handle success - e.g., redirect the user or handle the Tool Provider's response
        console.log('response', response);
    })
    .catch(error => {
        // Handle error
        console.error('Error launching the LTI course:', error);
    });

// Utility function to generate a nonce for OAuth
function generateNonce(length = 16) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
