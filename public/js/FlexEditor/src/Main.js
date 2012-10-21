// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	var me = this;
	options = options || {};
	
	var elmEditor = $(options.element).get(0);
	var cellSize = options.cellSize || { width: 5, height: 5 };
	var buttons = options.buttons || [];
	
	var renderer = options.renderer || new Renderer({toElement: elmEditor});
	var state = new cursorState();

	// Display resize tool when mouse is this far from an edge
	var resizeAdornerMouseDistane = 6;

	// Compile templates from the tpl folder (and store in the Templates namespace)
	Templates.compile();

	me.load = function() {
		// Init mouse handler and handle onPreSelection (grid selection)
		var mouseHandler = new MouseHandler();
		mouseHandler.register({
			  element: elmEditor
			, cellSize: cellSize 
			, onMouseUp: eventHandler(onEvent,   { event: 'mouseUp' })
			, onMouseDown: eventHandler(onEvent, { event: 'mouseDown' })
			, onMouseMove: eventHandler(onEvent, { event: 'mouseMove' })
			, onDoubleClick: eventHandler(onEvent, { event: 'doubleClick' })
		});
	};

	/**
	 * Renders a grid in the specified element 
	 * using the cellsize supplied in the options to the current editor   
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	me.grid = function(element) {
		// The renderer work on pure elements not wrapped by jQuery
		if(element instanceof jQuery) element = element.get(0);
		renderer.write(Templates.Grid, { cellSize: cellSize }, element);
	}

	me.getButtons = function() {
		return buttons;
	};

	me.setButtons = function(newButtons) {
		buttons = clone(newButtons);
		renderer.write(Templates.Button, buttons);			
	}

	function frozenState() {

	}

	function cursorState() {

		this.mouseDown = function(e) {

			var buttonAtCursor = getButtonAtPosition(buttons, e.absolute.mousePosition);
			
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
				$(me).trigger('change');
			}

			// Did user mouse down on a button?
			else if(buttonAtCursor) {	
				//state  = new moveState(buttonAtCursor);
				var newButton = buttonAtCursor.button;
				if (buttonAtCursor.deltaX < resizeAdornerMouseDistane) {	
					state = new resizeState(buttonAtCursor, "left");
				} else if (buttonAtCursor.deltaY < resizeAdornerMouseDistane) {
					state = new resizeState(buttonAtCursor, "top");		
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.width() - resizeAdornerMouseDistane) {
					state = new resizeState(buttonAtCursor, "right");	
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.height() - resizeAdornerMouseDistane) {
					state = new resizeState(buttonAtCursor, "bottom");	
				} else {
					state = new moveState(buttonAtCursor);
				}
			} else {
				state = new selectionState();
			}
		}

		this.mouseMove = function(e) {
			var buttonAtCursor = getButtonAtPosition(buttons, e.absolute.mousePosition);
			var renderButtons = buttons;
			
			if(buttonAtCursor) {
				var newButton = clone(buttonAtCursor.button);
				newButton.showPositionType = true;
				if (buttonAtCursor.deltaX < resizeAdornerMouseDistane) {	
					newButton.resizeDir = "resizeLeft";
				} else if (buttonAtCursor.deltaY < resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeTop";			
				} else if (buttonAtCursor.deltaX > buttonAtCursor.button.width() - resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeRight";			
				} else if (buttonAtCursor.deltaY > buttonAtCursor.button.height() - resizeAdornerMouseDistane) {
					newButton.resizeDir = "resizeBottom";			
				}
				renderButtons = replace(buttons, buttonAtCursor.button, newButton);
			}
			renderer.write(Templates.Button, renderButtons); 
		}

		this.doubleClick = function(e) {
			var buttonAtCursor = getButtonAtPosition(buttons, e.absolute.mousePosition);
			
			state = new frozenState();

			Popover.getResults(Templates.CreateButtonModal, renderer, $('#button_' + buttonAtCursor.button.id), {
				onSuccess: function(results) {		
					buttonAtCursor.button.text = results.inputText;
					buttonAtCursor.button.image = results.inputImage;
					buttonAtCursor.button.foreground = results.inputForeground;
					buttonAtCursor.button.background = results.inputBackground;
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
					$(me).trigger('change');
				},
				
				// On cancelled, just re-render already stored me.buttons to clear preselection
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
				, position: 'absolute'
				, rect: e.absolute.selection
				, parent: elmEditor
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));
		}

		this.mouseUp = function(e) {
			var previewButton = new Button({ 
				  text: ''
				, position: 'absolute'
				, rect: e.absolute.selection
				, customClass: 'current'
				, parent: elmEditor
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));

			// Open a popover to edit the new button
			Popover.getResults(Templates.CreateButtonModal, renderer, $('.preselection.current'), {
				onSuccess: function(results) {		
					buttons.push(new Button({ 
						  text: results.inputText
						, image: results.inputImage
						, foreground: results.inputForeground
						, background: results.inputBackground
						, position: 'absolute'
						, rect: e.absolute.selection
						, parent: elmEditor
					}));
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
					$(me).trigger('change');
				},
				
				// On cancelled, just re-render already stored me.buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, buttons);
					state = new cursorState();
				}

			}, new Button({ parent: elmEditor }));	

			state = new frozenState();			
		}
	}

	function moveState(movedButton) {
		this.mouseMove = function(e) {
			movedButton.button.x(e.absolute.snappedPosition.x - movedButton.deltaXSnapped);
			movedButton.button.y(e.absolute.snappedPosition.y - movedButton.deltaYSnapped);

			var previewButton = clone(movedButton.button);
			previewButton.isMoving = true;
			
			var previewButtons = replace(buttons, movedButton.button, previewButton);
			renderer.write(Templates.Button, previewButtons);
			$(me).trigger('change');
		}

		this.mouseUp = function(e) {
			state = new cursorState();
		}
	}

	function resizeState(resizedButton, direction) {
		this.mouseUp = function(e) {
			state = new cursorState();
			var deltaPosition = e.absolute.delta.snappedPosition;
			switch(direction) {
				case "left":
					resizedButton.button.width(resizedButton.button.width() - deltaPosition.x);
					resizedButton.button.x(resizedButton.button.x() + deltaPosition.x); 
					break;
				case "top":
					resizedButton.button.height(resizedButton.button.height() - deltaPosition.y);
					resizedButton.button.y(resizedButton.button.y() + deltaPosition.y);
					break;
				case "right":
					resizedButton.button.width(resizedButton.button.width() + deltaPosition.x);
					break;
				case "bottom":
					resizedButton.button.height(resizedButton.button.height() + deltaPosition.y);
					break;
			}		
			renderer.write(Templates.Button, buttons);
			$(me).trigger('change');
		}

		this.mouseMove = function(e) {
			var renderButtons = buttons;
			var previewButton = merge({}, resizedButton.button, true);
			var deltaPosition = e.absolute.delta.snappedPosition;
			switch(direction) {
				case "left":
					previewButton.width(resizedButton.button.width() - deltaPosition.x);
					previewButton.x(resizedButton.button.x() + deltaPosition.x);
					previewButton.resizeDir = 'resizeLeft';
					break;
				case "top":
					previewButton.height(resizedButton.button.height() - deltaPosition.y);
					previewButton.y(resizedButton.button.y() + deltaPosition.y);
					previewButton.resizeDir = 'resizeTop';
					break;
				case "right":
					previewButton.width(resizedButton.button.width() + deltaPosition.x);
					previewButton.resizeDir = 'resizeRight';
					break;
				case "bottom":
					previewButton.height(resizedButton.button.height() + deltaPosition.y);
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
	
	var getButtonAtPosition = function(buttons, position) {
		var snappedPoint = snapPoint({x: position.x, y: position.y}, cellSize);
		for(var i in buttons) {
			var b = buttons[i];
			if(position.x >= b.x() && position.x < b.x() + b.width() && 
			   position.y >= b.y() && position.y < b.y() + b.height())

				return { button: buttons[i]
					   , index: parseInt(i)
					   , deltaX: position.x - b.x()
					   , deltaY: position.y - b.y()
					   , deltaXSnapped: snappedPoint.x - b.x()
					   , deltaYSnapped: snappedPoint.y - b.y() }
		}
		return null;
	}

};

