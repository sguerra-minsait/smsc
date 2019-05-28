var wsdlParser = require("wsdlrdr");
var soap = require('post_request');

function sf_get(data, matches, arg){
	console.log('sf_get', data, matches, arg);
	var body = soap.data.get_value
	.replace("{{USERNAME}}", process.env.username)
	.replace("{{PASSWORD}}", process.env.password)
	.replace("{{DATA_EXTENSION_NAME}}", arg[0]);
	.replace("{{PROPERTY}}", arg[1]);
	.replace("{{KEY}}", arg[2]);
	.replace("{{FILTER_VALUE}}", arg[3]);
	return new Promise((resolve, reject) => {
		soap.post_request(body).then(xml => {
			var data = wsdlParser.getXmlDataAsJson(xml);
			console.log('SOAP result', data);
			var property  = data.RetrieveResponseMsg.Results.Properties.Property[0][arg[2]];
			data = data.replace(matches[0], property.Value);
			resolve(data);
		}).reject(err => {
			reject(err);
		})
	})
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
	var matches = Array.from(data.matchAll(reg));
	var i = 0;

	console.log('exports', matches);
	function eject_f(){
		var f_name = matches[i][1];
		var arg = make_args(matches[i][2]);
		var f;
		console.log('eject_f', f_name, arg);
		switch(f_name){
			case 'get': f = sf_get; break;
		}
		f(data, matches, arg).then(new_data => {
			data = new_data;
			i++;
			if(i == matches.length)return new Promise.resolve(data);
			eject_f();
		}).catch(err => {
			return Promise.reject(err, i, matches.length);
		});
	}

}



// propiedad1, nombre_data2, propiedad2