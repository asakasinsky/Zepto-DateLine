(function($) {
    var defaultOptions = {
        swipeDaysCount: 5,
        labels: {
            month: 'Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь',
        }
    };

    var onTouchMove = function(e) {
        if ($(e.target).closest('.dateline').length !== 0) {
            e.preventDefault();
        }
    };

    var DateLine = function(el, options) {
        this.$.container = $(el);
        this.options = $.extend({}, defaultOptions, options);
        this.monthLabels = this.options.labels.month.split('|');
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
            CalendarGenerator.generate({
                start: this.dates.start,
                end: this.dates.end,
                daylabels: true,
                monthlabels: true,
                mlabels_firstday: true,
                type: 'list',
                nogaps: true
            }) 
        ); 

        this.$.monthsScroller = this.$.monthsContainer.find('ul');
        this.$.months = this.$.monthsContainer.find('li');
        this.$.daysScroller = this.$.daysContainer.find('.calendar-list');
        this.$.days = this.$.daysContainer.find('li');
        this.$.daysMonthLabels = this.$.daysContainer.find('.monthlabel');
        this.$.el.append(this.$.monthsContainer, this.$.daysContainer);
        this.$.container.append(this.$.el);

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
                    that.dates.selected = $el.data('date');
                    that.$.days.removeClass('selected');
                    $el.addClass('selected');
                    that.$.container.trigger('dateline:changed', [that.dates.selected]);
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
        this.days.onScreen = Math.floor($(window).width() / this.days.itemWidth);
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

    $.fn.dateLine = function(options) {
        return this.each(function() {
            if (!(this.DateLine instanceof DateLine)) {
                this.DateLine = new DateLine(this, options);
            }
        });
    };
}(Zepto, window));