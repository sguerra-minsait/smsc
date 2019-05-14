(function(){
	'use strict';
	var connection = new Postmonger.Session();
	var payload = {};
	var lastStepEnabled = false;
	var step = 1;
	var steps = [
		{ "label": "Template", "key": "template" },
		{ "label": "Devivery options", "key": "delivery" },
		{ "label": "Testing", "key": "testing" }
	];
	var heroku_url = 'https://pushintegration.herokuapp.com';
	var url_reg = /(https?\:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g;



	$(window).ready(onRender);

	connection.on('initActivity', initialize);

	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);
	connection.on('gotoStep', function(s){
		for(let i = 0;i<steps.length;i++){
			if(steps[i].key == s.key){
				step = i + 1;
				gotoStep(step);
			}
		}
	});

	function short_url(url){
		return new Promise((resolve, reject) => {
			$.ajax({
				type: 'POST',
				url: heroku_url + '/short',
				data: JSON.stringify({json_url: url}),
				dataType: 'json',
				contentType: 'application/json',
				success: function(r){
					if(r.error)return reject(r.error);
					resolve(r.url);
				}
			}).fail(function(err){
				console.log(err);
				reject(err);
			});
		});
	}

	function short_urls(input){
		var input = input || $('#message');
		$('#short_url_message').hide(500);
		
		var urls = $('#message').val().match(url_reg);
		if(!urls.length)return;
		var i = 0;


		function short(long_url){
			short_url(long_url).then(function(url){
				input.val(input.val().replace(long_url, url));
			}).catch(function(err){
				console.log(err);
				alert("An error ocurred!");
			});
			i++;
			if(i < urls.length)short(urls[i]);
		}
		short(urls[i]);
	}


	function onRender() {
		$('#message').change(function(){
			var urls = this.value.match(url_reg);
			if(urls != null){
				$('#short_url_message').show(500);
			}else{
				$('#short_url_message').hide(500);
			}
		});

		$('#shorter_urls_in_message').click(function(){
			short_urls();
		});


		$('#short_url_button').click(function(){
			var url;
			do{
				url = prompt("Type your URL: ");
				if(!url)return;
			}while(!url.match(url_reg));
			short_url(url).then(function(url){
				var input = $('#message');
				if(input.val().length + url.length > input.attr('maxlength')){
					return alert("There is no no space in your message! Maximum size is 160 characters.");
				}
				input.val(input.val() + url);
			}).catch(function(err){
				alert("An error ocurred!");
			})
		});

		connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
		connection.trigger('updateButton', { button: 'next', enabled: true});
	}

	function gotoStep(step) {
		$('.step').hide();
		switch(step) {
			case 1:
				$('#template').show();
				break;
			case 2:
				$('#delivery').show();
				break;
			case 3:
				$('#testing').show();
				break;
			case 4:
				save();
				break;
		}
	};



	function initialize (data) {
		payload = data;
		console.log('initialize', payload);

		var title, message, icon, onclick = false;
		var hasInArguments = Boolean(
			payload['arguments'] &&
			payload['arguments'].execute &&
			payload['arguments'].execute.inArguments &&
			payload['arguments'].execute.inArguments.length > 0
		);

		var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

		for(var name in inArguments){
			$('#' + name).val(inArguments[name]);
		}
	}
	function validate_step(step){
		var errors = [];
		switch(step){
			case 1:
				if($('#message').val().length < 1)errors.push('fill your message');
				//if($('#footer').val().length < 1)errors.push('fill your footer');
			break;
			case 2:
				var date = new Date($('#maintain_date_value').val());
				var now = new Date();
				now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				if(date.getTime() < now.getTime())errors.push('The date is prior to the current');
				if($('#type').val().length < 1)errors.push('select your type');
				if($('#sender').val().length < 1)errors.push('select your sender');				
			break;
		}
		return errors;
	}

	function onClickedNext () {
		$('#error_box').html('');
		var errors = validate_step(step)
		if(errors.length){
			var r = '<ul class="errors">';
			for(let i = 0;i<errors.length;i++){
				r += '<li>Please, ' + errors[i] + ' !</li>'
			}
			r += '</ul>';
			$('#error_box').html(r);
			return connection.trigger('ready');
		}
		step++;
		gotoStep(step);
		connection.trigger('nextStep');
	}

	function onClickedBack () {
		$('#error_box').html('');
		step--;
		gotoStep(step);
		connection.trigger('prevStep');
		connection.trigger('ready');
	}


	function save() {
		var data = $('#form').serializeArray();
		payload['arguments'].execute.inArguments = [];
		for(var i = 0;i<data.length;i++){
			payload['arguments'].execute.inArguments[data[i].name] = data[i];
		}

		payload['metaData'].isConfigured = true;
		connection.trigger('updateActivity', payload);
	}

})();