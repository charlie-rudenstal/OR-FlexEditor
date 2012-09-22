// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

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

		// Render grid lines
		gridRenderer.render(element, cellSize);

		// Compile templates from the tpl folder (and store in the Templates namespace)
		Templates.compile();

		// Init mouse handler and handle onPreSelection (grid selection)
		var mouseHandler = new MouseHandler();
		mouseHandler.register({
			  element: element
			, cellSize: cellSize 
			, onPreSelection: eventHandler(onEvent, { event: 'preselection', renderer: renderer, handler: mouseHandler, buttons: [] })
			,    onSelection: eventHandler(onEvent, { event: 'selection',    renderer: renderer, handler: mouseHandler, buttons: [] })
		});
	};

	var onEvent = function(e, context) {

		switch(context.event) {
			case 'preselection':
				// Render a new context with the new button pre-selection appended
				context.renderer.write(Templates.Preselection, context.buttons.concat({ 
					  position: 'relative'
					, text: ''
					, left: e.rect.x, width:  e.rect.width
					, top:  e.rect.y, height: e.rect.height
				}));				
				break;

			case 'selection': 				
				Modal.getResults(Templates.CreateButtonModal, context.renderer, function(results) {
					
					// Create a new context with the new button appended
					var newContext = $.extend({}, context, { buttons: context.buttons.concat({
						  position: 'relative'
					  	, text: results.inputText
					  	, left: e.rect.x, width:  e.rect.width
						, top:  e.rect.y, height: e.rect.height
					})});
					
					// Render it
					context.renderer.write(Templates.Button, newContext.buttons);

					// And re-register selection events with the new button array
					context.handler.register($.extend({}, context.handler.options, {
						  onPreSelection: eventHandler(onEvent, $.extend({}, newContext, { event: 'preselection' }))
						, onSelection: eventHandler(onEvent, $.extend({}, newContext, { event: 'selection' }))
					}));

				});				
				break;
		}
	}
	
}(Main));

