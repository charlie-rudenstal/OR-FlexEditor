function Grid(renderer, options) {
	this.renderer = renderer;
	this.gridTemplate = Templates.Grid;
	
	var options = options || {};
	this.cellSize = options.cellSize;
	this.width = options.size.cols * this.cellSize.width;
	this.height = options.size.rows * this.cellSize.height;
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

		element.style.width = this.width + 1 + 'px';
		element.style.height = this.height + 1 + 'px';

		this.renderer.write({ 
			cellSize: this.cellSize, 
			width: this.width, 
			height: this.height }, element, Templates.Grid, true);
	}

})(Grid);