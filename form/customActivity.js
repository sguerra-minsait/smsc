(function(){
	'use strict';
	var connection = new Postmonger.Session();
	var payload = {};
	var lastStepEnabled = false;
	var step = 1;
	var heroku_url = "https://webpushnodejstest.herokuapp.com";


	$(window).ready(onRender);

	connection.on('initActivity', initialize);

	connection.on('clickedNext', onClickedNext);
	connection.on('clickedBack', onClickedBack);

	connection.on('clickedNext', function() {
		step++;
		gotoStep(step);
		connection.trigger('ready');
	});

	connection.on('clickedBack', function() {
		step--;
		gotoStep(step);
		connection.trigger('ready');
	});


	function onRender() {
		connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
	}

	function gotoStep(step) {
		$('.step').hide();
		switch(step) {
			case 1:
				$('#template').show();
				connection.trigger('updateButton', { button: 'next', text: 'next', enabled:true });
				connection.trigger('updateButton', { button: 'back', visible: false });
				break;
			case 2:
				$('#delivery').show();
				connection.trigger('updateButton', { button: 'back', visible: true });
				connection.trigger('updateButton', { button: 'next', text: 'next', visible: true });
				break;
			case 3:
				$('#testing').show();
				connection.trigger('updateButton', { button: 'back', visible: true });
				connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
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

       connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
	}

	function onClickedNext () {
		step++;
		gotoStep(step);
		connection.trigger('ready');
	}

	function onClickedBack () {
		step--;
		gotoStep(step);
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




