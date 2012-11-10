function Grid(renderer, cellSize) {
	this.renderer = renderer;
	this.gridTemplate = Templates.Grid;
	this.cellSize = cellSize;
};

(function(me) {

	/**
	 * Renders a grid in the specified element 
	 * using the cellsize supplied in the options to the current editor   
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	me.prototype.render = function(element) {
		// The renderer work on pure elements not wrapped by jQuery
		if(element instanceof jQuery) element = element.get(0);
		this.renderer.write({ cellSize: this.cellSize }, element, Templates.Grid, true);
	}

})(Grid);