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

	// Resize the editor element to match the size specified in options
	elmEditor.style.width = width * cellSize.width + 'px';
	elmEditor.style.height = height * cellSize.height + 'px';

	// Initialize modules 
	var interactions = new Interactions();
	var renderer = new Renderer();
	var grid = new Grid(renderer, { cellSize: cellSize, width: width, height: height });
	var library = new Library(renderer);
	var layers = new Layers(renderer);
	var scene = new Scene(renderer, elmEditor, cellSize);

	$(ElementCollection).on('change', function() { me.render(); });
	$(ElementCollection).on('selection', function(e) {
		var element = e.element;	
		if(element) {
			PropertyPanel.show(element, renderer, document.body, 190, 100);
		} else {
			PropertyPanel.closeAll();
		}
	});

	me.load = function() {
		scene.init();
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
			$me.trigger({ type: 'mousemove', position: position, originalEvent: e });
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
		var position = $element.position();	
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
	this.cellSize = options.cellSize || { width: 5, height: 5 };
	this.width = options.width || 12;
	this.height = options.height || 25;
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

		element.style.width = this.width * this.cellSize.width + 1 + 'px';
		element.style.height = this.height * this.cellSize.height + 1 + 'px';

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

	me.add = function(element) {
		elements[element.id] = element;
		$(element).on('change', function() { $(me).trigger('change'); });
		$(me).trigger('change');
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
var Scene = function(renderer, renderToElement, cellSize) {
	var me = {};
	

	me.init = function() {

		var mouseInput = new MouseInput(renderToElement, cellSize);
		mouseInput.start();

		$(mouseInput).on('mousemove', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.ElementGhost;
				renderer.write(ElementCollection.getAsArray().concat(elm), renderToElement);
			}
		});

		$(mouseInput).on('mouseup', function(e) {
			if(DragDrop.current) {
				var elm = new Element(renderToElement);
				elm.x(e.position.snapped.x - (cellSize.width * 3));
				elm.y(e.position.snapped.y - (cellSize.height * 3));
				elm.width(cellSize.width * 6);
				elm.height(cellSize.height * 6);
				elm.template = Templates.Element;
				ElementCollection.add(elm);
				ElementCollection.select(elm);
			}
		});

		$(mouseInput).on('mousedown', function(e) {
			var domElement = $(e.target).closest('.component').get(0);
			var element = getElementByDomElement(domElement);
			ElementCollection.select(element);
			if(element) {
				selectedElementStartPosition = { x: element.x(), y: element.y() };
			}
		})

		$(mouseInput).on('drag', function(e) {
			var selectedElement = ElementCollection.getSelected();
			if(selectedElement) {
				selectedElement.x(selectedElementStartPosition.x + e.delta.snapped.x);
				selectedElement.y(selectedElementStartPosition.y + e.delta.snapped.y);
				me.render(ElementCollection.getAsArray());
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
			if(domElement.id == 'element_' + elements[i].id) return elements[i];
		}
	}

	return me;
}
function Element(parent, options) {
	if(parent == null) throw "Parent for Element cannot be null";
	options = options || {};

	this.template = Templates.Element;

	// Parent
	this.parentWidth = $(parent).width();
	this.parentHeight = $(parent).height(); 

	// ID and text
	this.id = Element.idCounter++;
	
	// Position
	this.positionType = options.positionType || 'absolute';
	this.rect = { x: 0, y: 0, width: 0, height: 0 };
	this.x(options.x || 0, this.positionType);
	this.y(options.y || 0, this.positionType);
	this.width(options.width || 0, this.positionType);
	this.height(options.height || 0, this.positionType);
	
	// States
	this.showPositionType = options.showPositionType || false;
	this.isMoving = options.isMoving || false;

	// Colors, text and image
	this.text = options.text || 'New Element';
	this.background = options.background || '#3276a9';
	this.foreground = options.foreground || '#ffffff';
	this.image = options.image || null;
	this.customClass = options.customClass;

	this.selected = false;
};

Element.idCounter = 0;

Element.prototype.select = function() {
	this.template = Templates.ElementSelected;
	this.selected = true;
}

Element.prototype.blur = function() {
	this.template = Templates.Element;
	this.selected = false;
}

// Should be called after raw attributes has been changed, like for example text
// to notify this object and other listener about the change
Element.prototype.invalidate = function() {
	$(this).trigger('change');
}

Element.prototype.getExport = function() {
	return {
		position: this.positionType,
		rect: {
			x: this.x(null, this.positionType),
			y: this.y(null, this.positionType),
			width: this.width(null, this.positionType),
			height: this.height(null, this.positionType)
		},
		text: this.text,
		background: this.background,
		foreground: this.foreground,
		image: this.image
	};
}

Element.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			return this.rect.x;
		else {
			return this.rect.x / 100 * this.parentWidth;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value < 0) value = 0;
		//if(value + this.rect.width <= 100) 
		this.rect.x = value;
	}
};

