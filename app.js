console.log("Loading...");

//require('./mod/check_env')();

const security = require('./mod/security');
const post = require('./mod/post_request');
var port = process.env.PORT || 3000;

var app = require('./mod/server');

app.post(/(publish|validate|save)/, security.check_token, (req, res) => {
	res.status(200).end();
});

app.post('/execute', security.check_token, (req,res) => {
	console.log('EXECTURE BODY: ', req.rawBody, req.body);
	var datos = req.body.inArguments[0];
	console.log(datos);
});


app.post('/short', (req, res) => {
	var long_url = req.body.long_url;
	console.log(long_url);
	post({
		url: 'https://api-ssl.bitly.com/v4/shorten',
		body: {long_url: long_url},
		headers: {
			'Authorization': 'Bearer ' + process.env.bearer_bityl,
			'Content-Type': 'application/json'
		}
	}).then((body, response) => {
		var data = JSON.parse(body);
		console.log(data);
		if(data.link.indexOf('http'))
		res.end(JSON.stringify({url: data.link}));
	}).catch(err => {
		console.log(err);
		res.end(JSON.stringify({error: err.message}));
	});
});

app.post('/send_message', (req, res) => {
	var data = req.body;
	post({
		url: 'https://rest.nexmo.com/sms/json',
		body: {
			api_key: process.env.nexmo_api_key,
			api_secret: process.env.nexmo_secret,
			to: data.to,
			from: 'Minsait',
			text: data.message
		},
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((body, response) => {
/*{
    "message-count": "1",
    "messages": [{
        "to": "34672054149",
        "message-id": "140000002AE2CFB3",
        "status": "0",
        "remaining-balance": "1.03220000",
        "message-price": "0.06890000",
        "network": "21401"
    }]
}*/

		console.log(body);
		console.log(response);
		res.end(JSON.stringify({success: true}));
	}).catch(err => {
		console.log(err);
		res.end(JSON.stringify({error: err.message}));
	})
});



var server = app.listen(port, () => {
	console.log('Server is listening on port ', port);
});
