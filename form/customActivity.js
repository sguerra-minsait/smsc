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

	$(window).ready(onRender);

	connection.on('initActivity', initialize);

	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);
	connection.on('gotoStep', function(step){
		for(let i = 0;i<steps.length;i++){
			if(steps[i].key == step.key)return gotoStep(i + 1);
		}
	});



	function onRender() {
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
				if(date.getTime() < new Date().getTime())errors.push('fix your date ');
				if($('#footer').val().length > 2)errors.push('fill your footer');
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
		for(var i = 0;i<data.length;i++){
			payload['arguments'].execute.inArguments[0][data[i].name] = data[i];
		}

		payload['metaData'].isConfigured = true;
		connection.trigger('updateActivity', payload);
	}

})();