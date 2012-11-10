function Grid(renderer, options) {
	this.renderer = renderer;
	this.gridTemplate = Templates.Grid;
	
	var options = options || {};
	this.cellSize = options.cellSize || { width: 5, height: 5 };
	this.width = options.width || 12;
	this.height = options.height || 25;
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

		element.style.width = this.width * this.cellSize.width + 1 + 'px';
		element.style.height = this.height * this.cellSize.height + 1 + 'px';

		this.renderer.write({ 
			cellSize: this.cellSize, 
			width: this.width, 
			height: this.height }, element, Templates.Grid, true);
	}

})(Grid);