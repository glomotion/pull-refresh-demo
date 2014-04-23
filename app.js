$(function(){

	var TIMEOUT_VAL = 200;
	var BREAKPOINT = 70;
	var TRANSLATE_RATIO = .4;

	var $body = $('body');
	var $hitzone = $('#hitzone');
	
	var pullDownMode, pullUpMode;
    
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
    	// fixes much flakyness in Clank...
        ev.gesture.preventDefault();
        
        switch(ev.type) {

            // on release we check if we dragged enough to warrant a mode switch
            case 'release':
                $hitzone.addClass('return').css({
			    	"transform" : "translate3d(0,0,0)"
			    });
			    if (pullDownMode) {
                	$body.addClass('pulldown-mode');
                }
                if (pullUpMode) {
                	$body.addClass('pullup-mode');
                }
			    setTimeout(function() {
			        $hitzone.removeClass('return');
			    }, TIMEOUT_VAL);
                break;


            // when we dragdown
            case 'dragdown':

            	var translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
            	console.log(translateAmount);

       			$hitzone.css({
			    	"transform" : "translate3d(0," + translateAmount + "px,0)"
			    });
			    if (translateAmount >= BREAKPOINT) {
			    	pullDownMode = true;
			    }
			    if (pullUpMode) {
			    	resetModes();
			    }

                break;


            // when we dragup
            case 'dragup':

            	var translateAmount = ev.gesture.deltaY * TRANSLATE_RATIO;
            	console.log(translateAmount);

       			$hitzone.css({
			    	"transform" : "translate3d(0," + translateAmount + "px,0)"
			    });

			    if (translateAmount <= -BREAKPOINT) {
			    	pullUpMode = true;
			    }
			    if (pullDownMode) {
			    	resetModes();
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
    	    $hitzone.removeClass('return');
    	}, TIMEOUT_VAL);
    }

})