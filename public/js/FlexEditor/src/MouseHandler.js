// background-size: 10% 10%, 10% 10%;

function MouseHandler(element, cellSize, callbacks) {
	var eventHandler = MouseHandler.getEventHandler(element, cellSize, callbacks);		
	$(element).on('mousemove', eventHandler);
	$(element).on('mousedown', eventHandler);
};

(function(me) {

	me.getEventHandler = function(element, cellSize, callbacks) {		
		// Store size of the container once when loaded 
		// (needed to calculate relative mouse position)
		var elementRect = getElementRect(element);
		return function(e) {
			eventHandler(e, elementRect, cellSize, callbacks);			
		}
	}

	function eventHandler(e, elementRect, cellSize, callbacks) {		
		var mouse = { x: e.pageX, y: e.pageY };		
		var absolute  = subtract(mouse, elementRect);
		var relative  = percentage(absolute, elementRect);		
		var snapRect  = getSnappedRect(relative, cellSize);
 		
		switch(e.type) {		
			case 'mousemove': 
				onMouseMove.call(this, snapRect); 
				break;
			case 'mousedown': 
				callbacks.onSelected({rect: snapRect});
				onMouseDown.call(this, snapRect);				
				break;		
		}
	}

	function getElementRect(element) {
		var position = $(element).position();			
		return {
			  x: position.left
			, y: position.top
			, width: $(element).width()
			, height: $(element).height()
		};
	}

	function subtract(point1, point2) {
	 	return {   
	 		  x: point1.x - point2.x
	 		, y: point1.y - point2.y
	 	}; 
	}

	function percentage(point, size) {
		return {
			  x: point.x / size.width * 100
			, y: point.y / size.height * 100
		}
	}

	/**
	 * Retrieve position for the cell located at this position
	 * @param  object cellSize  Expects {width, height} for snapping  
	 * @return object           {left, top, width, height}
	 */
	var getSnappedRect = function(point, cellSize) {
		return {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};
	}

	var onMouseMove = function(snapRect) {

	}

	var onMouseDown = function(snapRect) {
	
	}

})(MouseHandler);