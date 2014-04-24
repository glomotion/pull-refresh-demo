$(function(){

	var TIMEOUT_VAL = 200;
	var BREAKPOINT = 70;
	var TRANSLATE_RATIO = .4;

	var $body = $('body');
	var $hitzone = $('#hitzone');
	
	var pullDownMode, pullUpMode, lockedIn, translateAmount;
    
    $hitzone.hammer().on('touch dragdown dragup release', function(ev) {
        handleHammer(ev);  
    });

    $('.cancel').hammer().on('tap', function() {
        resetModes();
    });
	
    /**
     * Handle HammerJS callback
     * @param ev
     */
    function handleHammer(ev) {

    	// stop browser scrolling
    	// fixes much flakyness on Clank...
        ev.gesture.preventDefault();
        
        switch(ev.type) {

            // on release we check how far we dragged
            case 'release':
                $hitzone.addClass('return').css({
			    	"transform" : "translate3d(0,0,0)"
			    });
			    if (pullDownMode) {
                	$body.addClass('pulldown-mode');
                    lockedIn = true;
                }
                if (pullUpMode) {
                	$body.addClass('pullup-mode');
                    lockedIn = true;
                }
			    setTimeout(function() {
			        $hitzone.removeClass('return');
			    }, TIMEOUT_VAL);
                break;


            // when we dragdown
            case 'dragdown':

            	translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
            	console.log(translateAmount);

                if (pullUpMode && lockedIn) {
                    resetModes();
                }

       			$hitzone.css({
			    	"transform" : "translate3d(0," + translateAmount + "px,0)"
			    });
			    
                if (!lockedIn && translateAmount >= BREAKPOINT) {
			    	pullDownMode = true;
                    translateAmount = 0;
			    }
			    
                break;


            // when we dragup
            case 'dragup':

            	translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
            	console.log(translateAmount);

                if (pullDownMode && lockedIn) {
                    resetModes();
                }

       			$hitzone.css({
			    	"transform" : "translate3d(0," + translateAmount + "px,0)"
			    });

			    if (!lockedIn && translateAmount <= -BREAKPOINT) {
			    	pullUpMode = true;
			    }
                
                break;
        }

    }

    function resetModes() {
    	$hitzone.attr('class','return');
    	$body.attr('class','');
    	pullDownMode = false;
    	pullUpMode = false;
    	setTimeout(function() {
            lockedIn = false;
        }, TIMEOUT_VAL);
        setTimeout(function() {
    	    $hitzone.removeClass('return');
    	}, TIMEOUT_VAL * 5);
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
        })
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


    function handleHammerCarousel(ev) {
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

    new Hammer(element[0], { dragLockToAxis: true }).on("release dragleft dragright swipeleft swiperight", handleHammerCarousel);
}





