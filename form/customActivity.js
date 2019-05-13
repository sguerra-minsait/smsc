(function(){
	'use strict';
	var connection = new Postmonger.Session();
	var payload = {};
	var lastStepEnabled = false;
	var step = 1;


	$(window).ready(onRender);

	connection.on('initActivity', initialize);

	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);


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



	function initialize (payload) {
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
				if($('#message').val().length > 2)errors.push('fill your message');
				if($('#footer').val().length > 2)errors('fill your footer');
			break;
			case 2:
				var date = new Date($('#maintain_date_value').val());
				date.setMonth(date.getMonth() - 1);
				if(date.getTime() < new Date().getTime())errors.push('Invalid date');
				if($('#footer').val().length > 2)errors('fill your footer');
			break;
		}
	}

	function onClickedNext () {
		var errors = validate_step(step)
		if(errors.length){
			var r = '<ul class="errors">';
			for(let i = 0;i<errors.length;i++){
				r += '<li>' + errors[i] + '</li>'
			}
			r += '</ul>';
			return $('#error_box').html(r);
		}
		step++;
		gotoStep(step);
		connection.trigger('nextStep');
		connection.trigger('ready');
	}

	function onClickedBack () {
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