// TODO: Move to common location/helper
var eventHandler = function(action, context) {
	return function(e) {
		action(e, context);
	}
}

function MouseHandler(element, cellSize, callbacks) {
	
	var elementRect = MouseHandler.getElementRect(element);

	var context = {
		element: element, 
		elementRect: elementRect, 
		cellSize: cellSize, 
		callbacks: callbacks	
	};

	$(element).on('mousedown', eventHandler(MouseHandler.onMouseEvent, context));
	$(element).on('mouseup', eventHandler(MouseHandler.onMouseEvent, context));
};

(function(me) {

	me.onMouseEvent = function(e, context) {

		var mouse     = { x: e.pageX, y: e.pageY };
		var absolute  = subtract(mouse, context.elementRect);
		var relative  = percentage(absolute, context.elementRect);		
		var snapRect  = getSnappedRect(relative, context.cellSize);

		switch (e.type) {		
			case 'mousemove':
				var totalRect = rectFrom(context.snapRectStart, snapRect);
				context.callbacks.onSelected({rect: totalRect});
				break;
			case 'mousedown':			
				context.callbacks.onSelected({rect: snapRect}); 
				context.snapRectStart = snapRect;
				$(context.element).on('mousemove', eventHandler(me.onMouseEvent, context));
				break;		
			case 'mouseup': 
				$(context.element).off('mousemove');
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

	/*function rect(x1, y1, x2, y2) {		
		var x = Math.min(x1, x2)
		  , y = Math.min(y1, y2);

		var	width = Math.max(x1, x2) - x
		  , height = Math.max(y1, y2) - y;

		return { 
			x: x, 
			y: y, 
			width: width,
			height: height
		};
	}*/

	// w70 h70 x10 y10
	function rectFrom(rect1, rect2) {
		
		var x = Math.min(rect1.x, rect2.x);
		var y = Math.min(rect1.y, rect2.y);
		var width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - x;
		var height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - y;

		return {
			x: x,
			y: y,
			width: width,
			height: height
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