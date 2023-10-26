const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('dashboard');
});

app.post('/lti-launch', (req, res) => {
  // LTI parameters
  console.log(req);
  const courseId = req.body.courseId;
  const courseType = req.body.courseType;
  const ltiLaunchKeys = {
    primary: {
      consumerKey: '4568204687872205EFD11EFAC03DB57A',
      consumerSecret: 'e935f066714fb13d4db4b2e37c734c5c',
    },
    secondary: {
      consumerKey: '4EE47635D9AF0BCA33B58B9948AC0369',
      consumerSecret: '8b9d37896a6e407c9e71eda5870fd750',
    },
  };
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  console.log('running');
  const ltiParams = {
    context_id: 'S3294476',
    lti_message_type: 'basic-lti-launch-request',
    lti_version: 'LTI-1p0',
    oauth_callback: 'about:blank',
    oauth_consumer_key: ltiLaunchKeys[courseType].consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
    resource_link_id: '429785226',
    roles: 'urn:lti:role:ims/lis/Instructor',
    user_id: '29123',
    WCSID: courseId,
  };

  // Create the OAuth signature
  const signature = generateOauthSignature(
    'POST',
    'https://cloud.santillanawicco.com/wiccoblti',
    ltiParams,
    ltiLaunchKeys[courseType].consumerSecret
  );

  // Add the signature to your parameters
  ltiParams.oauth_signature = signature;

  let formInputs = Object.keys(ltiParams)
    .map(
      (key) => `<input type="hidden" name="${key}" value="${ltiParams[key]}">`
    )
    .join('\n');

  console.log(ltiParams);
  res.send(`
        <html>
            <body onload="document.forms[0].submit();">
                <form action="https://cloud.santillanawicco.com/wiccoblti?WCSID=${courseId}"  method="POST">
                    ${formInputs}
                    <input type="submit" value="Launch LTI Tool" style="visibility:hidden">
                </form>
            </body>
        </html>
    `);
});

function generateNonce(length = 32) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateOauthSignature(method, baseUrl, params, consumerSecret) {
  // Sort and encode parameters
  let sortedParams = Object.keys(params)
    .sort()
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    })
    .join('&');

  // Create the base string
  let baseString = `${method.toUpperCase()}&${encodeURIComponent(
    baseUrl
  )}&${encodeURIComponent(sortedParams)}`;
  console.log(baseString);
  // Create the signing key
  let signingKey = `${encodeURIComponent(consumerSecret)}&`;

  // Sign the base string using HMAC-SHA1
  let signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  return signature;
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
