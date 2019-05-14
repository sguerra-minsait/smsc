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
			'Authorization': 'Bearer f2fe6fde72541aee06d8c4093487c941b24fa87b',
			'Content-Type': 'application/json'
		}
	}).then((body, response) => {
		var data = JSON.parse(body);
		res.end(JSON.stringify({link: data.link}));
	}).catch(err => {
		console.log(err);
		res.end(JSON.stringify({error: err.message}));
	});
});




var server = app.listen(port, () => {
	console.log('Server is listening on port ', port);
});
