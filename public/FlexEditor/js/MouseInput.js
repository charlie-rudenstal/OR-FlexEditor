function MouseInput(element, cellSize) {

	var me = this;
	var $me = $(this);
	var state = new isMouseUp();
	var elementRect;

	this.start = function() {
		$(element).off('mousedown mouseup mousemove');
		$(element).on('mousedown mouseup mousemove dblclick', mouseHandler);	
	}

	function mouseHandler(e) {
		var position = {};
		position.absolute = getMousePosition(e, element);
		position.snapped = getSnappedRect(position.absolute, cellSize);

		var action = state[e.type];
		if(action) action(e, position);
	}

	// This State is Active and Handles Events When Mouse is Up
	function isMouseUp() {
		this.mousedown = function(e, position) {
			$me.trigger({ type: 'mousedown', position: position });
			state = new isMouseDown(position);
		}

		this.mousemove = function(e, position) {
			$me.trigger({ type: 'mousemove', position: position });
		}

		this.dblclick = function(e, position) {
			$me.trigger({ type: 'dblclick', position: position });
		}
	}

	// This State is Active and Handles Events When Mouse is Down
	function isMouseDown(positionStart) {
		this.mousemove = function(e, position) {
			var delta = {};
			delta.absolute = {
				x: position.absolute.x - positionStart.absolute.x,
				y: position.absolute.y - positionStart.absolute.y
			};
			delta.snapped = {
				x: position.snapped.x - positionStart.snapped.x,
				y: position.snapped.y - positionStart.snapped.y
			};
			$me.trigger({ type: 'drag', 
						  position: position, 
						  positionStart: positionStart,
						  delta: delta });
		}
		
		this.mouseup = function(e, position) {
			$me.trigger({ type: 'mouseup', position: position });
			state = new isMouseUp();
		}
	}

	// Helper method to get the mouse position relative to another element, 
	// in this case the editor
	function getMousePosition(e, relativeToElement) {
		if(elementRect == null) elementRect = getElementRect(element);
		return {
			x: e.pageX - elementRect.x,
			y: e.pageY - elementRect.y
		}
	}

	// Helper method to get the position and size of an element
	function getElementRect(element) {
		var position = $(element).position();			
		return {
			  x: position.left
			, y: position.top
			, width: $(element).width()
			, height: $(element).height()
		};
	}

	/**
	 * Retrieve position for the cell located at this position
	 * @param  object cellSize  Expects {width, height} for snapping  
	 * @return object           {left, top, width, height}
	 */
	function getSnappedRect(point, cellSize) {
		var rect = {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};

		return rect;
	}


	// var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	// var state = states.MOUSE_UP;

	// var atMouseDown = { 
	// 	absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
	// 	relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
	// }
	
	/**
	 * Handle a mouse event and call onPreSelection(rect) when user interacts
	 * @param  obj e       Mouse Event
	 * @param  obj context Current Context {element, cellSize, onPreSelection}
	 */
	// function onMouseEvent (e, context) {

	// 	// Retrieve element size (rectangle) if not supplied
	// 	if(context.elementRect == null) {
	// 		return me.onMouseEvent(e, $.extend(context, {elementRect: getElementRect(context.element)}));
	// 	}

	// 	// Retrieve mouse position and a rectangle it snaps to given cellsize
	// 	// Get current mouse position relative to the editor
	// 	var globalMousePosition  = { x: e.pageX, y: e.pageY };
	// 	var mousePosition = subtract(globalMousePosition, context.elementRect);
		
	// 	var absolute = {};
	// 	absolute.mousePosition = mousePosition;
	// 	absolute.snappedPosition = getSnappedRect(absolute.mousePosition, context.cellSize);
	// 	absolute.selectionStart = atMouseDown.absolute.selectionStart || absolute.snappedPosition;
	// 	absolute.selection = rectFrom(absolute.selectionStart, absolute.snappedPosition);
	// 	absolute.delta = {};
	// 	absolute.delta.position = subtract(absolute.mousePosition, atMouseDown.absolute.mousePosition || absolute.mousePosition);
	// 	absolute.delta.snappedPosition = getSnappedRect(absolute.delta.position, context.cellSize);

	// 	var relative = {};
	// 	relative.mousePosition = percentage(mousePosition, context.elementRect);
	// 	relative.snappedPosition = getSnappedRect(relative.mousePosition, context.cellSize);
	// 	relative.selectionStart = atMouseDown.relative.selectionStart || relative.snappedPosition;
	// 	relative.selection = rectFrom(relative.selectionStart, relative.snappedPosition);
		
	// 	// var abs  		  = subtract(mouse, context.elementRect);
	// 	// var relToEditor	  = percentage(abs, context.elementRect);		
	// 	// var snapRect  	  = getSnappedRect(relToEditor, context.cellSize);
	// 	// var relRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);
	// 	// var absRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);

	// 	switch (e.type) {		
	// 		case 'mousedown':			
	// 			if(state == states.MOUSE_UP) {
	// 				state = states.MOUSE_DOWN;
	// 				atMouseDown = { absolute: absolute, relative: relative };
	// 				context.onMouseDown({
	// 					absolute: absolute,
	// 					relative: relative,
	// 					originalEvent: e
	// 				});
	// 			}

	// 			break;
	// 		case 'mousemove':	
	// 			context.onMouseMove({
	// 				absolute: absolute,
	// 				relative: relative,
	// 				originalEvent: e
	// 			});
	// 			break;
	// 		case 'mouseup': 		
	// 			if(state == states.MOUSE_DOWN) {	
	// 				state = states.MOUSE_UP;
	// 				atMouseDown = { 
	// 					absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
	// 					relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
	// 				};
		
	// 				context.onMouseUp({
	// 					absolute: absolute,
	// 					relative: relative,
	// 					originalEvent: e
	// 				});
	// 			}
	// 			break;

	// 		case 'dblclick':
	// 			context.onDoubleClick({
	// 			 	absolute: absolute,
	// 			 	relative: relative,
	// 				originalEvent: e
	// 			});
	// 			break;
	// 	}
	// }

	/*function rectFrom(rect1, rect2) {
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
	}*/

};