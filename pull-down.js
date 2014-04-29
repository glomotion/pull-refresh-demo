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
	
    // some misc global vars that can update (switches mostly)
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
                // 'return' class is used for css animation smoothness
                $body.addClass('return');
                // reset all translation values first up...
                $hitzone.css({
			    	"transform" : "translate3d(0,0,0)"
			    });
                // if pullDownMode has been triggered, change into 'pull-down' mode
			    if (pullDownMode) {
                    $pulldown.attr('data-percent','100');
                	$body.addClass('pulldown-mode');
                    $hitzone.css({
                        "transform" : "translate3d(0," + LOCK_OFFSET + "px,0)"
                    });
                    lockedIn = true;
                } else {
                    // otherwise, reset the mode
                    resetMode();
                }
                // once css transitions are complete, remove the class that enables them.
			    setTimeout(function() {
			        $body.removeClass('return');
			    }, TIMEOUT_VAL);
                
                break;


            // when we dragdown
            case 'dragdown':
                // capture the basic gesture movement, and refine it for use in the UI
            	translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
                // have we dragged enough already to trigger 'pull-down' mode?
                if (translateAmount >= BREAKPOINT) {
                    // trigger 'pull-down' mode
                    pullDownMode = true;
                }
                // are we already in 'pull-down' mode?
                // if so, we need to alter the 'translateAmount' a little...
                if (lockedIn) {
                    // temporarily disable pulldown mode and allow dragging
                    $body.removeClass('pulldown-mode');
                    // global offset value ensures that we start translating from where we are supposed to
                    if (offset === 0) {
                        offset = LOCK_OFFSET;
                    }
                    translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO + offset;
                    if (translateAmount >= BREAKPOINT) {
                        pullDownMode = true;
                    }
                } else {
                    // we're not in 'pull-down' mode, so animate the distance left until the 'breakpoint'
                    var percentComplete = (100 / BREAKPOINT) * translateAmount;
                    if (percentComplete <= 101 && percentComplete > 0) {
                        // animate thru the percentage levels, in increments of 10
                        $pulldown.attr('data-percent',Math.round(percentComplete / 10) * 10);
                    }
                }
                // finally, apply calculated 'translationAmount', as a 3d transform (butter smooth)...
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
                    // calculate current drag progress as a percentage
                    var percentComplete = (101 / BREAKPOINT) * translateAmount;
                    if (percentComplete <= 100 && percentComplete > 0) {
                        // animate thru the animation
                        $pulldown.attr('data-percent',Math.round(percentComplete / 10) * 10);
                    }
                }
                // final check to see if we have dragged up enough to cancel 'pull-down' mode
                if (translateAmount <= BREAKPOINT) {
                    pullDownMode = false;
                }
                // finally, apply calculated 'translationAmount', as a 3d transform (butter smooth)...
                $hitzone.css({
                    "transform" : "translate3d(0," + translateAmount + "px,0)"
                });
                break;
        }

    }

    // generic reset function, clears 'pull-down' mode, and restores the app to normal
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

    // create and innit the left/right carousel object
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





