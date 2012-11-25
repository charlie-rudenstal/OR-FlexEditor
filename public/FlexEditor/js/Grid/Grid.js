var Grid = (function(me) { 

	var renderer = null;
	var gridTemplate = null;

	var cellSize = null;
	var cols = null;
	var rows = 0;
	var absoluteWidth = null;
	var absoluteHeight = null;
		
	me.init = function(pRenderer, pCols, pRows, pCellSize) {
		renderer = pRenderer;
		cellSize = pCellSize;
		cols = pCols;
		rows = pRows;
		absoluteWidth = pCols * cellSize.width;
		absoluteHeight = pRows * cellSize.height;
		gridTemplate = Templates.Grid;
	}

	me.getCellSize = function() {
		return clone(cellSize);
	}

	me.getRelativeCellSize = function(parentElement) {
		var c = cols;
		var r = rows;
		// use cols and rows of parentElement 
		// instead of for all of the editor if specified
		if(parentElement != null) {
			var cell = parentElement.getCell();
			c = cell.width;
			r = cell.height;
		}
		return {
			width: 1 / c * 100,
			height: 1 / r * 100	
		};
	}

	me.getSize = function() {
		return {
			cols: cols,
			rows: rows
		};
	}

	/**
	 * Renders a grid in the specified element 
	 * using the cellsize supplied in the options to the current editor   
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	me.render = function(element) {
		// The renderer work on pure elements not wrapped by jQuery
		if(element instanceof jQuery) element = element.get(0);

		element.style.width = absoluteWidth + 1 + 'px';
		element.style.height = absoluteHeight + 1 + 'px';

		renderer.write({ cellSize: cellSize, 
						 width: absoluteWidth, 
						 height: absoluteWidth }, 
						 element, gridTemplate, true);
	}

	return me;
})({});