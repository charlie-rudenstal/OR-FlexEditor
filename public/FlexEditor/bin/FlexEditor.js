(function($) {
	function Main(options) {
	var me = this;
	var elements = [];
	var selectedElement = null;
	var selectedElementStartPosition;

	// Set options
	options = options || {};
	var elmEditor = $(options.element).get(0);
	var cellSize = options.cellSize || { width: 5, height: 5 };
	var width = options.width || 12;
	var height = options.height || 25;

	var size = { cols: options.width || 12,
				 rows: options.height || 25 };

	// Resize the editor element to match the size specified in options
	elmEditor.style.width = size.cols * cellSize.width + 'px';
	elmEditor.style.height = size.rows * cellSize.height + 'px';

	// Initialize modules 
	var interactions = new Interactions();
	var renderer = new Renderer();
	var grid = new Grid(renderer, { cellSize: cellSize, size: size });
	var library = new Library(renderer);
	var layers = new Layers(renderer);
	var scene = new Scene(renderer, elmEditor, size, cellSize);

	ElementCollection.setCellSize(cellSize);
	$(ElementCollection).on('change', function() { me.render(); });
	$(ElementCollection).on('selection', function(e) {
		var element = e.element;	
		if(element) {
			PropertyPanel.show(element, renderer, document.body, 190, 47);
		} else {
			PropertyPanel.closeAll();
		}
	});

	me.load = function() {
		scene.init();

		// Add the default Background layer
        var elm = ElementCollection.create(elmEditor);
        elm.property('contentType', 'Image');
        elm.property('background', 'transparent');        
        elm.property('valign', 'top');
        elm.property('halign', 'left');
        elm.property('stretch', 'width');
        elm.property('text', "Background");
        elm.property('locked', true);
        elm.property('positionType', 'relative');
        elm.x(0);
        elm.y(0);
        elm.width(100, 'relative');
        elm.height(100, 'relative');
        ElementCollection.add(elm);
	};
 
	me.render = function() {
		var elements = ElementCollection.getAsArray();
		scene.render(elements);
		layers.render(elements);
	}

	// Render the grid
	me.grid = function(element) {
		grid.render(element);
	}

	me.library = function(element) {
		library.load(element);
	}

	me.layers = function(element) {
		layers.load(element);
	}

	// me.import = function(newButtonData) {
	// 	buttons = [];
	// 	for(var i in newButtonData) {
	// 		buttons.push(new Button(elmEditor, newButtonData[i]));
	// 	}
	// 	me.render();
	// }

	// me.getExport = function() {
	// 	var arr = [];
	// 	for(var i in buttons) {
	// 		arr.push(buttons[i].getExport());
	// 	}
	// 	return arr;
	// };
};

// function eventHandler(action, context) {
// 	return function(e) {
// 		action(e, context);
// 	}    
// };

function delegate(eventHandler) {
	return function(e) {
		if(eventHandler.hasOwnProperty(e.type)) {
			eventHandler[e.type](e, before);
		}
	}
};

function merge(a, b, deep) {
	var isDeep = deep === true;
	return $.extend(isDeep, {}, a, b);
}

function clone(a) {
	if(a instanceof Array) {
		var arr = [];
		for(var i in a) arr.push(clone(a[i]));
		return arr; 
	} else {
		return merge(a, a, true);
	}
}

function cloneArrayShallow(array) {
	return array.slice();
}

function limit(value, min, max) {
	if(value < min) return min;
	if(value > max) return max;
	return value;
}

function between(value, min, max) {
	return value >= min && value <= max;
}

function remove(item, array) {
	var newArray = [];
	for(var i in array) {
		if(array[i] !== item) newArray.push(array[i]);
	}
	return newArray;
}

function replace(array, oldItem, newItem) {
	var newArray = [];
	for(var i in array) {
		if(array[i] === oldItem) newArray.push(newItem);
		else newArray.push(array[i]);
	}
	return newArray;
}

function snapPoint(point, cellSize) {
	return {
		// 					      ~~ is a fast way to trim decimals
		x:      cellSize.width  * ~~(point.x / cellSize.width),
		y:      cellSize.height * ~~(point.y / cellSize.height),
		width:  cellSize.width,
		height: cellSize.height
	};
}

function snapRect(rect, cellSize) {
	// Why math round and not floor, ceil, int cast or ~~?
	// Because we want it to snap to the closest snap point availble,
	// x: 0.8 should snap to 1, and x: 0.3 to 0
	return {
		x:      cellSize.width  * Math.round(rect.x / cellSize.width),
		y:      cellSize.height * Math.round(rect.y / cellSize.height),
		width:  cellSize.width  * Math.round(rect.width / cellSize.width),
		height: cellSize.height * Math.round(rect.height / cellSize.height)
	};	
}

function toAbsolute(fromRect) {
	var editorWidth = 800;
	toRect = {};
	toRect.x = fromRect.x/100 * editorWidth;
	toRect.y = fromRect.y/100 * editorWidth;
	toRect.width = fromRect.width/100 * editorWidth;
	toRect.height = fromRect.height/100 * editorWidth;
	return toRect;
}	

function toRelative(fromRect) {
	var editorWidth = 800;
	toRect = {};
	toRect.x = fromRect.x/editorWidth * 100;
	toRect.y = fromRect.y/editorWidth * 100;
	toRect.width = fromRect.width/editorWidth * 100;
	toRect.height = fromRect.height/editorWidth * 100;
	return toRect;
}// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Interactions(options) {
	var me = this;
	options = options || {};
	
	var elmEditor = $(options.element).get(0);
	var cellSize = options.cellSize || { width: 5, height: 5 };
	var buttons = options.buttons || [];

	var state = new cursorState();

	// Display resize tool when mouse is this far from an edge
	var resizeAdornerMouseDistane = 6;

	var onEvent = function(e, context) {
		var action = state[context.event];
		if(action) action(e);
	}

	function frozenState() {

	}

	function cursorState() {

		this.mouseDown = function(e) {
			var buttonAtCursor = getButtonAtPosition(buttons, e.absolute.mousePosition);
			// Did user mouse down on a button?
			if(buttonAtCursor) {	
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
			var previewButton = new Button(elmEditor, { 
				  text: ''
				, position: 'absolute'
				, rect: e.absolute.selection
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));
		}

		this.mouseUp = function(e) {
			var previewButton = new Button(elmEditor, { 
				  text: ''
				, position: 'absolute'
				, rect: e.absolute.selection
				, customClass: 'current'
			});
			renderer.write(Templates.Preselection, buttons.concat(previewButton));

			// Open a popover to edit the new button
			Popover.getResults(Templates.CreateButtonModal, renderer, $('.preselection.current'), {
				onSuccess: function(results) {		
					buttons.push(new Button(elmEditor, { 
						  text: results.inputText
						, image: results.inputImage
						, foreground: results.inputForeground
						, background: results.inputBackground
						, position: 'absolute'
						, rect: e.absolute.selection
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

			}, new Button(elmEditor));	

			state = new frozenState();			
		}
	}

	function moveState(movedButton) {
		this.mouseMove = function(e) {
			
			// Get the new position after mouse drag, 
			// is not automatically snapped
			var newX = e.absolute.snappedPosition.x - movedButton.deltaXSnapped;
			var newY = e.absolute.snappedPosition.y - movedButton.deltaYSnapped;

			// Make sure that the button gets snapped upon move
			// if it's position happens to be out of sync with the snap
			// (Could happen with synchronized views among devices or if
			// cellsize of grid is changed)
			snappedRect = snapRect({
				x: newX, 
				y: newY,
				width: movedButton.button.width(),
				height: movedButton.button.height() 
			}, cellSize);

			// if((snappedRect.x + snappedRect.width) > $(elmEditor).width()) return; 
			// if((snappedRect.y + snappedRect.height) > $(elmEditor).height()) return; 

			movedButton.button.x(snappedRect.x);
			movedButton.button.y(snappedRect.y);
			movedButton.button.width(snappedRect.width);
			movedButton.button.height(snappedRect.height); 

			// snappedPoint = snapPoint({x: newX, y: newY}, cellSize);
			// movedButton.button.x(snappedPoint.x);
			// movedButton.button.y(snappedPoint.y);

			// Create a copy of the current button, just to set the 
			// isMoving variable temporarily.
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
			var newRect = { 
				x: resizedButton.button.x(),
				y: resizedButton.button.y(),
				width: resizedButton.button.width(),
				height: resizedButton.button.height()			
			};
			switch(direction) {
				case "left":
					newRect.width = resizedButton.buttonRectClone.width - deltaPosition.x;
					newRect.x = resizedButton.buttonRectClone.x + deltaPosition.x;
					break;
				case "top":
					newRect.height = resizedButton.buttonRectClone.height - deltaPosition.y;
					newRect.y = resizedButton.buttonRectClone.y + deltaPosition.y;
					break;
				case "right":
					newRect.width = resizedButton.buttonRectClone.width + deltaPosition.x;
					break;
				case "bottom":
					newRect.height = resizedButton.buttonRectClone.height + deltaPosition.y;
					break;
			}	

			newRectSnapped = snapRect(newRect, cellSize);
			resizedButton.button.width(newRectSnapped.width);
			resizedButton.button.height(newRectSnapped.height);
			resizedButton.button.x(newRectSnapped.x);
			resizedButton.button.y(newRectSnapped.y);
			
			renderer.write(Templates.Button, buttons);
			$(me).trigger('change');
		}

		this.mouseMove = function(e) {
			var deltaPosition = e.absolute.delta.snappedPosition;

			var resizeDir = "";
			var newRect = { 
				x: resizedButton.button.x(),
				y: resizedButton.button.y(),
				width: resizedButton.button.width(),
				height: resizedButton.button.height()			
			}

			switch(direction) {
				case "left":
					newRect.width = resizedButton.buttonRectClone.width - deltaPosition.x;
					newRect.x = resizedButton.buttonRectClone.x + deltaPosition.x;
					resizeDir = 'resizeLeft';
					break;
				case "top":
					newRect.height = resizedButton.buttonRectClone.height - deltaPosition.y;
					newRect.y = resizedButton.buttonRectClone.y + deltaPosition.y;
					resizeDir = 'resizeTop';
					break;
				case "right":
					// added 5 as a magic number in a try to make it easier to drag to edge 
					// cells that are outside of the device
					newRect.width = resizedButton.buttonRectClone.width + deltaPosition.x;
					resizeDir = 'resizeRight';
					break;
				case "bottom":
					newRect.height = resizedButton.buttonRectClone.height + deltaPosition.y;
					resizeDir = 'resizeBottom';
					break;
			}

			newRectSnapped = snapRect(newRect, cellSize);
			
			resizedButton.button.width(newRectSnapped.width);
			resizedButton.button.height(newRectSnapped.height);
			resizedButton.button.x(newRectSnapped.x);
			resizedButton.button.y(newRectSnapped.y);

			resizedButton.button.resizeDir = "resizeDir";
			renderer.write(Templates.Preselection, buttons);
			resizedButton.button.resizeDir = null;

			$(me).trigger('change');
		}
	}
};

function MouseInput(element, cellSize, relativeToScreen) {

	var me = this;
	var $me = $(this);
	var state = new isMouseUp();
	var elementRect;

	cellSize = cellSize || { width: 1, height: 1 };

	this.start = function() {
		$(element).off('mousedown dblclick');
		$(element).on('mousedown dblclick', mouseHandler);	
		
		// binding mouseup and mousemove these to window makes the selection 
		// more reliable when continues his dragging outside of the current editor
		$(window).on('mouseup mousemove', mouseHandler);	
	}

	function mouseHandler(e) {
		var position = {};
		position.absolute = getMousePosition(e, element);
		position.snapped = getSnappedRect(position.absolute, cellSize);

		var action = state[e.type];
		if(action) action(e, position);

		e.preventDefault();
	}

	// This State is Active and Handles Events When Mouse is Up
	function isMouseUp() {
		this.mousedown = function(e, position) {
			var downPosition = merge({ type: 'mousedown', 
									   position: position, 
									   originalEvent: e,
									   target: e.target }, 
									   position)
			$me.trigger(downPosition);
			state = new isMouseDown(downPosition);
		}

		this.mousemove = function(e, position) {
			$me.trigger({ type: 'mousemove', 
						  position: position, 
					      originalEvent: e,
					      target: e.target });
		}

		this.dblclick = function(e, position) {
			$me.trigger({ type: 'dblclick', position: position, originalEvent: e });
		}

		// a mouse up can be triggered in mouseup state if the mousedown
		// was triggered outside of this handler
		this.mouseup = function(e, position) {
			$me.trigger({ type: 'mouseup', 		   position: position, originalEvent: e });
			$me.trigger({ type: 'mouseup.mouseup', position: position, originalEvent: e });
		}
	}

	// This State is Active and Handles Events When Mouse is Down
	function isMouseDown(positionStart) {
		this.mousemove = function(e, position) {
			var delta = {};
			delta.absolute = {
				x: position.absolute.x - positionStart.absolute.x,
				y: position.absolute.y - positionStart.absolute.y
			};
			delta.snapped = {
				x: position.snapped.x - positionStart.snapped.x, // always add one cellsize to make current and last cell snapped  
				y: position.snapped.y - positionStart.snapped.y
			};
			$me.trigger({ type: 'drag', 
						  position: position, 
						  positionStart: positionStart,
						  delta: delta,
						  originalEvent: e,
						  target: positionStart.originalEvent.target });
		}
		
		this.mouseup = function(e, position) {
			$me.trigger({ type: 'mouseup', 			 position: position, originalEvent: e, target: e.target });
			$me.trigger({ type: 'mousedown.mouseup', position: position, originalEvent: e, target: e.target });
			state = new isMouseUp();
		}
	}

	// Helper method to get the mouse position relative to another element, 
	// in this case the editor
	function getMousePosition(e, relativeToElement) {
		if(elementRect == null) elementRect = getElementRect(element);
		if(relativeToScreen) {
			return {
				x: e.pageX, 
				y: e.pageY
			}
		} else {
			return {
				x: e.pageX - elementRect.x,
				y: e.pageY - elementRect.y
			}	
		}		
	}

	// Helper method to get the position and size of an element
	function getElementRect(element) {
		var $element = $(element);
		var position = $element.offset();	
		var margin = {
			top: parseInt($(element).css('marginTop')),	
			right: parseInt($(element).css('marginRight')),	
			bottom: parseInt($(element).css('marginBottom')),	
			left: parseInt($(element).css('marginLeft'))	
		}
		return {
			  x: position.left + margin.left
			, y: position.top + margin.top
			, width: $(element).width() + margin.left + margin.right
			, height: $(element).height() + margin.top + margin.bottom
		};
	}

	/**
	 * Retrieve position for the cell located at this position
	 * @param  object cellSize  Expects {width, height} for snapping  
	 * @return object           {left, top, width, height}
	 */
	function getSnappedRect(point, cellSize) {
		var rect = {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};
		return rect;
	}


	// var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	// var state = states.MOUSE_UP;

	// var atMouseDown = { 
	// 	absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
	// 	relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
	// }
	
	/**
	 * Handle a mouse event and call onPreSelection(rect) when user interacts
	 * @param  obj e       Mouse Event
	 * @param  obj context Current Context {element, cellSize, onPreSelection}
	 */
	// function onMouseEvent (e, context) {

	// 	// Retrieve element size (rectangle) if not supplied
	// 	if(context.elementRect == null) {
	// 		return me.onMouseEvent(e, $.extend(context, {elementRect: getElementRect(context.element)}));
	// 	}

	// 	// Retrieve mouse position and a rectangle it snaps to given cellsize
	// 	// Get current mouse position relative to the editor
	// 	var globalMousePosition  = { x: e.pageX, y: e.pageY };
	// 	var mousePosition = subtract(globalMousePosition, context.elementRect);
		
	// 	var absolute = {};
	// 	absolute.mousePosition = mousePosition;
	// 	absolute.snappedPosition = getSnappedRect(absolute.mousePosition, context.cellSize);
	// 	absolute.selectionStart = atMouseDown.absolute.selectionStart || absolute.snappedPosition;
	// 	absolute.selection = rectFrom(absolute.selectionStart, absolute.snappedPosition);
	// 	absolute.delta = {};
	// 	absolute.delta.position = subtract(absolute.mousePosition, atMouseDown.absolute.mousePosition || absolute.mousePosition);
	// 	absolute.delta.snappedPosition = getSnappedRect(absolute.delta.position, context.cellSize);

	// 	var relative = {};
	// 	relative.mousePosition = percentage(mousePosition, context.elementRect);
	// 	relative.snappedPosition = getSnappedRect(relative.mousePosition, context.cellSize);
	// 	relative.selectionStart = atMouseDown.relative.selectionStart || relative.snappedPosition;
	// 	relative.selection = rectFrom(relative.selectionStart, relative.snappedPosition);
		
	// 	// var abs  		  = subtract(mouse, context.elementRect);
	// 	// var relToEditor	  = percentage(abs, context.elementRect);		
	// 	// var snapRect  	  = getSnappedRect(relToEditor, context.cellSize);
	// 	// var relRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);
	// 	// var absRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);

	// 	switch (e.type) {		
	// 		case 'mousedown':			
	// 			if(state == states.MOUSE_UP) {
	// 				state = states.MOUSE_DOWN;
	// 				atMouseDown = { absolute: absolute, relative: relative };
	// 				context.onMouseDown({
	// 					absolute: absolute,
	// 					relative: relative,
	// 					originalEvent: e
	// 				});
	// 			}

	// 			break;
	// 		case 'mousemove':	
	// 			context.onMouseMove({
	// 				absolute: absolute,
	// 				relative: relative,
	// 				originalEvent: e
	// 			});
	// 			break;
	// 		case 'mouseup': 		
	// 			if(state == states.MOUSE_DOWN) {	
	// 				state = states.MOUSE_UP;
	// 				atMouseDown = { 
	// 					absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
	// 					relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
	// 				};
		
	// 				context.onMouseUp({
	// 					absolute: absolute,
	// 					relative: relative,
	// 					originalEvent: e
	// 				});
	// 			}
	// 			break;

	// 		case 'dblclick':
	// 			context.onDoubleClick({
	// 			 	absolute: absolute,
	// 			 	relative: relative,
	// 				originalEvent: e
	// 			});
	// 			break;
	// 	}
	// }

	/*function rectFrom(rect1, rect2) {
		var rect = {};
		rect.x = Math.min(rect1.x, rect2.x);
		rect.y = Math.min(rect1.y, rect2.y);
		rect.width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - rect.x;
		rect.height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - rect.y;
		return rect;
	}

	function subtract(point1, point2) {
	 	return {   
	 		  x: point1.x - point2.x
	 		, y: point1.y - point2.y
	 	}; 
	}

	function percentage(point, size) {
		return {
			  x: point.x / size.width * 100
			, y: point.y / size.height * 100
		}
	}*/

};function Renderer(options) {
	var options = options || {};
	this.items = options.items;
	this.toElement = options.toElement;
	this.latestDataRendered = [];
};

(function(me) {

	/**
	 * Transform an item array of data objects to HTML using
	 * the provided template function
	 * @param func  pre-compiled template function
	 * @param array array of {
	 * 	 position: 'relative',	
	 * 	 left: 30,  top: 10,
	 * 	 width: 30, height: 20 
	 * }
	 */
	var k = 0;
	me.prototype.render = function(items, defaultTemplate, alwaysUseDefaultTemplate) {
		items = items || this.items || [{}];

		// Allow a single element by turning it into an array
		if($.isArray(items) === false) {
			items = [items];
		}	

		var html = '';
		var i = -1;
		var len = items.length - 1;

		while(i++ < len) {
			// Use custom template provided by item if existing,
			// otherwise use default template
			if(items[i].template && !alwaysUseDefaultTemplate) {
				html += items[i].template(items[i]);
			} else {
				html += defaultTemplate(items[i]);	
			}	
		}
		
		return html;
	}


	me.prototype.write = function(items, toElement, defaultTemplate, ignoreCache, alwaysUseDefaultTemplate) {
		// Optimize rendering by only doing it when item array data has changed 
		if(!ignoreCache && equals(items, this.latestDataRendered)) return;
		this.latestDataRendered = clone(items); 

		toElement = toElement || this.toElement;

		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.style.width = toElement.style.width;
		div.style.height = toElement.style.height;
		div.innerHTML = this.render(items, defaultTemplate, alwaysUseDefaultTemplate);

		// We need a child element inside the Editor div which 
		// we can replace, create if not existing
		if(!toElement.firstChild) {
			var innerDiv = document.createElement('div');
			toElement.appendChild(innerDiv);
		}

		toElement.replaceChild(div, toElement.firstChild);
	}

	var equals = function(x, y)
	{
		if(x == y) return true;

		var p;
		for(p in y) {
			if(typeof(x[p])=='undefined') {return false;}
		}

		for(p in y) {
			if (y[p]) {
				switch(typeof(y[p])) {
					case 'object':
					if (!equals(y[p], x[p])) { return false; } break;
					case 'function':
					if (typeof(x[p])=='undefined' ||
					(p != 'equals' && y[p].toString() != x[p].toString()))
					return false;
					break;
					default:
					if (y[p] != x[p]) { return false; }
				}
			} else {
				if (x[p])
				return false;
			}
		}

		for(p in x) {
			if(typeof(y[p])=='undefined') {return false;}
		}

		return true;
	}

})(Renderer);var Templates = Templates || {};

(function() {
	
	/**
	 * Get the templates defined in the tpl folder in Templates.Raw,
	 * then compile them using doT.js
	 * and store the compiled version in the Templates namespace
	 */
	Templates.compile = function() {	
		for(var name in Templates.Raw) {
			Templates[name] = doT.template(Templates.Raw[name]);
		}
	}

})();
function Grid(renderer, options) {
	this.renderer = renderer;
	this.gridTemplate = Templates.Grid;
	
	var options = options || {};
	this.cellSize = options.cellSize;
	this.width = options.size.cols * this.cellSize.width;
	this.height = options.size.rows * this.cellSize.height;
};

(function(me) {

	/**
	 * Renders a grid in the specified element 
	 * using the cellsize supplied in the options to the current editor   
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	me.prototype.render = function(element) {
		// The renderer work on pure elements not wrapped by jQuery
		if(element instanceof jQuery) element = element.get(0);

		element.style.width = this.width + 1 + 'px';
		element.style.height = this.height + 1 + 'px';

		this.renderer.write({ 
			cellSize: this.cellSize, 
			width: this.width, 
			height: this.height }, element, Templates.Grid, true);
	}

})(Grid);var DragDrop = (function(me) {

	me.current = null;

	return me;
})({});var ElementCollection = (function(me) {

	var elements = {};
	var selectedElement;
	var ghostId = null;
	var cellSize = null;

	me.setCellSize = function(pCellSize) {
		cellSize = pCellSize;
	}

	me.create = function(parent) {
		return new Element(parent, {cellSize: cellSize});
	}

	// add an element to the collection. isGhost can be specified to keep
	// track of which ID:s are drag&drop ghosts which will simplify removal of these 
	// temporary elements. could be generalized later to some kind of 'delete by tag' 
	// or 'modify by tag' when/if needed
	me.add = function(element, isGhost) {
		elements[element.property('id')] = element;
		if(isGhost) {
			ghostId = element.property('id');
			element.template = Templates.ElementGhost;
		}
		$(element).on('change', function() { $(me).trigger('change'); });
		$(me).trigger('change');
	}

	me.remove = function(element) {
		elements[element.id] = null;
		delete elements[element.id];
		$(me).trigger('change');

		// we need to update the results of hasGhost if user removed 
		// the ghost by other means than removeGhost
		if(element.id == ghostId) ghostId = null;
	}

	me.removeGhost = function() {
		me.remove({id: ghostId});
		ghostId = null;
	}

	me.convertGhostToElement = function() {
		var ghost = elements[ghostId];
		ghostId = null;
		ghost.property('contentType', ghost.property('contentType'));
	}

	me.getGhost = function() {
		return elements[ghostId];
	}

	me.hasGhost = function() {
		return ghostId != null;
	}

	me.select = function(elementToSelect) {
		if(elementToSelect == selectedElement) return;
		if(selectedElement) selectedElement.blur();
		selectedElement = elementToSelect;
		if(elementToSelect) elementToSelect.select();
		$(me).trigger('change');
		$(me).trigger({type: 'selection', element: elementToSelect});
	}

	me.getById = function(elementId) {
		return elements[elementId];
	}

	me.getAsArray = function() {
		var elmArray = [];
		for(var i in elements) {
			elmArray.push(elements[i]);
		}
		return elmArray;
	}

	me.getSelected = function() {
		return selectedElement;
	}

	return me;
})({});
var Scene = function(renderer, renderToElement, size, cellSize) {
	var me = {};
	var selectedElementStartPosition;
	var selectedElementStartSize;
	var resizeDirection = 0;
	var resizeDirections = { left: 1, up: 2, right: 4, down: 8 };

	var width = size.cols * cellSize.width;
	var height = size.rows * cellSize.height;

	var $renderToElement = $(renderToElement);

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();
		registerKeyHandler();

		// Render a ghost if user is dragging an element from the library
		$(mouseInput).on('mousemove', function(e) {
			$renderToElement.css('cursor', 'default');

			if(DragDrop.current) {

				if(ElementCollection.hasGhost() == false) {
					var elm = DragDrop.current.createElement(renderToElement);
					ElementCollection.add(elm, 'ghost');
				}

				var ghost = ElementCollection.getGhost();
				// set a x, y, width and height using the item type default 
				// if the width is not set explicitly by the item type
				if(!DragDrop.current.lockedX) ghost.x(e.position.snapped.x - (cellSize.width * 3));
				if(!DragDrop.current.lockedY) ghost.y(e.position.snapped.y - (cellSize.height * 3));					

			} else {

				// Check if mouse is over a resize handle and update the mouse pointer accordingly
				var domElement = $(e.target).closest('.component').get(0);
				var element = getElementByDomElement(domElement);
				if(element && element.selected) {
					var relativeX = e.position.absolute.x - element.x();
					var relativeY = e.position.absolute.y - element.y();
					var resizeLeft = relativeX < 8;
					var resizeUp = relativeY < 8;
					var resizeRight = relativeX >= element.width() - 8;
					var resizeDown = relativeY >= element.height() - 8;

					if(element.selected) {
						if(resizeUp && resizeLeft) $renderToElement.css('cursor', 'nw-resize');
						else if(resizeUp && resizeRight) $renderToElement.css('cursor', 'ne-resize');
						else if(resizeDown && resizeLeft) $renderToElement.css('cursor', 'sw-resize');
						else if(resizeDown && resizeRight) $renderToElement.css('cursor', 'se-resize');
					
						else if(resizeLeft) $renderToElement.css('cursor', 'w-resize');
						else if(resizeUp) $renderToElement.css('cursor', 'n-resize');
						else if(resizeRight) $renderToElement.css('cursor', 'e-resize');
						else if(resizeDown) $renderToElement.css('cursor', 's-resize');
						else $renderToElement.css('cursor', 'default');
					} else {
						ElementCollection.select(element);
					} 
				}
			}

		});


		// If a element from the library is dropped over the scene, then create it
		$(mouseInput).on('mouseup', function(e) {
			var isInsideScene = e.position.absolute.x < width &&
								e.position.absolute.y < height;
			
			resizeDirection = 0;
			if(DragDrop.current) {
				if(isInsideScene) {					
					//var elm = DragDrop.current.createElement(renderToElement);
					// set a x, y, width and height using the item type default 
					// if the width is not set explicitly by the item type
					
					var elm = ElementCollection.getGhost();
					ElementCollection.convertGhostToElement();
					// if(!DragDrop.current.lockedX) elm.x(e.position.snapped.x - (cellSize.width * 3));
					// if(!DragDrop.current.lockedY) elm.y(e.position.snapped.y - (cellSize.height * 3));					

					// ElementCollection.add(elm);
					ElementCollection.select(elm);
				} else {
					// Render just to get rid of the ghost element if the mouse was 
					// slightly outside of the scene, but with a part of the element inside
					me.render(ElementCollection.getAsArray());
				}
			}
		});

		// Select the element if the user clicks on it
		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
			if(element) {
				var relativeX = e.position.absolute.x - element.x();
				var relativeY = e.position.absolute.y - element.y();
				
				var resizeLeft = relativeX < 8;
				var resizeUp = relativeY < 8;
				var resizeRight = relativeX >= element.width() - 8;
				var resizeDown = relativeY >= element.height() - 8;
				
				selectedElementStartPosition = { x: element.x(), y: element.y() };
				selectedElementStartSize = { width: element.width(), height: element.height() };

				resizeDirection = 0;
				if(element.selected) {
					// Did the user click on a resize handle?
					if(resizeLeft) resizeDirection |= resizeDirections.left;
					if(resizeUp) resizeDirection |= resizeDirections.up;
					if(resizeRight) resizeDirection |= resizeDirections.right;
					if(resizeDown) resizeDirection |= resizeDirections.down;
				} else {
					ElementCollection.select(element);
				}
			} else {
				ElementCollection.select(null); // Deselect elements if clicked outside
			}
		})

		// Clicks outside of the scene in the gray area should remove selection
		// (Unfortunately this area is currently also named 'scene', change this)
		$(renderToElement).closest('.sceneContainer').on('mousedown', function(e) {
			// Only catch clicks that specifically hits the area outside of the editor
			if($(e.target).is('.sceneContainer')) ElementCollection.select(null);
		});

		// Move elements if dragged
		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {

				// No resize is in progress, move the element on drag
				if(resizeDirection == 0) {
					selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x, 'absolute');
					selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y, 'absolute');
				} 

				// No else if:s to enable diagonal resize (when resizeDirection is up and left at the same time)
				if(resizeDirection & resizeDirections.left) {
					selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x, 'absolute');
					selectedElement.width(selectedElementStartSize.width - e.delta.snapped.x, 'absolute');
				}
				if(resizeDirection & resizeDirections.up) {
					selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y, 'absolute');
					selectedElement.height(selectedElementStartSize.height - e.delta.snapped.y, 'absolute');
				}
				if(resizeDirection & resizeDirections.right) {
					selectedElement.width(selectedElementStartSize.width + e.delta.snapped.x, 'absolute');
				}
				if(resizeDirection & resizeDirections.down) {
					selectedElement.height(selectedElementStartSize.height + e.delta.snapped.y, 'absolute');
				}


			}
		});
	};

	// Will move elements when using Alt + Arrow keys
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyLeft = 	37;
			var keyUp = 38;
			var keyRight = 39;
			var keyDown = 40;
			var keyEscape = 27;
			var keyE = 69;

			// alt + shift + arrows: Resize current Element
			if(e.altKey && e.shiftKey) {
				// Find which element is selected and ignore if no selection
				// Then resize it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.width(selectedElement.width() - cellSize.width);
				if(e.keyCode == keyUp) 		selectedElement.height(selectedElement.height() - cellSize.height);
				if(e.keyCode == keyRight) 	selectedElement.width(selectedElement.width() + cellSize.width);
				if(e.keyCode == keyDown) 	selectedElement.height(selectedElement.height() + cellSize.height);
				selectedElement.invalidate();
			}

			// alt + arrows: Move current Element
			if(e.altKey && !e.shiftKey) {
				// Find which element is selected and ignore if no selection
				// Then move it!
				var selectedElement = ElementCollection.getSelected();
				if(!selectedElement) return;
				if(e.keyCode == keyLeft)	selectedElement.x(selectedElement.x() - cellSize.width);
				if(e.keyCode == keyUp) 		selectedElement.y(selectedElement.y() - cellSize.height);
				if(e.keyCode == keyRight) 	selectedElement.x(selectedElement.x() + cellSize.width);
				if(e.keyCode == keyDown) 	selectedElement.y(selectedElement.y() + cellSize.height);
				selectedElement.invalidate();
			}

			 // ctrl + number keys: Create an element with the corresponding index from the library
			 if(e.ctrlKey && e.keyCode > 48 && e.keyCode < 58) {

				// get the element from library by index
				var libraryElementIndex = e.keyCode - 49;
				var libraryElement = null;
				var i = 0;
				for(var key in Library.elements) {
					if(i++ == libraryElementIndex) libraryElement = Library.elements[key];
				}
				if(!libraryElement) return;
				var elm = libraryElement.createElement(renderToElement);
				if(isNaN(elm.width())) elm.width(4 * cellSize.width);
				if(isNaN(elm.height())) elm.height(4 * cellSize.height);
				if(isNaN(elm.x())) elm.x((~~(size.cols / 2) - 2) * cellSize.width);
				if(isNaN(elm.y())) elm.y((~~(size.rows / 2) - 2) * cellSize.height);					
				ElementCollection.add(elm);
				ElementCollection.select(elm);
			}

			// alt + e will print an array of the current Elements to the console
			if(e.altKey && e.keyCode == keyE) {
				console.log(ElementCollection.getAsArray());
			}

			// escape: Remove current selection
			if(e.keyCode == keyEscape) {
				ElementCollection.select(null);
			}
		});
	}

	me.render = function(elements) {
		renderer.write(elements, renderToElement);
	}

	function getElementByDomElement(domElement) {
		if(!domElement) return;
		var elements = ElementCollection.getAsArray(); 
		for(var i in elements) {
			if(domElement.id == 'element_' + elements[i].property("id")) {
				// Elements that are locked should not be selectable
				if(!elements[i].property('locked')) return elements[i];
			}
		}
	}

	return me;
}
function Element(parent, options) {

	if(parent == null) throw "Parent for Element cannot be null";
	options = options || {};
	this.properties = {};

	this.cellSize = options.cellSize;

	$(this).on('contentTypeChange', this.onContentTypeChanged);

	if(options.id) this.property('id', options.id) 
	else this.generateNewId();

	this.property('positionType', options.positionType || 'absolute');
	this.property('parent', parent);
	
	this.parentWidth = $(parent).width();
	this.parentHeight = $(parent).height();
	this.template = Templates.Element;
	this.selected = false;

	// for(var key in options) {
	// 	if(this.hasProperty(key) == false) {
	// 		this.property(key, options[key]);
	// 	}
	// }


};

Element.idCounter = 0;

Element.prototype.properties = {};

Element.prototype.property = function(key, value) {
	if(value == null) {
		return this.properties[key];
	} else {
		if(this.properties[key] != value) {
			this.properties[key] = value;
			$(this).trigger(key + 'Change'); // widthChange, paddingChange etc
		}
	}
}

Element.prototype.hasProperty = function(key) {
	return this.properties.hasOwnProperty(key);
}

Element.prototype.toggleProperty = function(key) {
	this.property(key, !this.properties[key]);
}

Element.prototype.generateNewId = function() {
	this.property('id', Element.idCounter++);
}

Element.prototype.select = function() {
	this.template = Templates.ElementSelected;
	this.selected = true;
}

Element.prototype.blur = function() {
	this.template = Templates.Element;
	this.selected = false;
}

Element.prototype.onContentTypeChanged = function() {
	var contentType = this.property('contentType');
	this.contentTemplate = Templates['ElementType' + contentType];
	if(!this.contentTemplate) console.log('Warning: Could not find Content Template for Element type', value);
	}

// Should be called after raw attributes has been changed, like for example text
// to notify this object and other listener about the change
Element.prototype.invalidate = function(property) {
	if(property) $(this).trigger('change' + property);
	$(this).trigger('change');
}

Element.prototype.getOptions = function() {
	var options = {};
	for(var i in this) {
		if(!this.hasOwnProperty(i)) continue;
		if(typeof this[i] == 'function') continue;
		options[i] = this[i];
	}
	return options;
}

function getStandardPositionFrom(value, positionType, parentWidthOrHeight, cellSize) {
	if(positionType == 'relative') return value;
	if(positionType == 'absolute') return value / parentWidthOrHeight * 100;
	if(positionType == 'cells') {
		var absolute = value * cellSize;
		var relative = absolute / parentWidthOrHeight * 100;
		return relative;
	}
}

Element.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			return this._x;
		else {
			return this._x / 100 * this.parentWidth;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value < 0) value = 0;
		if(value != this._x) {
			this._x = value;
			this.invalidate('x');
		}
	}
};

Element.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this._y;
		else return this._y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value < 0) value = 0;
		if(value != this._y) {
			this._y = value;
			this.invalidate('y');
		}
	}
};

Element.prototype.width = function(value, positionType) {
	if(value == null)
		if(positionType == "relative")
			 return this._width;
		else return this._width / 100 * this.parentWidth;
	  else {
	  	value = getStandardPositionFrom(value, positionType, this.parentWidth, this.cellSize.width);
	  	if(value != this._width) {
	  		this._width = value;
			this.invalidate('width');	
		}
	}
};

Element.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this._height;
		else return this._height / 100 * this.parentHeight;
	else 
	  	value = getStandardPositionFrom(value, positionType, this.parentHeight, this.cellSize.height);
	  	if(value != this._height) {
	  		this._height = value;
			this.invalidate('height');	
		}
};

function Layers(renderer) {

	var renderToElement;
	var loadedElements;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		renderToElement = elementContainer;
		
		// Check for mouse down on items
		var mouseInput = new MouseInput(renderToElement, null, true);
		mouseInput.start();
		$(mouseInput).on('mousedown', onItemDown.bind(this));

		registerKeyHandler();

		// And render it (currently with no elements)
		this.render([]);
	}

	// Will select the element in the ElementCollection on click
	function onItemDown(e) {
		var $target = $(e.target);


		var elementId  = $(e.target).closest('.layer-element').data('element-id');
		var element = ElementCollection.getById(elementId);

		if($target.is('.layer-element')) {
			ElementCollection.select(element);
		} else if($target.closest('.attribute-locked').length > 0) {
			element.toggleProperty('locked');
			element.invalidate();
		} else if($target.closest('.attribute-position').length > 0) {
			element.property('positionType', (element.property('positionType') == 'absolute') ? 'relative' : 'absolute');
			element.invalidate();
		}
	}

	// Will switch selection between elements with Shift+Up and Shift+Down
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyDown = 40;
			var keyUp = 38;
			var keyD = 68;

			// shift + up/down will move elemnt selection up and down 
			if(e.shiftKey && !e.altKey) {
				// Find which element in the layer list is selected
				var selectedElement = ElementCollection.getSelected();
				var selectedLayerIndex = -1;
				for(var i in loadedElements) {
					if(loadedElements[i] == selectedElement) selectedLayerIndex = i;
				}

				if(e.keyCode == keyDown) {
					var selectLayerIndex = parseInt(selectedLayerIndex) + 1;
					if(selectLayerIndex >= loadedElements.length) selectLayerIndex = 0;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
				if(e.keyCode == keyUp) {
					var selectLayerIndex = parseInt(selectedLayerIndex) - 1;
					if(selectLayerIndex < 0) selectLayerIndex = loadedElements.length - 1;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
			}

			// alt + d will duplicate current element
			if(e.altKey && !e.shiftKey && e.keyCode == 68) {
				var selectedElementOptions = ElementCollection.getSelected().getOptions();
				var duplicateElement = new Element(selectedElementOptions.parent, selectedElementOptions);
				duplicateElement.generateNewId(); // Otherwise the new element will inherit the id from the old dupliate
				ElementCollection.add(duplicateElement);
				ElementCollection.select(duplicateElement);
			}
		});
	}

	this.render = function(elements) {
		loadedElements = cloneArrayShallow(elements);
		loadedElements.reverse(); // reverse our copy to get latest layer at top
		renderer.write(loadedElements, renderToElement, Templates.Layer, true, true);
	}

}var PropertyPanel = (function(me) { 

	me.show = function(element, renderer, renderToElement, x, y) {

		// we only handle one PropertyPanel at once, close all others
		me.closeAll();

		// and render the panel with current element
		render();
		
		function render() {

			var templateName = 'Properties' + element.property('contentType');
			var template = Templates[templateName];
			if(!template) console.log("Warning: Property Template for Element type ", element.type, "not found");

			renderer.write({ element: element, x: x,  y: y }, renderToElement, template, false, true);
			setTimeout(function() { $('.propertyPanel input').first().select() }, 0)
		}

		// Save properties directly on each keystroke. Determine which property
		// should be modified by looking at the inputs data-property attribute
		$('.propertyPanel').on('keyup', 'input[data-property]', function(e) {
			var input = $(e.currentTarget);
			var property = input.data('property');			
			element.property(property, input.val());
			element.invalidate();
		});

		// A click on an element with the class .btn-delete in the properties template is treated as a delete button 
		$('.propertyPanel').on('click', '.btn-delete', removeElement);

		// shift + delete or shift + backspace will delete the current element
		$('body').on('keydown.propertyPanel', function(e) {
			var keyDelete = 46;
			var keyBackspace = 8;
			if(e.shiftKey && (e.keyCode == keyDelete || e.keyCode == keyBackspace)) {
				removeElement();
			}
		});

		// Remove the element for this PropertyPanel when the remove/delete button is clicked and close this panel
		function removeElement() {
			
			// TODO: Select next element in list before Delete

			// Remove the element
			ElementCollection.remove(element);		 
			
			// Since this PropertyPanels element is removed there is no purpose to leave it open
			me.closeAll();
		}
	}

	me.closeAll = function() {
		$('body').off('keydown.propertyPanel');
		$('.propertyPanel').remove();
	}

	return me;
})({});function Library(renderer) {

	var element;
	var $ghostLibraryElement;
	var ghostLibraryElement;
	var ghostStartPosition;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		element = elementContainer;
		
		var mouseInput = new MouseInput(element, null, true);
		mouseInput.start();

		$(mouseInput).on('mousedown', onItemDown);
		$(mouseInput).on('drag', onItemDragged);
		$(mouseInput).on('mouseup', onItemUp);

		render();
	}

	function onItemDown(e) {
		$ghostLibraryElement = $(e.target).closest('.library-element');
		ghostLibraryElement = Library.elements[$ghostLibraryElement.data('key')];
		ghostStartPosition = $ghostLibraryElement.offset();
		DragDrop.current = ghostLibraryElement;
	}

	function onItemDragged(e) {
		if($('.library-ghost').size() == 0) {
			var $ghost = $(renderer.render(ghostLibraryElement, Templates.LibraryGhost));
			$ghost.appendTo('body');
		}

		var $ghost = $('.library-ghost');

		$ghost.css('left', ghostStartPosition.left + e.delta.absolute.x);
		$ghost.css('top', ghostStartPosition.top + e.delta.absolute.y);
	}

	function onItemUp(e) {

		$ghostLibraryElement = $(e.target).closest('.library-element');
		$('.library-ghost').remove();
		
		// set timeout to let listeners of mouseup retrieve the dragdrop data before it's cleared
		setTimeout(function() {
			DragDrop.current = null;
		}, 0);
	}

	function render() {
		// Library.Elements is an object with items like Library.Elements.Text for easy access,
		// we need to convert it into a true array before rendering the items
		var elementsArray = [];
		for(var i in Library.elements) elementsArray.push(Library.elements[i]);
		renderer.write(elementsArray, element, Templates.LibraryElement);
	}

}var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {
	function me() {

    }

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Text');  
        elm.property('padding', 0); 
        elm.property('valign', 'top');  
        elm.property('halign', 'left');
        elm.property('background', 'transparent');
        elm.property('foreground', 'white');
        elm.property('padding', 0);
        elm.property('text', '');
        elm.width(6, 'cells');
        elm.height(2, 'cells');
        return elm;
    }
    
    me.key = "Text";
	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';

    Library.elements[me.key] = me;
})();var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Image');  
        elm.property('background', 'transparent');  
        elm.property('valign', 'top');  
        elm.property('halign', 'left');  
        elm.property('stretch', 'width');
        elm.width(4, 'cells');
        elm.height(4, 'cells');
        return elm;
    }

    me.key = "Image";
	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';

    Library.elements[me.key] = me;    
})();var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    function me() {
        
    }

    me.createElement = function(parent) {
        var elm = ElementCollection.create(parent);
        elm.property('contentType', 'Image');
        elm.property('background', 'transparent');
        elm.property('valign', 'top');
        elm.property('halign', 'left');
        elm.property('image', 'http://upload.wikimedia.org/wikipedia/commons/3/3e/Tree-256x256.png');  
        elm.property('stretch', 'width');
        elm.width(10, 'cells');
        elm.height(10, 'cells');
        return elm;
    }

    me.key = "Sample";
    me.title = 'Image (Tree)';
    me.description = 'An image with a preset sample URL';
    
    Library.elements[me.key] = me;
})();var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    function me() {
        
    }

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        elm.property('contentType', 'Text');
        elm.property('background', '-webkit-linear-gradient(top, #333333 0%, #303030 50%, #292929 51%, #202020 100%);');
        elm.property('foreground', 'white');
        elm.property('text', 'Header');
        elm.property('valign', 'middle');
        elm.property('halign', 'center');
        elm.property('positionType', 'relative');
        elm.property('padding', '0');

        elm.x(0, 'relative');
        elm.y(0, 'relative');
        elm.width(100, 'relative');
        elm.height(3, 'cells');
        return elm;
    }

    me.key = "Header";
    me.title = 'Header';
    me.description = 'A predefined Titlebar';

    me.lockedX = true;
    me.lockedY = true;

    Library.elements[me.key] = me;
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Element = '	<div id="element_{{=it.property("id")}}" 	 	 class="component button"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background: {{=it.property	("background")}}">		<div class="content">			{{=it.contentTemplate(it)}}		</div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementSelected = '	<div id="element_{{=it.property("id")}}" 	 	 class="component button"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background: {{=it.property("background")}}	 	     	">		<div class="content">			{{=it.contentTemplate(it)}}		</div>		 	<div class="resizeBorder"></div>	 	<div class="resizeBox resizeBox-topleft"></div>	 	<div class="resizeBox resizeBox-topright"></div>	 	<div class="resizeBox resizeBox-bottomleft"></div>	 	<div class="resizeBox resizeBox-bottomright"></div>	 		 	<div class="resizeBox resizeBox-middleleft"></div>	 	<div class="resizeBox resizeBox-middleright"></div>	 	<div class="resizeBox resizeBox-middletop"></div>	 	<div class="resizeBox resizeBox-middlebottom"></div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementGhost = '	<div id="element_{{=it.property("id")}}" 	 	 class="component button"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background: none;	 	     	border: 1px solid #3276a9;	 	     	">		<div class="content">					</div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementTypeText = '    <div style="display: table-cell;                vertical-align: {{=it.property("valign")}};                text-align: {{=it.property("halign")}};                width: {{=it.width(null, "absolute")}}px;                height: {{=it.height(null, "absolute")}}px;                font-family: helvetica;                font-size: 14px;                color: {{=it.property("foreground")}};                padding: {{=it.property("padding")}}px;">	  {{=it.property("text")}}        </div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementTypeImage = '	<div>	 	{{?it.hasProperty("image") && it.property("image") != "null"}}			<div style="position: absolute;                        background: url({{=it.property("image")}}) no-repeat {{=it.property("halign")}} {{=it.property("valign")}};                         {{?it.property("stretch") == "width"}}            			    background-size: {{=it.width(null, "absolute")}}px auto;						{{?}}                        {{?it.property("stretch") == "height"}}                            background-size: auto {{=it.height(null, "absolute")}}px;                        {{?}}                        {{?it.property("stretch") == "fill"}}                            background-size: {{=it.width(null, "absolute")}}px {{=it.height(null, "absolute")}}px;                        {{?}}                        width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.PropertiesText = '	<div class="propertyPanel" style="left: {{=it.x}}px; top: {{=it.y}}px;">		<div class="propertyPanel-header">Text Properties</div>				<div class="properties">			<div class="property">				<div class="property-label">Text</div>				<div class="property-input"><input type="text" value="{{=it.element.property("text")}}" data-property="text" /></div>			</div>			<div class="property">				<div class="property-label">Bg</div>				<div class="property-input"><input type="text" value="{{=it.element.property("background")}}" data-property="background" /></div>			</div>			<div class="property">				<div class="property-label">Fg</div>				<div class="property-input"><input type="text" value="{{=it.element.property("foreground")}}" data-property="foreground" /></div>			</div>			<div class="property">				<div class="property-label">Halign</div>				<div class="property-input"><input type="text" value="{{=it.element.property("halign")}}" data-property="halign" /></div>			</div>			<div class="property">				<div class="property-label">Valign</div>				<div class="property-input"><input type="text" value="{{=it.element.property("valign")}}" data-property="valign" /></div>			</div>			<div class="property">				<div class="property-label">Padding</div>				<div class="property-input"><input type="text" value="{{=it.element.property("padding")}}" data-property="padding" /></div>			</div>			<div class="property">				<div class="btn btn-delete">Remove</div>			</div>		</div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.PropertiesImage = '	<div class="propertyPanel" style="left: {{=it.x}}px; top: {{=it.y}}px;">		<div class="propertyPanel-header">Image Properties</div>				<div class="properties">			<div class="property">				<div class="property-label">Url</div>				<div class="property-input"><input type="text" value="{{?it.element.hasProperty("image")}}{{=it.element.property("image")}}{{?}}" data-property="image" /></div>			</div>			<div class="property">				<div class="property-label">Bg</div>				<div class="property-input"><input type="text" value="{{=it.element.property("background")}}" data-property="background" /></div>			</div>			<div class="property">				<div class="property-label">Stretch</div>				<div class="property-input"><input type="text" value="{{=it.element.property("stretch")}}" data-property="stretch" /></div>			</div>			<div class="property">				<div class="property-label">Valign</div>				<div class="property-input"><input type="text" value="{{=it.element.property("valign")}}" data-property="valign" /></div>			</div>			<div class="property">				<div class="property-label">Halign</div>				<div class="property-input"><input type="text" value="{{=it.element.property("halign")}}" data-property="halign" /></div>			</div>			<div class="property">				<div class="btn btn-delete">Remove</div>			</div>		</div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Grid = '	<div class="grid-root">	{{ for(var x = 0; x < it.width + 1; x++ ) { }}		<div class="grid-line" style="				left: {{=x * it.cellSize.width}}px; 				top: 0px;				width: 1px; 				height: 800px;"></div>	{{ } }}	{{ for(var y = 0; y < it.height + 1; y++ ) { }}		<div class="grid-line" style="				left: 0px; 				top: {{=y * it.cellSize.height}}px;				width: 800px; 				height: 1px;"></div>			{{ } }}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Layer = '	<div class="layer-element {{?it.selected}}layer-element-selected{{?}}" data-element-id="{{=it.property("id")}}">		<div class="layer-element-attributes">			<div class="attribute attribute-locked">				{{?it.property("locked")}}					<i class="icon-lock"></i>				{{??}}					<i class="icon-unlock"></i>				{{?}}			</div>			<div class="attribute attribute-position">				{{?it.property("positionType") == "absolute"}}					<i class="icon-move"></i>				{{??}}					<i class="icon-asterisk"></i>				{{?}}</div>			<div class="attribute attribute-bg" style="background-color: {{=it.property("background")}}"></div>		</div>		{{?it.property("text")}}			{{=it.property("text")}}		{{??}}			{{=it.property("contentType")}} Element		{{?}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.LibraryElement = '	<div class="library-element" data-key="{{=it.key}}">		<h1 class="library-header">{{=it.title}}</h1>		<p class="library-description">{{=it.description}}</p>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.LibraryGhost = '	<div class="library-element library-ghost">		<h1 class="library-header">{{=it.title}}</h1>		<p class="library-description">{{=it.description}}</p>	</div>';
	// Auto-Compile templates from the tpl folder (and store in the Templates namespace)
	Templates.compile();

	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;

})(jQuery);