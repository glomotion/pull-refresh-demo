$(function(){

	var TIMEOUT_VAL = 200;
	var $hitzone = $('#hitzone');
	var dragged_down = false;
    
    $hitzone.hammer().on('touch dragdown release', function(e) {
        handleHammer(e);  
    });
	
    /**
     * Handle HammerJS callback
     * @param ev
     */
    var handleHammer = function(ev) {

        switch(ev.type) {


            // on release we check how far we dragged
            case 'release':
	            
	            console.log(ev.type);

	            if(!dragged_down) {
	                return;
	            }
                
                $hitzone.addClass('return').css({
			    	"transform" : "translate3d(0,0,0)"
			    });
			    setTimeout(function() {
			        $hitzone.removeClass('return')
			    }, TIMEOUT_VAL);
                break;


            // when we dragdown
            case 'dragdown':
            	
                console.log(ev.type);

            	dragged_down = true;

            	var translateAmount = ev.gesture.deltaY * .6;
            	console.log(translateAmount);

       			$hitzone.css({
			    	"transform" : "translate3d(0," + translateAmount + "px,0)"
			    });

			    // stop browser scrolling
                ev.gesture.preventDefault();
                
                break;
        }

    };


})