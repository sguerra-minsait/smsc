module.exports = function(){
	var missing = false;
	[
		'SH256_KEY',
		'username',
		'password',
		'server_domain'
	].forEach(d => {
		if(!process.env[d]){
			missing = true;
			console.error(d + ' environment variable is missing');
		}
	});
	if(missing)process.exit(1);
}