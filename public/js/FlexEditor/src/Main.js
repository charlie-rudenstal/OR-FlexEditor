// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	this.options = options;
};


(function(me) {

	var buttons = [];
	var renderer = null;
	var state = new cursorState();
	var cellSize =  { width: 5, height: 5 };


	me.prototype.load = function(options) {
		// Merge parameter-options with the constructor-options (or use defaults)
		var options = merge(this.options, options);
		var element = document.getElementById(options.elementId);
		if(options.cellSize) cellSize = options.cellSize; 
		
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
			var buttonAtCursor = getButtonAtCursor(buttons, e.relX, e.relY);
			if(buttonAtCursor) {	
				//state  = new moveState(buttonAtCursor);
				var newButton = buttonAtCursor.button;
				if (buttonAtCursor.deltaX < 2) {	
					state = new resizeState(buttonAtCursor, "left");
				} else if (buttonAtCursor.deltaY < 2) {
					state = new resizeState(buttonAtCursor, "top");		
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.rect.width - 2) {
					state = new resizeState(buttonAtCursor, "right");	
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.rect.height - 2) {
					state = new resizeState(buttonAtCursor, "bottom");	
				} else {
					state = new moveState(buttonAtCursor);
				}
			} else {
				state = new selectionState();
			}
		}

		this.mouseMove = function(e) {
			var buttonAtCursor = getButtonAtCursor(buttons, e.relX, e.relY);
			var renderButtons = buttons;
			
			if(buttonAtCursor) {
				var newButton = buttonAtCursor.button;
				var resizeDir = null;
				if (buttonAtCursor.deltaX < 2) {	
					resizeDir = "resizeLeft";
				} else if (buttonAtCursor.deltaY < 2) {
					resizeDir = "resizeTop";			
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.rect.width - 2) {
					resizeDir = "resizeRight";			
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.rect.height - 2) {
					resizeDir = "resizeBottom";			
				}
				if(resizeDir) {
					newButton = merge(buttonAtCursor.button, { resizeDir: resizeDir });
				}
				renderButtons = replace(buttons, buttonAtCursor.button, newButton);
			}
			renderer.write(Templates.Button, renderButtons); 
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

			var previewButton = { 
				  text: ''
				, position: 'relative'
				, rect: e.rectFromMouseDown
				, customClass: 'current'
			};
			renderer.write(Templates.Preselection, buttons.concat(previewButton));

			console.log($('.tmpPreview'));
			Popover.getResults(Templates.CreateButtonModal, renderer, $('.preselection.current'), {
				onSuccess: function(results) {		
					buttons.push({
						  text: results.inputText
						, position: 'relative'
						, rect: e.rectFromMouseDown
					});
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				},
				
				// On cancelled, just re-render already stored buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				}
			});	

			state = new frosenState();			
		}
	}

	function frosenState() {

	}

	function moveState(movedButton) {
		this.mouseMove = function(e) {
			movedButton.button.rect.x = e.rect.x - movedButton.deltaXSnapped;
			movedButton.button.rect.y = e.rect.y - movedButton.deltaYSnapped;
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
	
	var getButtonAtCursor = function(buttons, x, y) {
		var snappedPoint = snapPoint({x: x, y: y}, cellSize);
		for(var i in buttons) {
			var b = buttons[i];
			if(x >= b.rect.x && x < b.rect.x + b.rect.width && 
			   y >= b.rect.y && y < b.rect.y + b.rect.height)


				
				return { button: buttons[i]
					   , index: parseInt(i)
					   , deltaX: x - b.rect.x
					   , deltaY: y - b.rect.y
					   , deltaXSnapped: snappedPoint.x - b.rect.x
					   , deltaYSnapped: snappedPoint.y - b.rect.y }
		}
		return null;
	}

	function resizeState(resizedButton, direction) {
		this.mouseUp = function(e) {
			state = new cursorState();

			var deltaX = e.x - e.xMouseDownSnapped;
			var deltaY = e.y - e.yMouseDownSnapped;
			switch(direction) {
				case "left":
					resizedButton.button.rect.x = resizedButton.button.rect.x + deltaX; 
					resizedButton.button.rect.width = resizedButton.button.rect.width - deltaX;
					break;
				case "top":
					resizedButton.button.rect.y = resizedButton.button.rect.y + deltaY;
					resizedButton.button.rect.height = resizedButton.button.rect.height - deltaY;
					break;
				case "right":
					resizedButton.button.rect.width = resizedButton.button.rect.width + deltaX;
					break;
				case "bottom":
					resizedButton.button.rect.height = resizedButton.button.rect.height + deltaY;
					break;
			}		
		}

		this.mouseMove = function(e) {
			var deltaX = e.x - e.xMouseDownSnapped;
			var deltaY = e.y - e.yMouseDownSnapped;
			var renderButtons = buttons;
			var previewButton = merge({}, resizedButton.button, true);
			switch(direction) {
				case "left":
					previewButton.rect.x = resizedButton.button.rect.x + deltaX; 
					previewButton.rect.width = resizedButton.button.rect.width - deltaX;
					break;
				case "top":
					previewButton.rect.y = resizedButton.button.rect.y + deltaY;
					previewButton.rect.height = resizedButton.button.rect.height - deltaY;
					break;
				case "right":
					previewButton.rect.width = resizedButton.button.rect.width + deltaX;
					break;
				case "bottom":
					previewButton.rect.height = resizedButton.button.rect.height + deltaY;
					break;
			}

			var previewButtons = replace(buttons, resizedButton.button, previewButton);
			renderer.write(Templates.Preselection, previewButtons);
		}
	}



}(Main));

