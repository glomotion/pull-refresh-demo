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
            lockedIn = false;
    	}, TIMEOUT_VAL * 4);
    }

});




