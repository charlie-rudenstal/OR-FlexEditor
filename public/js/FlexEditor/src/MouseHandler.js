// TODO: Move to common location/helper
var eventHandler = function(action, context) {
	return function(e) {
		action(e, context);
	}
}

function MouseHandler(element, cellSize, callbacks) {
	
	var elementRect = MouseHandler.getElementRect(element);

	$(element).on('mousedown', eventHandler(MouseHandler.onMouseEvent, {
		element: element, 
		elementRect: elementRect, 
		cellSize: cellSize, 
		callbacks: callbacks
	}));

};

(function(me) {

	me.onMouseEvent = function(e, context) {

		var mouse     = { x: e.pageX, y: e.pageY };
		var absolute  = subtract(mouse, context.elementRect);
		var relative  = percentage(absolute, context.elementRect);		
		var snapRect  = getSnappedRect(relative, context.cellSize);
 		
		switch (e.type) {		
			case 'mousemove': 
				onMouseMove.call(this, snapRect); 
				break;
			case 'mousedown':
				context.callbacks.onSelected({rect: snapRect});
				//$(context.element).on('mousemove', eventHandler(onMouseEvent, context));
				break;		
		}
	}

	me.getElementRect = function(element) {
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

})(MouseHandler);