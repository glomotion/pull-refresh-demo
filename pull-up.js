$(function(){

	var TIMEOUT_VAL = 200;
	var BREAKPOINT = 70;
    var LOCK_OFFSET = 150;
	var TRANSLATE_RATIO = .4;

	var $body = $('body');
	var $hitzone = $('#hitzone');
	
	var pullUpMode, translateAmount, firstDragUp, lockedIn;
    var offset = 0;
    
    $hitzone.hammer().on('touch dragdown dragup release', function(ev) {
        vertPullHandler(ev);  
    });

    $('.cancel').hammer().on('tap', function() {
        resetMode();
    });
	
    /**
     * Handle HammerJS callback
     * @param ev
     */
    function vertPullHandler(ev) {

    	// stop browser scrolling
    	// fixes much flakyness on Clank...
        ev.gesture.preventDefault();
        
        switch(ev.type) {

            // on release we check how far we dragged + reset if no mode change is present
            case 'release':
                $hitzone.addClass('return').css({
			    	"transform" : "translate3d(0,0,0)"
			    });
			    if (pullUpMode) {
                	$body.addClass('pullup-mode');
                    $hitzone.css({
                        "transform" : "translate3d(0,-"+ LOCK_OFFSET +"px,0)"
                    });
                    lockedIn = true;
                } else {
                    resetMode();
                }
			    setTimeout(function() {
			        $hitzone.removeClass('return');
			    }, TIMEOUT_VAL);
                break;


            // when we dragdown
            case 'dragdown':

                // console.log('draggin up',pullUpMode);
                translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
                if (translateAmount <= BREAKPOINT) {
                    pullUpMode = false;
                }
                if (lockedIn) {
                    // temporarily disable pulldown mode and allow dragging
                    $body.removeClass('pulldown-mode');
                    translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO - LOCK_OFFSET;
                }
                if (translateAmount >= BREAKPOINT) {
                    pullUpMode = false;
                }
                $hitzone.css({
                    "transform" : "translate3d(0," + translateAmount + "px,0)"
                });
                break;


            // when we dragup
            case 'dragup':

                translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
                // console.log(translateAmount);
                if (translateAmount <= BREAKPOINT) {
                    pullUpMode = true;
                }
                if (lockedIn) {
                    // temporarily disable pulldown mode and allow dragging
                    $body.removeClass('pullup-mode');
                    if (offset === 0) {
                        offset = LOCK_OFFSET;
                    }
                    translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO - offset;
                    if (translateAmount <= BREAKPOINT) {
                        pullUpMode = true;
                    }
                }
                $hitzone.css({
                    "transform" : "translate3d(0," + translateAmount + "px,0)"
                });
                break;


                
        }

    }

    function resetMode() {
        $hitzone.attr('class','return').css({
            "transform" : "translate3d(0,0,0)"
        });
    	$body.attr('class','');
    	pullUpMode = false;
        lockedIn = false;
        offset = 0;
        setTimeout(function() {
    	    $hitzone.removeClass('return');
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

        // stop browser scrolling
        // fixes much flakyness on Clank...
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




