/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	this.options = options;
};

(function(me) {

	me.prototype.load = function(options) {
		
		// Merge parameter-options with the constructor-options (or use defaults)
		var options = $.extend({}, this.options, options);
		var element = document.getElementById(options.elementId);
		var cellSize = options.cellSize || { width: 10, height: 10 };
		
		// Init button and grid renderer
		var renderer = options.renderer || new Renderer({toElement: element});
		var gridRenderer = options.gridRenderer || new GridRenderer();

		// Render the grid
		gridRenderer.render(element, cellSize);

		// Compile templates from the tpl folder (and store in the Templates namespace)
		Templates.compile();

		// Init mouse handler and handle onPreSelection (grid selection)
		var mouseHandler = new MouseHandler({
			  element: element
			, cellSize: cellSize 
			, onPreSelection: eventHandler(onEvent, { event: 'preselection', renderer: renderer })
			,    onSelection: eventHandler(onEvent, { event: 'selection', renderer: renderer })
		});
	};


	var onEvent = function(e, context) {
		switch(context.event) {
			case 'preselection':
				var button = {
					  position: 'relative'
					, text: ''
					, left: e.rect.x, width:  e.rect.width
					, top:  e.rect.y, height: e.rect.height
				};
				context.renderer.write(Templates.Button, [button], context.element);
				break;

			case 'selection': 
				Modal.getResults(Templates.CreateButtonModal, context.renderer, function(results) {
					var button = {
						  position: 'relative'
						, text: results.inputText
						, left: e.rect.x, width:  e.rect.width
						, top:  e.rect.y, height: e.rect.height
					};
					context.renderer.write(Templates.Button, button, context.element);
				});
				break;
		}
	}
	
}(Main));

