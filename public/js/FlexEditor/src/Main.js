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

		var model = this.model;
		var renderer = this.renderer;

		// Init mouse handler
		this.mouseHandler = new MouseHandler(element, cellSize, { 
			onSelected: eventHandler(onSelected, { element: element, 
												   model: model, 
												   renderer: renderer })
		});

		// Render grid
		this.gridRenderer.render(element, cellSize);
	};

	var eventHandler = function(action, dependencies) {
		return function(e) {
			action(e, dependencies);
		}
	}

	var onSelected = function(e, context) {
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: e.rect.x, width:  e.rect.width
			, top:  e.rect.y, height: e.rect.height
		};
		context.model.add(button);		
		context.renderer.write(Templates.Button, context.model.getButtons(), context.element);				
	}

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, element);
	}

	//var start = (new Date).getTime();
	//for(var i = 0; i < 10000; i++)		
	//console.log('time', ((new Date).getTime() - start), ' ms');
	
}(Main));

