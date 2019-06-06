function show_popup(c){
	var popup = $('#popup');
	if(!c.html){
		c.data = decodeURIComponent(c.data);
		popup.text(c.data);
	}else{
		popup.html(c.data);
	}

	if(c.class){
		popup.attr('class', c.class);
	}else{
		popup.attr('class', '');
	}

	popup.attr('data-hide_mouseup', c.hide_on_mouseout);
	popup.attr('data-hide_effect', c.effect);
	popup.css({display: 'block', left: 0, opacity: 0});
	movePopup();
	popup.attr('data-disable_movement', c.disable_movement);

	if(!c.effect){
		popup.css({opacity: 1});
	}else{
		popup.animate({opacity: 1});
	}
}
function hide_popup(){
	$('#popup').css('display', 'none');
}



(function(){
	var popup = $('#popup');
	popup.on('mouseleave', function(){
		if(popup.attr('data-hide_mouseup') == 'true'){
			if(0 && popup.attr('data-hide_effect') == 'true'){
				/*popup.animate({opacity: 0}, function(){
					popup.css({display: 'none'});
				}); */
			}else{
				popup.css({display: 'none'});
			}
		}
	});

	var year = new Date().getFullYear();
	var c = new CustomCalendar($('#maintain_date'), {
		years: {from: year, to: year + 50}
	});

	function set_height_preview(){
		return;
		var p = document.querySelector('#message_preview');
		p.style.height = 'auto';
		if(p.scrollHeight > 310)return p.style.height = '310px';
		if(p.scrollHeight < 50)return p.style.height = '50px';
		p.style.height = (p.scrollHeight) + 'px';
	}

	$('#expiration_date_checkbox').change(function(){
		if(!this.checked){
			$('#maintain_date_value, #maintain_hour').attr('disabled', 'disabled');
		}else{
			$('#maintain_date_value, #maintain_hour').removeAttr('disabled');
		}
	});



/*
	var message_preview = document.querySelector('#message_preview');
	message_preview.setAttribute('style', 'height:' + (message_preview.scrollHeight) + 'px;overflow-y:hidden;');
	$(message_preview).on('input change keyup cut', function () {
		set_height_preview();
	});
*/
	$('#message_help_button').mouseover(function(){
		show_popup({
			data: $('#custom_prop_doc').html(),
			html: true,
			hide_on_mouseout: true, 
			effect: true,
			disable_movement: true
		});
	}).mouseout(function(){
		
	});


	$('#message').on('change paste keyup cut',function(){
		var v = this.value;
		$('#message_rest_space').text(v.length + " caracteres de 160");
	});
	$('#sender').change(function(){
		$('#sender_preview').text(this.value);
	});


	$(document).ready(function(){
		var xMousePos = 0;
		var yMousePos = 0;
		var lastScrolledLeft = 0;
		var lastScrolledTop = 0;

		$(document).mousemove(function(event) {
			xMousePos = event.pageX;
			yMousePos = event.pageY;
			movePopup();
		})  

		$(window).scroll(function(event) {
			if(lastScrolledLeft != $(document).scrollLeft()){
				xMousePos -= lastScrolledLeft;
				lastScrolledLeft = $(document).scrollLeft();
				xMousePos += lastScrolledLeft;
			}
			if(lastScrolledTop != $(document).scrollTop()){
				yMousePos -= lastScrolledTop;
				lastScrolledTop = $(document).scrollTop();
				yMousePos += lastScrolledTop;
			}
			movePopup();
		});
		window.movePopup = function(){
			var popup = $('#popup');
			if(popup.attr('data-disable_movement') == 'true' && popup.css('opacity') != 0)return;
			var frame = {
				width: $(document).width(),
				height: $(document).height()
			}

			
			var width = parseInt(popup.css('width'));
			var height = parseInt(popup.css('height'));
			var left = xMousePos - width/2;
			var top = yMousePos - height - 10;

			if(xMousePos - lastScrolledLeft - width/2 <= 0){
				left = 0;
			}else if(xMousePos - lastScrolledLeft + width/2 + 2 >= frame.width){
				left = frame.width - width - 2;
			}

			popup.css({
				left: left,
				top: yMousePos - lastScrolledTop - height > 0 ? top : lastScrolledTop
			});
		}
	 
	});



	setInterval(change_time_preview, 60000);
	function change_time_preview(){
		var d = new Date();
		$('#time_preview').text(d.getHours() + ':' + d.getMinutes());
	}
	change_time_preview();
})();