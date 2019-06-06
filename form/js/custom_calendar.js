class CustomCalendar{
	constructor(date, c){
		this.months_names =  ['January','February','March','April','May','June','July','August','September','October','November','December'];
		this.container = date;
		this.actual_date = new Date(c.year || new Date().getFullYear(), c.month || new Date().getMonth(), c.day || new Date().getDate());
		this.divs = {
			year: date.find('.custom_year_select'),
			month_name: date.find('.custom_month'),
			days: date.find('.custom_days_body'),
			next_month: date.find('.custom_next_month'),
			prev_month: date.find('.custom_prev_month'),
			go_today: date.find('.custom_go_today'),
			input_container: date.find('.custom_calendar_input_container'),
			trigger_div: date.find('.slds-dropdown-trigger'),
			hour_select: date.find('.select_time_picker')
		}
		var self = this;

		this.divs.next_month.click(this.next_month.bind(this));
		this.divs.prev_month.click(this.prev_month.bind(this));
		this.divs.go_today.click(this.go_today.bind(this));
		this.divs.input_container.click(this.toggle.bind(this));

		this.divs.year.change(function(){
			self.set_year(this.value);
		});

		for(var i = c.years.from; i <= c.years.to; i++){
			this.divs.year.append($(`<option value="${i}">${i}</option>`));
		}

		this.total_days = c.today_days || 7 * 6;
		this.update_input();
		this.update_calendar();

	}
	update_calendar(month, year){
		month = month || this.actual_date.getMonth() + 1;
		year = year || this.actual_date.getFullYear();


		var options = this.divs.hour_select.find('option');
		if(!this.equal_date(this.actual_date, new Date()) && options.length  != 24){
			this.divs.hour_select.html('');
			for(let i = 1;i<=12;i++){
				this.divs.hour_select.append($(`<option value="${i}">${i} AM</option>`));
			}
			for(let i = 1;i<=12;i++){
				this.divs.hour_select.append($(`<option value="${i+12}">${i} PM</option>`));
			}
		}else if(this.equal_date(this.actual_date, new Date())){
			this.divs.hour_select.html('');
			for(let i = new Date().getHours() + 1;i <= 24;i++){
				this.divs.hour_select.append($(`<option value="${i}">${(i <= 12 ? i + ' AM' : (i-12) + ' PM')}</option>`));
			}
		}


		this.divs.year.val(year);
		this.n_days = 0;
		this.actual_tr = $('<tr>');
		this.divs.days.html('');
		this.divs.month_name.text(this.months_names[month - 1]);
		
		var date = new Date(year, month - 1);
		var month_before = new Date(year, month - 1, 0);
		var month_next = new Date(year, month + 1);
		var last_day = new Date(year, month, 0);
		var today = new Date();
		today = (today.getFullYear() == year && today.getMonth() + 1 == month) ? today.getDate() : -1;


		for(let i = month_before.getDate() - date.getDay() + 2; i <= month_before.getDate(); i++){
			this.create_day(i, {disabled: true, selected: 
				new Date(month_before.getFullYear(), month_before.getMonth(), i).getTime() == this.actual_date.getTime()
			});
		}

		for(let i = 1; i <= new Date(year, month, 0).getDate();i++){
			this.create_day(i, {today: today == i, selected:
				new Date(year, month - 1, i).getTime() == this.actual_date.getTime()
			});
		}

		for(let i = 1;i <= this.total_days - this.n_days;i++){
			this.create_day(i, {disabled: true, selected:
				new Date(month_next.getFullYear(), month_next.getMonth(), i).getTime() == this.actual_date.getTime()
			});
		}

	}
	equal_date(d1,d2){
		return d1.getFullYear() == d2.getFullYear() &&
			d1.getMonth() == d2.getMonth() &&
			d1.getDate() == d2.getDate();
	}
	create_day(n, c){
		var self = this;
		this.n_days++;
		var td =  $(`<td role="gridcell" class="${c.today ? 'slds-is-today' : ''}`
			+ (c.disabled ? ' slds-disabled-text' : '')
			+ (c.selected ? ' slds-is-selected' : '')
			+ `"><span class="slds-day">${n}</span></td>`);
		td.click(function(){
			self.day_selected.bind(self)($(this).find('span').text());
		});

		this.actual_tr.append(td);

		if(!(this.n_days % 7)){
			this.divs.days.append(this.actual_tr);
			this.actual_tr = $('<tr>');
		}
	}
	next_month(){
		this.actual_date.setMonth(this.actual_date.getMonth() + 1);
		this.update_input();
		this.update_calendar();
	}
	prev_month(){
		this.actual_date.setMonth(this.actual_date.getMonth() - 1);
		this.update_input();
		this.update_calendar();
	}
	set_year(year){
		this.actual_date.setFullYear(year);
		this.update_input();
		this.update_calendar();
	}
	day_selected(day){
		this.actual_date.setDate(day);
		this.update_input();
		this.hide();
	}
	update_input(){
		var v = 
		('0' + (this.actual_date.getMonth() + 1)).slice(-2) + '/' + 
		('0' + this.actual_date.getDate()).slice(-2) + '/' +
		this.actual_date.getFullYear();
		
		this.divs.input_container.find('input').val(v);
	}
	show(){
		this.update_calendar();
		this.divs.trigger_div.addClass('slds-is-open');
	}
	hide(){
		this.divs.trigger_div.removeClass('slds-is-open');
	}
	toggle(){
		if(this.divs.input_container.find('input').attr('disabled'))return;
		this.update_calendar();
		this.divs.trigger_div.toggleClass('slds-is-open');
	}
	update_actual_date(){
		this.actual_date = new Date(this.divs.input_container.find('input').val());
		this.actual_date.setMonth(this.actual_date.getMonth() - 1);	
	}
	go_today(){
		this.actual_date = new Date();
		this.update_calendar();
	}
};