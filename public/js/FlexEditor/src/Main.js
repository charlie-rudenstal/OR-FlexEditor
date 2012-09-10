/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	this.options = options;
};

(function(me) {

	me.prototype.load = function(options) {
		
		// Merge parameter-options with the constructor-options
		var options = $.extend({}, this.options, options);

		// Fetch options or defaults
		var element = document.getElementById(options.elementId);
		var cellSize = options.cellSize || { width: 10, height: 10 };
		
		// Init view model
		var model = options.view || new View();	

		// Init renderer
		var renderer = options.renderer || new Renderer();

		// Init Grid renderer and render the grid
		var gridRenderer = options.gridRenderer || new GridRenderer();
		gridRenderer.render(element, cellSize);

		// Compile templates from the tpl folder
		Templates.init();

		// Init mouse handler
		var mouseHandler = new MouseHandler(element, cellSize, { 
			onSelected: eventHandler(onSelected, { element: element, 
												   model: model, 
												   renderer: renderer })
		});
	};

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

	var eventHandler = function(action, context) {
		return function(e) {
			action(e, context);
		}
	}

	//var start = (new Date).getTime();
	//for(var i = 0; i < 10000; i++)		
	//console.log('time', ((new Date).getTime() - start), ' ms');
	
}(Main));

