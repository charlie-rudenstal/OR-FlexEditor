function MouseHandler() {
	this.register = function(context) {
		$(context.element).off('mousedown mouseup mousemove');
		$(context.element).on('mousedown mouseup mousemove', eventHandler(MouseHandler.onMouseEvent, context));
	}
};

(function(me) {

	var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	var state = states.MOUSE_UP;
	var snapRectStart = null;
	var xMouseDown = null;
	var yMouseDown = null;
	var xMouseDownSnapped = null;
	var yMouseDownSnapped = null;


	/**
	 * Handle a mouse event and call onPreSelection(rect) when user interacts
	 * @param  obj e       Mouse Event
	 * @param  obj context Current Context {element, cellSize, onPreSelection}
	 */
	me.onMouseEvent = function(e, context) {

		// Retrieve element size (rectangle) if not supplied
		if(context.elementRect == null) {
			return me.onMouseEvent(e, $.extend(context, {elementRect: getElementRect(context.element)}));
		}

		// Retrieve mouse position and a rectangle it snaps to given cellsize
		var mouse     	= { x: e.pageX, y: e.pageY };
		var abs  		= subtract(mouse, context.elementRect);
		var relToEditor	= percentage(abs, context.elementRect);		
		var snapRect  	= getSnappedRect(relToEditor, context.cellSize);

		switch (e.type) {		
			case 'mousedown':			
				if(state == states.MOUSE_UP) {
					state = states.MOUSE_DOWN;
					snapRectStart = snapRect;
					xMouseDown = relToEditor.x;
					yMouseDown = relToEditor.y;
					xMouseDownSnapped = snapRect.x;
					yMouseDownSnapped = snapRect.y;
					context.onMouseDown({
					 	rect: rectFrom(snapRect, snapRect),
					 	x: snapRect.x,
					 	y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y,
						originalEvent: e
					});
				}

				break;
			case 'mousemove':	
				// if(state == states.MOUSE_DOWN) {
					context.onMouseMove({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y,
						xMouseDown: xMouseDown,
						yMouseDown: yMouseDown,
						xMouseDownSnapped: xMouseDownSnapped,
						yMouseDownSnapped: yMouseDownSnapped
					});
				// }
				break;
			case 'mouseup': 		
				if(state == states.MOUSE_DOWN) {	
					state = states.MOUSE_UP;		
					context.onMouseUp({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y,
						xMouseDown: xMouseDown,
						yMouseDown: yMouseDown,
						xMouseDownSnapped: xMouseDownSnapped,
						yMouseDownSnapped: yMouseDownSnapped
					});
				}
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

	function rectFrom(rect1, rect2) {
		var rect = {};
		rect.x = Math.min(rect1.x, rect2.x);
		rect.y = Math.min(rect1.y, rect2.y);
		rect.width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - rect.x;
		rect.height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - rect.y;
		return rect;
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
	function getSnappedRect(point, cellSize) {
		return {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};
	}

})(MouseHandler);