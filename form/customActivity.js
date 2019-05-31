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
	//var url_reg = /(https?\:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g;
	var url_reg = /((https?\:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g;
	var custom_param_reg = /\%\%([a-zA-Z_]+) *\(((?: *"[a-zA-Z0-9_,' ]+", *)*(?:"[a-zA-Z0-9_,' ]+" *))\)\%\%/g;

	var document_ready = false;
	var eventDefinitionKey;
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

	connection.on('requestedTriggerEventDefinition', function(event){
		console.log(event);
		eventDefinitionKey = event.eventDefinitionKey;
	});

	function short_url(url){
		return new Promise((resolve, reject) => {
			$.ajax({
				type: 'POST',
				url: heroku_url + '/short',
				data: JSON.stringify({long_url: url}),
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
		$('#short_url_message').hide();
		
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
		$.get('/data.json', function(data){
			var type = $('#type');
			var sender = $('#sender');
			var footer = $('#footer');
			for(let i =0;i<data.type.length;i++){
				var t = data.type[i];
				type.append($('<option value="' + t + '">' + t + "</option>"));
			}
			for(let i =0;i<data.sender.length;i++){
				var t = data.sender[i];
				sender.append($('<option value="' + t + '">' + t + "</option>"));
			}
			for(let i =0;i<data.footer.length;i++){
				var t = data.footer[i];
				footer.append($('<option value="' + t + '">' + t + "</option>"));
			}
			document_ready = true;
		});


		$('#test_message_button').click(function(){
			$('#message_test_success').hide();
			$('#message_test_error').hide();

			var number = $('#test_number').val();
			if(number.length != 9)return show_error('test_number','Invalid number');
			hide_errors();
			$(this).attr('disabled', 'disabled');
			$.ajax({
				type: 'POST',
				url: heroku_url + '/send_message',
				data: JSON.stringify({
					to: '34' + number,
					message: $('#message').val()
				}),
				dataType: 'json',
				contentType: 'application/json',
				success: function(r){
					console.log(r);
					if(!r.success){
						$('#test_message_button').removeAttr('disabled');
						$('#message_test_error').css('display', 'inline-flex');
					}
					$('#message_test_success').css('display', 'inline-flex');
				}
			}).fail(function(err){
				$('#test_message_button').removeAttr('disabled');
				console.error(err);
				$('#message_test_error').css('display', 'inline-flex');
			})
		});

		$('#short_url').on('keyup', function(){
			if(this.value.match(url_reg))invalid_url(0, true);
			
		});
		$('#short_url').on('blur', function(){
			if(this.value.match(url_reg) && !this.value.match(/https?:\/\//))
				this.value = 'https://' + this.value;
		});

/*
		$('#message').on('keyup', function(){
			var urls = this.value.match(url_reg);
			if(urls != null){
				$('#short_url_message').show();
			}else{
				$('#short_url_message').hide();
			}
		});

		$('#shorter_urls_in_message').click(function(){
			short_urls();
		});
*/
		function invalid_url(msg, hide){
			var div = $('#invalid_url');
			if(msg)div.text(msg);
			if(hide){
				div.parent().parent().removeClass('slds-has-error');
				div.hide();
			}else{
				div.parent().parent().addClass('slds-has-error');
				div.show();
			}
		}


		$('#short_url_button').click(function(){
			var url = $('#short_url').val();
			if(!url.match(url_reg)){
				return invalid_url("Enlace invalido");
			}
			short_url(url).then(function(url){
				var input = $('#message');
				if(input.val().length + url.length > input.attr('maxlength')){
					return invalid_url("There is no no space in your message! Maximum size is 160 characters.");
				}
				input.val(input.val() + url);
				$('#short_url').val('');
			}).catch(function(err){
				invalid_url("An error ocurred!");
			});
		});

		connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
		connection.trigger('updateButton', { button: 'next', enabled: true});
		connection.trigger('requestTriggerEventDefinition');
	}

	function preview_data_div(){
		var container = `
			<div class="preview_data_div">

			</div>
		`;
	}

	function message_preview(){
		var message = $('#message').val();
		var footer = $('#footer').val();
		var container = $('#message_preview');

		container.html('');
		custom_param_reg.lastIndex = 0;
		var lastIndex, index;


		function create_font(d){
			return $(`<font>${d}</font>`);
		}
		function create_div(full, prop, css_class_popup, css_class){
			full = full.substring(2, full.length - 2);
			return $(`
				<div class="de_custom_prop ${css_class || ''}" onmouseover="show_popup({data:'${encodeURIComponent(full)}', class:'${css_class_popup}'})" onmouseout="hide_popup()">
					<div class="de_custom_prop_data">${prop}</div>
				</div>`);
		}


		do{
			lastIndex = custom_param_reg.lastIndex;
			var match = custom_param_reg.exec(message);
			index = match ? match.index : message.length;

			container.append(create_font(message.substring(lastIndex, index)));
			
			if(!match || match[1] != 'get')continue;
			var args = make_args(match[2]);
			
			if(args.length == 1){
				container.append(create_div(match[0], args[0], 'de_custom_prop_popup'));
			}else if(args.length == 4){
				container.append(create_div(match[0], args[1], 'de_custom_prop_comp_popup', 'de_custom_prop_comp'));
			}else{
				container.append(create_div(match[0], 'Invalid number of arguments', '', 'de_custom_prop_error'));
			}
		}while(match != null);
		container.append(create_font(footer));
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
				message_preview();
				break;
			case 4:
				save();
				break;
		}
	};


	function initialize (data) {
		payload = data;
		console.log('initialize', payload);
		var tmp_int = setInterval(function(){
			if(!document_ready)return;
			try{
				var inArguments = payload.configurationArguments.save.inArguments[0];
				for(var name in inArguments){
					$('[name="' + name + '"]').val(inArguments[name]);
				}
			}catch(err){}
			clearInterval(tmp_int);
		}, 100);
	}
	function validate_step(step){
		var errors = [];
		switch(step){
			case 1:
				if($('#message').val().length < 1)
					errors.push({id: 'message', error: 'Please, fill your message!'});
				//if($('#footer').val().length < 1)errors.push('fill your footer');
			break;
			case 2:
				var date = new Date($('#maintain_date_value').val());
				var now = new Date();
				now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				if(date.getTime() < now.getTime())
					errors.push({id: 'maintain_date_value', error: 'The date is prior to the current'});
				if($('#type').val().length < 1)
					errors.push({id: 'type', error: 'Please, select your type!'});
				if($('#sender').val().length < 1)
					errors.push({id: 'sender', error: 'Please, select your sender!'});				
			break;
		}
		return errors;
	}
	function show_error(id, msg){
		var parent = $('#' + id).closest('.slds-form-element');
		parent.find('.slds-text-color_error').text(msg).show();
		parent.addClass('slds-has-error');
	}
	function hide_errors(){
		var error_messages = $('.slds-has-error');
		error_messages.find('.slds-text-color_error').hide();
		error_messages.removeClass('slds-has-error');
	}


	function onClickedNext () {
		hide_errors();
		
		var errors = validate_step(step)
		if(errors.length){
			for(let i = 0;i<errors.length;i++){
				show_error(errors[i].id, errors[i].error);
			}
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
	function make_args(d){
		var arg = d.split('",');
		for(let i = 0;i < arg.length;i++){
			arg[i] = arg[i].trim();
			arg[i] = (i != arg.length - 1 ? arg[i].slice(1) : arg[i].slice(1, arg[i].length - 1));
		}
		return arg;
	}
	function lookup_custom_functions(data){
		var match, f;
		match = custom_param_reg.exec(data);
		
		while(match != null){
			var args = make_args(match[2]);
			if(match[1] == 'get'){
				if(args.length == 1){
					f = sf_attr(args[0]);
				}else if(args.length == 4){
					f = `%%${match[1]}("${args[0]}","${args[1]}","${args[2]}","${sf_attr(args[3])}")%%`;
				}else{
					f = match[0];
				}
				data = data.replace(match[0], f);
			}
			match = custom_param_reg.exec(data);
		}
		return data;
	}

	function sf_attr(attr){
		return `{{Event.${eventDefinitionKey}.${attr}}}`;
	}


	function save() {
		var data = $('#form').serializeArray();
		console.log(data);
		payload['arguments'].execute.inArguments = [{}];
		payload.configurationArguments.save.inArguments = [{}];
		for(var i = 0;i<data.length;i++){
			payload.configurationArguments.save.inArguments[0][data[i].name] = data[i].value;
			data[i].value = lookup_custom_functions(data[i].value);
			payload['arguments'].execute.inArguments[0][data[i].name] = data[i].value;
		}

		payload['arguments'].execute.inArguments[0]['PRUEBA'] = '{{Event.' + eventDefinitionKey + '.sent}}';

		console.log(payload);

		payload['metaData'].isConfigured = true;
		connection.trigger('updateActivity', payload);
	}
})();
