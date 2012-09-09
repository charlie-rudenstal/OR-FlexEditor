/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	
	// Fetch options or defaults
	this.element = document.getElementById(options.elementId);
	this.cellSize = options.cellSize || { width: 10, height: 10 };
	
	// Init view model
	this.model = options.view || new View();	

	// Init renderer
	this.renderer = options.renderer || new Renderer();

	// Compile templates from the tpl folder
	Templates.init();
};

(function(me) {

	me.prototype.load = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		// Init mouse handler
		this.bindMouse(element, cellSize);
	};

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, this.element);
	}

	me.prototype.bindMouse = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		var mouseHandler = getMouseHandler(element, cellSize).bind(this);

		$(element).on('mousemove', mouseHandler);
		$(element).on('mousedown', mouseHandler);
	}

	var getMouseHandler = function(element, cellSize) {
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
				case 'mousemove': onMouseMove.call(this, e); break;
				case 'mousedown': onMouseDown.call(this, e); break;
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
	var onMouseMove = function(e) {
		//console.log(e.cell.left, e.cell.top);
	};

	var onMouseDown = function(e) {
		var c = e.cell;
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: c.left, width:  c.width
			, top:  c.top,  height: c.height
		};

		this.model.add(button);
		this.render(this.element, this.model.getButtons());
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
		}
	}


	//var start = (new Date).getTime();
	//for(var i = 0; i < 10000; i++)		
	//console.log('time', ((new Date).getTime() - start), ' ms');
	
}(Main));

