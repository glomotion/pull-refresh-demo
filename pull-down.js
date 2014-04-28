$(function(){

    // establish some fixed variables (basic settings)
	var TIMEOUT_VAL = 200;
	var BREAKPOINT = 70;
    var LOCK_OFFSET = 150;
	var TRANSLATE_RATIO = .4;

    // create the JQ dom objects that we'll be operated on
	var $body = $('body');
	var $hitzone = $('#hitzone');
    var $pulldown = $('#pull-down');
	
    // some misc global vars that change (switches mostly)
	var pullDownMode, translateAmount, lockedIn;
    var offset = 0;
    
    // setup the event listeners
    $hitzone.hammer().on('touch dragdown dragup release', function(ev) {
        vertPullHandler(ev);  
    });

    // a simple cancel button
    $('.cancel').hammer().on('tap', function() {
        resetMode();
    });
	
    /**
     * Vertical pull event handler
     * @param ev: the full event instance
     */
    function vertPullHandler(ev) {

    	// stop browser scrolling
    	// fixes much flakyness on Clank...
        ev.gesture.preventDefault();
        
        switch(ev.type) {

            // on release we check how far we dragged + reset if no mode change is present
            case 'release':
                $body.addClass('return');
                $hitzone.css({
			    	"transform" : "translate3d(0,0,0)"
			    });
			    if (pullDownMode) {
                    $pulldown.attr('data-percent','100');
                	$body.addClass('pulldown-mode');
                    $hitzone.css({
                        "transform" : "translate3d(0," + LOCK_OFFSET + "px,0)"
                    });
                    lockedIn = true;
                } else {
                    resetMode();
                }
			    setTimeout(function() {
			        $body.removeClass('return');
			    }, TIMEOUT_VAL);
                
                break;


            // when we dragdown
            case 'dragdown':
            	translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
                if (translateAmount >= BREAKPOINT) {
                    pullDownMode = true;
                }
                if (lockedIn) {
                    // temporarily disable pulldown mode and allow dragging
                    $body.removeClass('pulldown-mode');
                    if (offset === 0) {
                        offset = LOCK_OFFSET;
                    }
                    translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO + offset;
                    if (translateAmount >= BREAKPOINT) {
                        pullDownMode = true;
                    }
                } else {
                    var percentComplete = (100 / BREAKPOINT) * translateAmount;
                    if (percentComplete <= 101 && percentComplete > 0) {
                        // animate thru the percentage levels
                        $pulldown.attr('data-percent',Math.round(percentComplete / 10) * 10);
                    }
                }
                $hitzone.css({
                    "transform" : "translate3d(0," + translateAmount + "px,0)"
                });
                break;


            // when we dragup
            case 'dragup':
                translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
                if (translateAmount <= BREAKPOINT) {
                    pullDownMode = false;
                }
                if (lockedIn) {
                    // temporarily disable pulldown mode and allow dragging
                    $body.removeClass('pulldown-mode');
                    translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO + LOCK_OFFSET;
                } else {
                    var percentComplete = (101 / BREAKPOINT) * translateAmount;
                    if (percentComplete <= 100 && percentComplete > 0) {
                        // animate thru the animation
                        $pulldown.attr('data-percent',Math.round(percentComplete / 10) * 10);
                    }
                }
                if (translateAmount <= BREAKPOINT) {
                    pullDownMode = false;
                }
                $hitzone.css({
                    "transform" : "translate3d(0," + translateAmount + "px,0)"
                });
                break;
        }

    }

    function resetMode() {
    	$hitzone.css({
            "transform" : "translate3d(0,0,0)"
        });
    	$body.attr('class','return');
    	pullDownMode = false;
        lockedIn = false;
        offset = 0;
        $pulldown.attr('data-percent','0');
        setTimeout(function() {
    	    $body.removeClass('return');
    	}, TIMEOUT_VAL);
    }

    var carousel = new Carousel("#carousel");
    carousel.init();

});

/**
* super simple carousel
* animation between panes happens with css transitions
*/
function Carousel(element) {
    
    var self = this;
    element = $(element);

    var container = $(">ul", element);
    var panes = $(">ul>li", element);

    var pane_width = 0;
    var pane_count = panes.length;

    var current_pane = 0;


    /**
     * initial
     */
    this.init = function() {
        setPaneDimensions();

        $(window).on("load resize orientationchange", function() {
            setPaneDimensions();
        });
    };


    /**
     * set the pane dimensions and scale the container
     */
    function setPaneDimensions() {
        pane_width = element.width();
        panes.each(function() {
            $(this).width(pane_width);
        });
        container.width(pane_width*pane_count);
    };


    /**
     * show pane by index
     */
    this.showPane = function(index, animate) {
        // between the bounds
        index = Math.max(0, Math.min(index, pane_count-1));
        current_pane = index;

        var offset = -((100/pane_count)*current_pane);
        setContainerOffset(offset, animate);
    };


    function setContainerOffset(percent, animate) {
        container.removeClass("animate");

        if(animate) {
            container.addClass("animate");
        }

        container.css({
            "transform" : "translate3d("+ percent +"%,0,0)"
        });
    }

    this.next = function() { return this.showPane(current_pane+1, true); };
    this.prev = function() { return this.showPane(current_pane-1, true); };


    function horizPullHandler(ev) {

        // disable browser scrolling
        ev.gesture.preventDefault();

        switch(ev.type) {
            case 'dragright':
            case 'dragleft':
                // stick to the finger
                var pane_offset = -(100/pane_count)*current_pane;
                var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                // slow down at the first and last pane
                if((current_pane == 0 && ev.gesture.direction == "right") ||
                    (current_pane == pane_count-1 && ev.gesture.direction == "left")) {
                    drag_offset *= .4;
                }

                setContainerOffset(drag_offset + pane_offset);
                break;

            case 'swipeleft':
                self.next();
                ev.gesture.stopDetect();
                break;

            case 'swiperight':
                self.prev();
                ev.gesture.stopDetect();
                break;

            case 'release':
                // more then 50% moved, navigate
                if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                    if(ev.gesture.direction == 'right') {
                        self.prev();
                    } else {
                        self.next();
                    }
                }
                else {
                    self.showPane(current_pane, true);
                }
                break;
        }
    }

    new Hammer(element[0], { dragLockToAxis: true }).on("release dragleft dragright swipeleft swiperight", horizPullHandler);
}





