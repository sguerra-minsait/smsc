var wsdlParser = require("wsdlrdr");
var soap = require('./soap');

function sf_get(data, matches, arg){
	console.log('sf_get', data, matches, arg);
	var body = soap.data.get_value
	.replace("{{USERNAME}}", process.env.username)
	.replace("{{PASSWORD}}", process.env.password)
	.replace("{{DATA_EXTENSION_NAME}}", arg[0])
	.replace("{{PROPERTY}}", arg[1])
	.replace("{{KEY}}", arg[2])
	.replace("{{FILTER_VALUE}}", arg[3]);
	return new Promise((resolve, reject) => {
		soap.post_request(body).then(xml => {
			var response = wsdlParser.getXmlDataAsJson(xml).RetrieveResponseMsg;
			console.log('SOAP result', response);
			
			if(response.OverallStatus != 'OK')return reject(response.OverallStatus);
			console.log(response.Results.Properties.Property);

			var property  = response.Results.Properties.Property;
			console.log('REPLACE ', matches[0], property.Value)
			data = data.replace(matches[0], property.Value);
			resolve(data);
		}).catch(err => {
			reject(err);
		})
	});
}

function make_args(d){
	var arg = d.split('",');
	for(let i = 0;i < arg.length;i++){
		arg[i] = arg[i].trim();
		arg[i] = (i != arg.length - 1 ? arg[i].slice(1) : arg[i].slice(1, arg[i].length - 1));
	}
	return arg;
}



module.exports = function(data){
	var reg = /\%\%([a-zA-Z_]+) *\(((?: *"[a-zA-Z0-9_,' ]+", *)*(?:"[a-zA-Z0-9_,' ]+" *))\)\%\%/g;
	var matches = [];
	var match;
	while((match = reg.exec(data)) != null)matches.push(match);
	var i = 0;

	console.log('PARSE_DATA ', matches);

	function eject_f(){
		var f_name = matches[i][1];
		var arg = make_args(matches[i][2]);
		var f;
		console.log('eject_f', f_name, arg);
		switch(f_name){
			case 'get': f = sf_get; break;
		}
		return f(data, matches[i], arg).then(new_data => {
			console.log('NEW DATA ', new_data)
			data = new_data;
			i++;
			if(i == matches.length)return Promise.resolve(data);
			return eject_f();
		}).catch(err => {
			return Promise.reject(err, i, matches.length);
		});
	}
	if(matches.length)return eject_f();
	return Promise.resolve(data);
}



// propiedad1, nombre_data2, propiedad2