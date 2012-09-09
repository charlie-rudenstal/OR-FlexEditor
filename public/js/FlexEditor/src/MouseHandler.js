// background-size: 10% 10%, 10% 10%;

function MouseHandler(element, cellSize, renderer, model) {

	var eventHandler = MouseHandler.getEventHandler(element, cellSize, renderer, model);		
	$(element).on('mousemove', eventHandler);
	$(element).on('mousedown', eventHandler);
};

(function(me) {

	me.getEventHandler = function(element, cellSize, renderer, model) {
		
		// Store size of the container once when loaded 
		// (needed to calculate relative mouse position)
		var elmRect = getElementRect(element);

		return function(e) {
			eventEmitter(e, elmRect, element, cellSize, renderer, model);			
		}
	}

	function eventEmitter(e, elementRect, element, cellSize, renderer, model) {
		
		var mouse = { x: e.pageX, y: e.pageY };
		
		var absolute  = subtract(mouse, elementRect);
		var relative  = percentage(absolute, elementRect);		
		var snapRect  = getSnappedRect(relative, cellSize);
 		
		switch(e.type) {
			case 'mousemove': onMouseMove.call(this, snapRect, element, renderer, model); break;
			case 'mousedown': onMouseDown.call(this, snapRect, element, renderer, model); break;
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

	/**
	 * Mouse move handler
	 * @param object e is the event object from jQuery but with 4 new properties
	 *               absoluteX/absoluteY - Pixels relative to editor
	 *               relativeX/relativeY - Percentage relative to editor
	 *               cell 				 - Relative position and size of cell
	 */
	var onMouseMove = function(snapRect, element, renderer, model) {
		//console.log(e.cell.left, e.cell.top);
	}

	var onMouseDown = function(snapRect, element, renderer, model) {
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: snapRect.x, width:  snapRect.width
			, top:  snapRect.y, height: snapRect.height
		};

		model.add(button);		
		renderer.write(Templates.Button, model.getButtons(), element);
	}

})(MouseHandler);