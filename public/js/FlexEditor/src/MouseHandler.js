// background-size: 10% 10%, 10% 10%;

function MouseHandler(element, cellSize, renderer, model) {
	return MouseHandler.getMouseHandler(element, cellSize, renderer, model, element);
};

(function(me) {

	me.getMouseHandler = function(element, cellSize, renderer, model) {
		
		var position = $(element).position(),
		width = $(element).width(),
		height = $(element).height();

		return function(e) {
			e.absoluteX = e.pageX - position.left;
			e.absoluteY = e.pageY - position.top;
			e.relativeX = e.absoluteX / width * 100;
			e.relativeY = e.absoluteY / height * 100;
			e.cell = getSnappedPosition(e.relativeX, e.relativeY, cellSize);

			switch(e.type) {
				case 'mousemove': onMouseMove.call(this, e, renderer, model, element); break;
				case 'mousedown': onMouseDown.call(this, e, renderer, model, element); break;
			}
		}
	}

	/**
	 * Mouse move handler
	 * @param object e is the event object from jQuery but with 4 new properties
	 *               absoluteX/absoluteY - Pixels relative to editor
	 *               relativeX/relativeY - Percentage relative to editor
	 *               cell 				 - Relative position and size of cell
	 */
	var onMouseMove = function(e, renderer, model, element) {
		//console.log(e.cell.left, e.cell.top);
	}

	var onMouseDown = function(e, renderer, model, element) {
		var cell = e.cell;
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: cell.left, width:  cell.width
			, top:  cell.top,  height: cell.height
		};

		model.add(button);		
		renderer.write(Templates.Button, model.getButtons(), element);
	}

	/**
	 * Retrieve position for the cell located at this position
	 * @param  object cellSize  Expects {width, height} for snapping  
	 * @return object           {left, top, width, height}
	 */
	var getSnappedPosition = function(relativeX, relativeY, cellSize) {
		return {
			// 					   ~~ is a fast way to trim decimals
			left: cellSize.width * ~~(relativeX / cellSize.width),
			top: cellSize.height * ~~(relativeY / cellSize.height),
			width: cellSize.width,
			height: cellSize.height
		};
	}

})(MouseHandler);