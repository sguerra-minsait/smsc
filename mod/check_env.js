module.exports = function(){
	var missing = false;
	[
		'SH256_KEY'
	].forEach(d => {
		if(!process.env[d]){
			missing = true;
			console.error(d + ' environment variable is missing');
		}
	});
	if(missing)process.exit(1);
}