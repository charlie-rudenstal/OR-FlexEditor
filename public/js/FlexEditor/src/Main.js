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

	// Init Grid renderer
	this.gridRenderer = options.gridRenderer || new GridRenderer();

	// Compile templates from the tpl folder
	Templates.init();
};

(function(me) {

	me.prototype.load = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		// Init mouse handler
		this.bindMouse(element, cellSize);

		// Render grid
		this.gridRenderer.render(element, cellSize);
	};

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, element);
	}

	me.prototype.bindMouse = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		var mouseHandler = new MouseHandler(element, cellSize, this.renderer, this.model);

		$(element).on('mousemove', mouseHandler);
		$(element).on('mousedown', mouseHandler);
	}
	
	//var start = (new Date).getTime();
	//for(var i = 0; i < 10000; i++)		
	//console.log('time', ((new Date).getTime() - start), ' ms');
	
}(Main));

