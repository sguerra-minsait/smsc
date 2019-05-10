console.log("Loading...");

require('./mod/check_env')();

const security = require('./mod/security');
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



var server = app.listen(port, () => {
	console.log('Server is listening on port ', port);
});
