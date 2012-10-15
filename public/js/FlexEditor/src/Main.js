// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	this.options = options;
};


(function(me) {

	var buttons = [];
	var renderer = null;
	var state = new cursorState();
	var cellSize =  { width: 2, height: 2 };

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
			, onDoubleClick: eventHandler(onEvent, { event: 'doubleClick' })
		});
	};

	function exportButtons(buttons) {
		console.log(buttons);
		console.log(JSON.stringify(buttons));
	};

	function cursorState() {
		this.mouseDown = function(e) {
			if(e.relX < 4 && e.relY < 4) {
				exportButtons(buttons);
				return;
			}



			var buttonAtCursor = getButtonAtCursor(buttons, e.relX, e.relY);
			var resizeAdornerMouseDistane = 2;

			// TODO: toElement doesn't exist in opera
			// Did user mouse down on the positionType switcher on a button?
			if(e.originalEvent.toElement.className == "positionTypeAdorner") {
				
				// Set to absolut positining and calculate 
				// absolute coordinates to equal the current relative position
				if (buttonAtCursor.button.position == "relative") {
					buttonAtCursor.button.position = "absolute";
				} else {
					buttonAtCursor.button.position = "relative";
				}
				buttonAtCursor.button.showPositionType = true;
				renderer.write(Templates.Button, buttons);	
				buttonAtCursor.button.showPositionType = false;		
			}
			// Did user mouse down on a button?
			else if(buttonAtCursor) {	
				//state  = new moveState(buttonAtCursor);
				var newButton = buttonAtCursor.button;
				if (buttonAtCursor.deltaX < resizeAdornerMouseDistane) {	
					state = new resizeState(buttonAtCursor, "left");
				} else if (buttonAtCursor.deltaY < resizeAdornerMouseDistane) {
					state = new resizeState(buttonAtCursor, "top");		
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.rect.width - resizeAdornerMouseDistane) {
					state = new resizeState(buttonAtCursor, "right");	
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.rect.height - resizeAdornerMouseDistane) {
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
			var resizeAdornerMouseDistane = 2;

			if(buttonAtCursor) {
				var newButton = clone(buttonAtCursor.button);
				newButton.showPositionType = true;
				if (buttonAtCursor.deltaX < resizeAdornerMouseDistane) {	
					newButton.resizeDir = "resizeLeft";
				} else if (buttonAtCursor.deltaY < resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeTop";			
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.rect.width - resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeRight";			
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.rect.height - resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeBottom";			
				}
				renderButtons = replace(buttons, buttonAtCursor.button, newButton);
			}
			renderer.write(Templates.Button, renderButtons); 
		}

		this.doubleClick = function(e) {
			var buttonAtCursor = getButtonAtCursor(buttons, e.relX, e.relY);
			
			state = new frozenState();

			Popover.getResults(Templates.CreateButtonModal, renderer, $('#button_' + buttonAtCursor.button.id), {
				onSuccess: function(results) {		
					buttonAtCursor.button.text = results.inputText;
					buttonAtCursor.button.image = results.inputImage;
					buttonAtCursor.button.foreground = results.inputForeground;
					buttonAtCursor.button.background = results.inputBackground;
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				},
				
				// On cancelled, just re-render already stored buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				}
			}, buttonAtCursor.button);


		}
	}

	function selectionState() {
		this.mouseMove = function(e) {
			var previewButton = new Button({ 
				  text: ''
				, position: 'relative'
				, rect: e.rectFromMouseDown
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));
		}

		this.mouseUp = function(e) {
			var previewButton = new Button({ 
				  text: ''
				, position: 'relative'
				, rect: e.rectFromMouseDown
				, customClass: 'current'
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));

			Popover.getResults(Templates.CreateButtonModal, renderer, $('.preselection.current'), {
				onSuccess: function(results) {		
					buttons.push(new Button({ 
						  text: results.inputText
						, image: results.inputImage
						, foreground: results.inputForeground
						, background: results.inputBackground
						, position: 'relative'
						, rect: e.rectFromMouseDown
					}));
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				},
				
				// On cancelled, just re-render already stored buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				}
			});	

			state = new frozenState();			
		}
	}

	function frozenState() {

	}

	function moveState(movedButton) {
		this.mouseMove = function(e) {
			movedButton.button.x(e.rect.x - movedButton.deltaXSnapped);
			movedButton.button.y(e.rect.y - movedButton.deltaYSnapped);

			var previewButton = clone(movedButton.button);
			previewButton.isMoving = true;

			var previewButtons = replace(buttons, movedButton.button, previewButton);
			
			renderer.write(Templates.Button, previewButtons);
		}

		this.mouseUp = function(e) {
			state = new cursorState();
		}
	}

	function resizeState(resizedButton, direction) {
		this.mouseUp = function(e) {
			state = new cursorState();

			var deltaX = e.x - e.xMouseDownSnapped;
			var deltaY = e.y - e.yMouseDownSnapped;
			switch(direction) {
				case "left":
					resizedButton.button.x(resizedButton.button.x() + deltaX); 
					resizedButton.button.width(resizedButton.button.width() - deltaX);
					break;
				case "top":
					resizedButton.button.y(resizedButton.button.y() + deltaY);
					resizedButton.button.height(resizedButton.button.height() - deltaY);
					break;
				case "right":
					resizedButton.button.width(resizedButton.button.width() + deltaX);
					break;
				case "bottom":
					resizedButton.button.height(resizedButton.button.height() + deltaY);
					break;
			}		
			renderer.write(Templates.Button, buttons);
		}

		this.mouseMove = function(e) {
			var deltaX = e.x - e.xMouseDownSnapped;
			var deltaY = e.y - e.yMouseDownSnapped;
			var renderButtons = buttons;
			var previewButton = merge({}, resizedButton.button, true);

			switch(direction) {
				case "left":
					previewButton.x(resizedButton.button.x() + deltaX);
					previewButton.width(resizedButton.button.width() - deltaX);
					previewButton.resizeDir = 'resizeLeft';
					break;
				case "top":
					previewButton.y(resizedButton.button.y() + deltaY);
					previewButton.height(resizedButton.button.height() - deltaY);
					previewButton.resizeDir = 'resizeTop';
					break;
				case "right":
					previewButton.width(resizedButton.button.width() + deltaX);
					previewButton.resizeDir = 'resizeRight';
					break;
				case "bottom":
					previewButton.height(resizedButton.button.height() + deltaY);
					previewButton.resizeDir = 'resizeBottom';
					break;
			}

			var previewButtons = replace(buttons, resizedButton.button, previewButton);
			renderer.write(Templates.Preselection, previewButtons);
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

}(Main));