Element.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this.rect.y;
		else return this.rect.y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value < 0) value = 0;
		//if(value + this.rect.height <= 100) 
		this.rect.y = value;
	}
};

Element.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative")
			 return this.rect.width;
		else return this.rect.width / 100 * this.parentWidth;
	else {
		if(positionType == "relative")		
			 this.rect.width = value;
		else this.rect.width = value / this.parentWidth * 100;	
	}
};

Element.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this.rect.height;
		else return this.rect.height / 100 * this.parentHeight;
	else 
		if(positionType == "relative") 
			 this.rect.height = value;
		else this.rect.height = value / this.parentHeight * 100;
};

function Layers(renderer) {

	var renderToElement;
	var loadedElements;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		renderToElement = elementContainer;
		
		var mouseInput = new MouseInput(renderToElement, null, true);
		mouseInput.start();

		$(mouseInput).on('mousedown', onItemDown.bind(this));

		this.render([]);
	}

	function onItemDown(e) {
		var elementId  = $(e.target).data('element-id');
		var element = ElementCollection.getById(elementId);
		ElementCollection.select(element);
	}

	this.render = function(elements) {
		loadedElements = cloneArrayShallow(elements);
		loadedElements.reverse(); // reverse our copy to get latest layer at top
		renderer.write(loadedElements, renderToElement, Templates.Layer, false, true);
	}

}var PropertyPanel = (function(me) { 

	me.show = function(element, renderer, renderToElement, x, y) {

		// we only handle one PropertyPanel at once
		me.closeAll();

		render();
		
		function render() {
			renderer.write({ element: element, x: x,  y: y }, renderToElement, Templates.PropertiesText, false, true);
			setTimeout(function() { $('.propertyPanel input').first().select() }, 0)
		}

		$('.propertyPanel').on('keyup', 'input[data-property]', function(e) {

			var input = $(e.currentTarget);
			var property = input.data('property');
			
			element[property] = input.val();
			element.invalidate();

		});

	}

	me.closeAll = function() {
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
		ghostLibraryElement = Library.elements[$ghostLibraryElement.data('title')];
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

	me.title = 'Text';
	me.description = 'Used for captions, notices of any other kind of message';


	Library.elements.Text = me; //merge(me, Element);

})();var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

	function me() {
		
	}

	me.title = 'Image';
	me.description = 'Import an image you have already created from a URL';

	Library.elements.Image = me; //merge(me, Element);

})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Element = '	<div id="element_{{=it.id}}" 	 	 class="component button {{=it.resizeDir}} 	 		    {{?it.isMoving}}isMoving{{?}}	 	     	{{?it.image}}hasImage{{?}}"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background-color: {{=it.background}}	 	     	">	 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat left top; position: absolute;						background-size: {{=it.width(null, "absolute")}}px auto;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}		<div class="content" style="color: {{=it.foreground}}">			{{=it.text}}		</div>	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Preselection = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component preselection {{=it.customClass || ""}}				{{?it.image}}hasImage{{?}}" 	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;">	 		 		 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat center center; position: absolute;						background-size: {{=it.width(null, "absolute")}}px auto;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}		<span class="label label-info" style="position: absolute; 											  top: 50%; 											  left: 50%; 											  margin-top: -9px; 											  margin-left: -35px;">			{{=Math.round(it.width(null, it.position))}}{{#def.unit}} 			<span style="color: #2A779D;">x</span> 			{{=Math.round(it.height(null, it.position))}}{{#def.unit}}		</span>			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementSelected = '	<div id="element_{{=it.id}}" 	 	 class="component button {{=it.resizeDir}} 	 		    {{?it.isMoving}}isMoving{{?}}	 	     	{{?it.image}}hasImage{{?}}"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background-color: {{=it.background}}	 	     	">	 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat left top; position: absolute;						background-size: {{=it.width(null, "absolute")}}px auto;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}		<div class="content" style="color: {{=it.foreground}}">			{{=it.text}}		</div>	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}	 	<div class="resizeBorder"></div>	 	<div class="resizeBox resizeBox-topleft"></div>	 	<div class="resizeBox resizeBox-topright"></div>	 	<div class="resizeBox resizeBox-bottomleft"></div>	 	<div class="resizeBox resizeBox-bottomright"></div>	 		 	<div class="resizeBox resizeBox-middleleft"></div>	 	<div class="resizeBox resizeBox-middleright"></div>	 	<div class="resizeBox resizeBox-middletop"></div>	 	<div class="resizeBox resizeBox-middlebottom"></div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.ElementGhost = '	<div id="element_{{=it.id}}" 	 	 class="component button {{=it.resizeDir}} 	 		    {{?it.isMoving}}isMoving{{?}}	 	     	{{?it.image}}hasImage{{?}}"	 	 style="left: {{=it.x(null, "absolute")}}px;	 	     	top: {{=it.y(null, "absolute")}}px;	 	     	width: {{=it.width(null, "absolute")}}px;	 	     	height: {{=it.height(null, "absolute")}}px;	 	     	background: none;	 	     	border: 1px solid {{=it.background}};	 	     	">	 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat left top; position: absolute;						background-size: {{=it.width(null, "absolute")}}px auto;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}		<div class="content" style="color: {{=it.foreground}}">					</div>	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.PropertiesText = '	<div class="propertyPanel" style="left: {{=it.x}}px; top: {{=it.y}}px;">		<div class="propertyPanel-header">Properties</div>				<div class="properties">			<div class="property">				<div class="property-label">Text</div>				<div class="property-input"><input type="text" value="{{=it.element.text}}" data-property="text" /></div>			</div>			<div class="property">				<div class="property-label">Bg</div>				<div class="property-input"><input type="text" value="{{=it.element.background}}" data-property="background" /></div>			</div>			<div class="property">				<div class="property-label">Fg</div>				<div class="property-input"><input type="text" value="{{=it.element.foreground}}" data-property="foreground" /></div>			</div>		</div>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Grid = '	<div class="grid-root">	{{ for(var x = 0; x < it.width + 1; x++ ) { }}		<div class="grid-line" style="				left: {{=x * it.cellSize.width}}px; 				top: 0px;				width: 1px; 				height: 800px;"></div>	{{ } }}	{{ for(var y = 0; y < it.height + 1; y++ ) { }}		<div class="grid-line" style="				left: 0px; 				top: {{=y * it.cellSize.height}}px;				width: 800px; 				height: 1px;"></div>			{{ } }}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Layer = '	<div class="element {{?it.selected}}element-selected{{?}}" data-element-id="{{=it.id}}">		<div class="element-attributes">			<div class="attribute attribute-position">{{?it.positionType == "absolute"}}A{{??}}R{{?}}</div>			<div class="attribute attribute-bg" style="background-color: {{=it.background}}"></div>		</div>		{{=it.text}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.LibraryElement = '	<div class="library-element" data-title="{{=it.title}}">		<h1 class="library-header">{{=it.title}}</h1>		<p class="library-description">{{=it.description}}</p>	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.LibraryGhost = '	<div class="library-element library-ghost">		<h1 class="library-header">{{=it.title}}</h1>		<p class="library-description">{{=it.description}}</p>	</div>';
	// Auto-Compile templates from the tpl folder (and store in the Templates namespace)
	Templates.compile();

	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;

})(jQuery);