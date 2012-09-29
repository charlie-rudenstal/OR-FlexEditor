// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	this.options = options;
};

(function(me) {

	var buttons = [];
	var renderer = null;
	var state = new cursorState();

	me.prototype.load = function(options) {

		// Merge parameter-options with the constructor-options (or use defaults)
		var options = merge(this.options, options);
		var element = document.getElementById(options.elementId);
		var cellSize = options.cellSize || { width: 5, height: 5 };
		
		// Init button and grid renderer
		renderer = options.renderer || new Renderer({toElement: element});
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
			, onMouseUp: eventHandler(onEvent,   { event: 'mouseUp' })
			, onMouseDown: eventHandler(onEvent, { event: 'mouseDown' })
			, onMouseMove: eventHandler(onEvent, { event: 'mouseMove' })
		});
	};

	function cursorState() {
		this.mouseDown = function(e) {
			var buttonAtPoint = getButtonAtPoint(buttons, e.rect.x, e.rect.y);
			if(buttonAtPoint) {	
				state  = new moveState(buttonAtPoint);
			} else {
				state = new selectionState();
			}
		}
	}

	function selectionState() {
		this.mouseMove = function(e) {
			var previewButton = { 
				  text: ''
				, position: 'relative'
				, rect: e.rectFromMouseDown
			};
			renderer.write(Templates.Preselection, buttons.concat(previewButton));
		}

		this.mouseUp = function(e) {
			state = new cursorState();
			Modal.getResults(Templates.CreateButtonModal, renderer, {
				onSuccess: function(results) {		
					buttons.push({
						  text: results.inputText
						, position: 'relative'
						, rect: e.rectFromMouseDown
					});
					renderer.write(Templates.Button, buttons);
				},
				
				// On cancelled, just re-render already stored buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, buttons);
				}
			});				
		}
	}

	function moveState(movedButton) {
		this.mouseMove = function(e) {
			movedButton.button.rect.x = e.rect.x - movedButton.deltaX;
			movedButton.button.rect.y = e.rect.y - movedButton.deltaY;
			renderer.write(Templates.Button, buttons);
		}

		this.mouseUp = function(e) {
			state = new cursorState();
		}
	}

	var onEvent = function(e, context) {
		var action = state[context.event];
		if(action) action(e);
	}
	
	var getButtonAtPoint = function(buttons, x, y) {
		for(var i in buttons) {
			var b = buttons[i];
			if(x >= b.rect.x && x < b.rect.x + b.rect.width && 
			   y >= b.rect.y && y < b.rect.y + b.rect.height)
				return { button: buttons[i]
					   , index: parseInt(i)
					   , deltaX: x - b.rect.x
					   , deltaY: y - b.rect.y }
		}
		return null;
	}

}(Main));

