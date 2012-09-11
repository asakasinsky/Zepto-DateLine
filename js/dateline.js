(function($) {
    var defaultOptions = {
        swipeDaysCount: 5,
        label: {
            days: 'пн|вт|ср|чт|пт|сб|вс',
            months: 'январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь',
            shortMonths: 'янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек'
        }
    };

    var calendarGenerator = (function() {
        var now = new Date(),
            today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            now_time = +now,
            today_time = +today,
            one_day = 86400000; // 1000*60*60*24

        return {
            generateTable: function(start, s, options) {
                options = $.extend({}, defaultOptions, options || {});

                var dayLabels = options.label.days.split('|'),
                    monthLabels = options.label.months.split('|'),
                    month = start.getMonth(),
                    year = start.getFullYear(),
                    starting_day = start.getDay() ? (start.getDay() - 1) : 6, // Hacking this to make Monday the first day
                    month_length = this.getDaysNum(year, month),
                    month_name = monthLabels[month];

                var html = '<table class="calendar-table'
                    + (s.classes ? (' ' + s.classes) : '')
                    + '" cellspacing="0" cellpadding="0" data-month="'
                    + (month + 1)
                    + '" data-year="'
                    + year
                    + '">';

                if (s.daylabels) {
                    html += '<thead><tr><th colspan="4">'
                    + month_name + '<\/th><th class="calendar-year-label" colspan="3">' + year
                    + '<\/th><\/tr><tr>';
                
                    for(var i = 0; i <= 6; i++ ){
                        html += '<td class="calendar-day-label' + ((i > 4) ? ' calendar-weekend' : '') + '">'
                        + dayLabels[i]
                        + '<\/td>';
                    }
                    html += '<\/tr><\/thead><tbody><tr>';
                }
                else {
                    html += '<tbody><tr>';
                }

                var day = start.getDate(),
                    len = Math.ceil((month_length + starting_day) / 7),
                    date_time = +start;

                for (var i = 0; i < len; i++) {
                    // this loop is for weekdays (cells)
                    for (var j = 0; j <= 6; j++) { 
                        var valid = (day <= month_length && (i > 0 || j >= starting_day));

                        html += '<td class="calendar-day'
                        + ((today_time === date_time) ? ' today' : '')
                        + ((today_time > date_time) ? ' past' : '') + '"'

                        + (valid ? ('data-date="'
                        + year
                        + '-'
                        + ('0' + (month + 1)).slice(-2)
                        + '-'
                        + ('0' + day).slice(-2) + '"') : '')

                        + '><span>';

                        if (valid) {
                            html += day;
                            day++;
                        }
                        else {
                            html += '&nbsp;';
                        }
                        html += '<\/span><\/td>';
                        
                        date_time += one_day;
                    }
                    // stop making rows if we've run out of days
                    if (day > month_length) {
                        break;
                    } else {
                        html += '<\/tr><tr>';
                    }
                }
                html += '<\/tr><\/tbody><\/table>';

                return html;
            },
            generateList: function(start, s, options) {
                console.log(options);

                options = $.extend({}, defaultOptions, options || {});

                var dayLabels = options.label.days.split('|'),
                    monthLabels = options.label.months.split('|'),
                    month = start.getMonth(),
                    year = start.getFullYear(),
                    month_length = this.getDaysNum(year, month);

                var html = '';

                // fill in the days
                var day = start.getDate(),
                    date_day = start.getDay(),
                    date_time = +start;

                for (; day <= month_length; day++) {
                    var firstweek = (day <= 7);

                    html += '<li class="calendar-day'
                    + (firstweek && !s.first_month ? ' firstweek' : '')
                    + ((day === 1 && s.first_month) ? ' firstday' : '')
                    + ((s.monthlabels && !s.mlabels_firstday && (date_day === 0) && firstweek) ? ' monthlabel' : '')
                    + ((s.monthlabels && s.mlabels_firstday && (day === 1)) ? ' monthlabel' : '')
                    + ((date_day === 1) ? ' monday' : '')
                    + ((date_day === 0 || date_day === 6) ? ' weekend' : '')
                    + ((today_time === date_time) ? ' today' : '')
                    + ((today_time > date_time) ? ' past' : '') + '"'
                    
                    + ((day === 1) ? (' data-started="'
                    + year
                    + '-'
                    + ('0' + (month + 1)).slice(-2) + '"') : '')
                    
                    + ' data-date="'
                    + year
                    + '-'
                    + ('0' + (month + 1)).slice(-2)
                    + '-'
                    + ('0' + day).slice(-2) + '"'
                    
                    + '><span>'
                    + day
                    + ((s.daylabels) ? '<em>' + dayLabels[date_day ? date_day - 1 : 6] + '<\/em>' : '')
                    + '<\/span>'
                    + ((s.monthlabels && !s.mlabels_firstday && (date_day === 0) && firstweek) ? '<strong>' + monthLabels[month] + '<\/strong>' : '')
                    + ((s.monthlabels && s.mlabels_firstday && (day === 1)) ? '<strong>' + monthLabels[month] + '<\/strong>' : '')
                    + '<\/li>';

                    date_time += one_day;

                    date_day++;
                    (date_day > 6) && (date_day = 0);
                }

                return html;
            },
            generate: function(s, options) {
                var e,
                    t,
                    i,
                    fill_cells,
                    html ='';

                t = new Date(s.start.year, s.start.month - 1, s.start.day || 1);
                e = new Date(s.end.year, s.end.month);
                
                s.first_month = true;
                
                if (s.type === 'list') {
                    html = '<ul class="calendar-list'
                    + (s.classes ? (' ' + s.classes) : '')
                    + '">';
                    
                    if (!s.nogaps) {
                        fill_cells = (t.getDay() ? t.getDay() : 7)  - 1;
                        for(i = 0; i < fill_cells; i++ ){
                            html += '<li class="empty"><\/li>';
                        }
                    }
                }

                do {
                    if (s.type === 'list') {
                        html += this.generateList(t, s, options);
                    }
                    else {
                        html += this.generateTable(t, s, options);
                    }
                    t = new Date(t.getFullYear(), t.getMonth() + 1);
                    s.first_month = false;
                } while (+t !== +e)

                if (s.type === 'list') {
                    if (!s.nogaps) {
                        fill_cells = 7 - (new Date(e - one_day)).getDay();
                        if (fill_cells < 7) {
                            for(i = 0; i < fill_cells; i++ ){
                                html += '<li class="empty"><\/li>';
                            }
                        }
                    }
                    html += '<\/ul>';
                }
                
                return html;
            },
            getDaysNum: function(year, month) { // nMonth is 0 thru 11
                return 32 - new Date(year, month, 32).getDate();
            }
        };
    }()); 

    var onTouchMove = function(e) {
        if ($(e.target).closest('.dateline').length !== 0) {
            e.preventDefault();
        }
    };

    var DateLine = function(el, options) {
        this.$.container = $(el);
        this.options = $.extend({}, defaultOptions, options);
        this.monthLabels = this.options.label.months.split('|');
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();

        // Set available months range
        this.availableMonths = this.monthLabels.splice(
            this.currentMonth, 
            this.monthLabels.length - 1
        );

        this.dates = {
            selected: null,
            start: {
                year: this.currentYear,
                month: this.currentMonth + 1
            },
            end: {
                year: this.currentYear,
                month: (this.currentMonth + this.availableMonths.length) + 1
            }
        };

        // Add to availableMonths range, first month of feature Year
        // Increase end point by one year & set month to first month of year
        if (this.currentMonth >= 7) {
            this.availableMonths.push(this.monthLabels[0]);
            this.dates.end = {
                year: this.currentYear + 1,
                month: 1
            };
        }

        this.create();
    };

    DateLine.prototype.$ = {};

    DateLine.prototype.create = function() {
        var that = this;

        this.$.el = $('<div class="dateline" />');
        this.$.monthsContainer = $('<div class="dateline-months" />');
        this.$.daysContainer = $('<div class="dateline-days" />');

        // Create months list
        (function() {
            var year = parseInt(this.currentYear),
                month = parseInt(this.currentMonth),
                html = '';

            $.each(this.availableMonths, function(i, label) {
                if (i > 0) {
                    month = month === 11 ? 0 : month + 1;
                    if (month === 0) {
                        year += 1;
                    }
                }
                html += '<li' + (that.currentMonth === month ? ' class="selected"' : '') + '>' + 
                    label + '<small>' + year + '</small>' +
                '</li>';
            });
            
            this.$.monthsContainer.html('<ul>' + html + '</ul>');
        }).call(this);

        // Create days list
        this.$.daysContainer.html( 
            сalendarGenerator.generate({
                start: this.dates.start,
                end: this.dates.end,
                daylabels: true,
                monthlabels: true,
                mlabels_firstday: true,
                type: 'list',
                nogaps: true
            }, this.options)
        ); 

        this.$.monthsScroller = this.$.monthsContainer.find('ul');
        this.$.months = this.$.monthsContainer.find('li');
        this.$.daysScroller = this.$.daysContainer.find('.calendar-list');
        this.$.days = this.$.daysContainer.find('li');
        this.$.daysMonthLabels = this.$.daysContainer.find('.monthlabel');
        this.$.el.append(this.$.monthsContainer, this.$.daysContainer);
        this.$.container.append(this.$.el);

        this.setDate(this.$.days.filter('.today').data('date'));
        this.collectParams();
        
        this.$.container.css('width', this.days.pageWidth + 'px');
        this.$.monthsScroller.css('width', (this.$.months.first().width() * this.$.months.length) + 'px');
        this.$.daysScroller.css({ width: this.days.itemWidth * this.$.days.length + 'px' });
        
        var that = this;
        this.$.daysMonthLabels.each(function(i) {
            var point = i === 0 ? 0 : $(this).offset().left - 10;
            that.days.points.push(point);
        });

        this.$.daysContainer
            .on('swipeLeft swipeRight', function(e) {
                e.preventDefault();
                if (e.type === 'swipeLeft') {
                    that.slideDaysRight();
                } else {
                    that.slideDaysLeft();
                }
            })
            .on('tap', 'li', function() {
                var $el = $(this);
                if (!$el.hasClass('past')) {
                    that.setDate($el.data('date'));
                }
            });

        this.$.monthsContainer.on('tap', 'li', function() {
            var $el = $(this),
                index = $el.index();

            if (!$el.hasClass('selected') && !that.months.animate) {
                that.selectMonth(index);
                that.$.daysScroller.animate({
                    translate3d: String(-that.days.points[index]) + 'px,0,0',
                }, 300, 'ease-out', function() {
                    that.months.animate = false;
                }); 
                that.months.animate = true;
            }
        });

        document.addEventListener('touchmove', onTouchMove, false);
    };

    DateLine.prototype.destroy = function() {
        document.removeEventListener('touchmove', onTouchMove);
        this.$.daysContainer.off('swipeLeft swipeRight');
        this.$.daysContainer.off('tap', 'li');
        this.$.monthsContainer.off('tap');
        this.$.container.empty();
    };

    DateLine.prototype.collectParams = function() {
        var that = this;

        this.days = {
            animate: false,
            page: 1,
            points: []
        };

        this.months = {
            animate: false,
            points: []
        };

        this.days.itemWidth = this.$.days.first().width();
        this.days.onScreen = Math.floor(this.$.container.width() / this.days.itemWidth);
        this.days.totalPages = Math.floor(this.$.days.length / this.options.swipeDaysCount);
        this.days.pageWidth = this.days.onScreen * this.days.itemWidth;

        this.$.months.each(function(i) {
            var $el = $(this),
                point = 0;
            if (i > 0) {
                point = ($el.offset().left - $el.prev().width()) - 8;
            }
            that.months.points.push(point);
        });
    };

    DateLine.prototype.slideDays = function(dir) {
        var that = this,
            leftPosition,
            positionStart,
            positionEnd;

        if (this.days.animate) {
            return;
        } else {
            if (dir === -1 && this.days.page <= 1) {
                return;
            } else if (dir === 1 && this.days.page >= this.days.totalPages) {
                return;
            }
        }

        this.days.page += dir;
        leftPosition = this.days.page === 1 ? 0 : String(-((this.options.swipeDaysCount * this.days.itemWidth) * this.days.page));
        
        positionStart = Math.abs(parseInt(leftPosition)) - (this.days.pageWidth/2);
        positionEnd = positionStart + this.days.pageWidth;

        for (var i = 0, len = this.days.points.length, point, $tabs; i < len; i++) {
            point = this.days.points[i];
            if (point >= positionStart && point <= positionEnd) {
                this.selectMonth(i);
                break;
            }
        }

        this.$.daysScroller.animate({
            translate3d: leftPosition + 'px,0,0',
        }, 150, 'ease-out', function() {
            that.days.animate = false;
        });
        this.days.animate = true;
    };

    DateLine.prototype.slideDaysLeft = function() {
        this.slideDays(-1);
    };

    DateLine.prototype.slideDaysRight = function() {
        this.slideDays(1);
    };

    DateLine.prototype.selectMonth = function(index) {
        var that = this,
            $el = this.$.months.eq(index);

        if ($el.length) {
            this.$.months.removeClass('selected');
            $el.addClass('selected');
            if (index < this.$.months.length - 1) {
                this.$.monthsScroller.animate({
                    translate3d: String(-this.months.points[index]) + 'px,0,0',
                }, 300, 'ease-out');
            }
        }
    };

    DateLine.prototype.setDate = function(date) {
        this.dates.selected = date;
        this.$.days
            .removeClass('selected')
            .filter('[data-date="' + date + '"]').addClass('selected');
        this.$.container.trigger('dateline:changed', [this.dates.selected]);

    };

    DateLine.prototype.getDate = function() {
        return this.dates.selected;
    };

    $.fn.dateLine = function(options) {
        return this.each(function() {
            if (!(this.DateLine instanceof DateLine)) {
                this.DateLine = new DateLine(this, options);
            }
        });
    };
}(Zepto, window));