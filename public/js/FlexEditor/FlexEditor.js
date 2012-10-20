(function($) {
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

	me.getExport = function() {
		return me.buttons;
	};


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
				},
				
				// On cancelled, just re-render already stored me.buttons to clear preselection
				onCancelled: function() {
					renderer.write(Templates.Button, me.buttons);
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

// background-size: 10% 10%, 10% 10%;

function GridRenderer() {


};

(function(me) {

	// Beware: Vertical gridlines disappear for unknown reason
	// around 644-750 (caused by pixel rounding?) 
	me.prototype.render = function(element, cellSize) {
		$(element).addClass('grid-single');

		// var unit = '%';
		var unit = '%';

		// var elementWidth = $(element).width();
		// var elementHeight = $(element).height();

		// var absoluteWidth = (cellSize.width / 100) * elementWidth;
		// var absoluteHeight = (cellSize.height / 100) * elementHeight;

		// var width = ~~absoluteWidth + unit;
		// var height = ~~absoluteHeight + unit;

		var width = cellSize.width + unit;
		var height = cellSize.height + unit;

		var css = height +  ' ' + height + ', ' +
				  width  +  ' ' + width;

		element.style.backgroundSize = css;
	}

})(GridRenderer);function MouseHandler() {
	this.register = function(context) {
		$(context.element).off('mousedown mouseup mousemove');
		$(context.element).on('mousedown mouseup mousemove dblclick', eventHandler(MouseHandler.onMouseEvent, context));
	}
};

(function(me) {

	var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	var state = states.MOUSE_UP;

	var atMouseDown = { 
		absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
		relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
	}
	
	/**
	 * Handle a mouse event and call onPreSelection(rect) when user interacts
	 * @param  obj e       Mouse Event
	 * @param  obj context Current Context {element, cellSize, onPreSelection}
	 */
	me.onMouseEvent = function(e, context) {

		// Retrieve element size (rectangle) if not supplied
		if(context.elementRect == null) {
			return me.onMouseEvent(e, $.extend(context, {elementRect: getElementRect(context.element)}));
		}

		// Retrieve mouse position and a rectangle it snaps to given cellsize
		// Get current mouse position relative to the editor
		var globalMousePosition  = { x: e.pageX, y: e.pageY };
		var mousePosition = subtract(globalMousePosition, context.elementRect);
		
		var absolute = {};
		absolute.mousePosition = mousePosition;
		absolute.snappedPosition = getSnappedRect(absolute.mousePosition, context.cellSize);
		absolute.selectionStart = atMouseDown.absolute.selectionStart || absolute.snappedPosition;
		absolute.selection = rectFrom(absolute.selectionStart, absolute.snappedPosition);
		absolute.delta = {};
		absolute.delta.position = subtract(absolute.mousePosition, atMouseDown.absolute.mousePosition || absolute.mousePosition);
		absolute.delta.snappedPosition = getSnappedRect(absolute.delta.position, context.cellSize);

		var relative = {};
		relative.mousePosition = percentage(mousePosition, context.elementRect);
		relative.snappedPosition = getSnappedRect(relative.mousePosition, context.cellSize);
		relative.selectionStart = atMouseDown.relative.selectionStart || relative.snappedPosition;
		relative.selection = rectFrom(relative.selectionStart, relative.snappedPosition);
		
		// var abs  		  = subtract(mouse, context.elementRect);
		// var relToEditor	  = percentage(abs, context.elementRect);		
		// var snapRect  	  = getSnappedRect(relToEditor, context.cellSize);
		// var relRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);
		// var absRectFromMouseDown = rectFrom(snapRectStart || snapRect, snapRect);

		switch (e.type) {		
			case 'mousedown':			
				if(state == states.MOUSE_UP) {
					state = states.MOUSE_DOWN;
					atMouseDown = { absolute: absolute, relative: relative };
					context.onMouseDown({
						absolute: absolute,
						relative: relative,
						originalEvent: e
					});
				}

				break;
			case 'mousemove':	
				context.onMouseMove({
					absolute: absolute,
					relative: relative,
					originalEvent: e
				});
				break;
			case 'mouseup': 		
				if(state == states.MOUSE_DOWN) {	
					state = states.MOUSE_UP;
					atMouseDown = { 
						absolute: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null },
						relative: { mousePosition: null, snappedPosition: null, selectionStart: null, selection: null }
					};
		
					context.onMouseUp({
						absolute: absolute,
						relative: relative,
						originalEvent: e
					});
				}
				break;

			case 'dblclick':
				context.onDoubleClick({
				 	absolute: absolute,
				 	relative: relative,
					originalEvent: e
				});
				break;
		}
	}

	function getElementRect(element) {
		var position = $(element).position();			
		return {
			  x: position.left
			, y: position.top
			, width: $(element).width()
			, height: $(element).height()
		};
	}

	function rectFrom(rect1, rect2) {
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

})(MouseHandler);function eventHandler(action, context) {
	return function(e) {
		action(e, context);
	}
    
};

function merge(a, b, deep) {
	var isDeep = deep === true;
	return $.extend(isDeep, {}, a, b);
}

function clone(a) {
	return merge(a, a, true);
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
}function Button(options) {
	if(options == null) throw "Button options cannot be null";
	if(options.parent == null) throw "Parent option cannot be null";

	// Parent
	this.parentWidth = $(options.parent).width();
	this.parentHeight = $(options.parent).height(); 

	// ID and text
	this.id = Button.idCounter++;
	
	// Position
	this.position = options.position || 'absolute';
	this.rect = { x: 0, y: 0, width: 0, height: 0 };
	if (options.rect) {
		this.x(options.rect.x, this.position);
		this.y(options.rect.y, this.position);
		this.width(options.rect.width, this.position);
		this.height(options.rect.height, this.position);
	}

	// States
	this.showPositionType = options.showPositionType || false;
	this.isMoving = options.isMoving || false;

	// Colors, text and image
	this.text = options.text || '';
	this.background = options.background || '#3276a9';
	this.foreground = options.foreground || '#ffffff';
	this.image = options.image || null;
	this.customClass = options.customClass;
};

Button.idCounter = 0;

Button.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			 return this.rect.x;
		else return this.rect.x / 100 * this.parentWidth;
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value < 0) value = 0;
		if(value + this.rect.width <= 100) this.rect.x = value;
	}
};

Button.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this.rect.y;
		else return this.rect.y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value < 0) value = 0;
		if(value + this.rect.height <= 100) this.rect.y = value;
	}
};

Button.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative")
			 return this.rect.width;
		else return this.rect.width / 100 * this.parentWidth;
	else 
		if(positionType == "relative")		
			 this.rect.width = value;
		else this.rect.width = value / this.parentWidth * 100;	
};

Button.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this.rect.height;
		else return this.rect.height / 100 * this.parentHeight;
	else 
		if(positionType == "relative") 
			 this.rect.height = value;
		else this.rect.height = value / this.parentHeight * 100;
};

function Popover(options) {
	return {
		getResults: Popover.getResults.bind(Popover, options.contentsTemplate,
												     options.renderer,
												     options.onRetrieved)
	};
};

(function(me) {


	me.getResults = function(contentsTemplate, renderer, button, callbacks, existingButton) {

		// Determine best placement depending on available screen area
		var buttonPosition = button.position();

		var buttonRect = getRect(button);
  		var windowRect = getRect($(window));

		var distanceToLeftEdge = buttonRect.x;
		var distanceToRightEdge = windowRect.width - buttonRect.right;
		var distanceToTopEdge = buttonRect.y;
		var distanceToBottomEdge = windowRect.height - buttonRect.bottom;

		// Find out which direction has the least distance to an edge
		// and use to opposite placement (ie, if we're close to the left, the popover should
		// be displayed to the right)
		var popoverWidth = 236;
		var popoverHeight = 146;
		var placement = 'right'; // opposite of left edge
		var minDistance = distanceToLeftEdge; 
		if(minDistance > distanceToRightEdge) { placement = 'left'; minDistance = distanceToRightEdge };
		if(minDistance > distanceToTopEdge) { placement = 'bottom'; minDistance = distanceToTopEdge };
		if(minDistance > distanceToBottomEdge) { placement = 'top'; minDistance = distanceToBottomEdge };
		
		// Render a popover using the body template with the Create Button form
		// Retrieve a reference to the generated popover element
		// and enable js beaviors for twitter bootstrap
		button.popover({
			title: "Button",
			placement: placement,
			html: true,
			content: renderer.render(Templates.CreateButtonPopover, existingButton),
			trigger: 'manual'
		});

		button.popover('show');

		var popover = $('.popover');

		popover.find('.color').colorpicker();
		
		// Give focus to first text area (html5 autofocus doesn't work in twitter bootstraps popover)
		popover.find('input:first-child')[0].focus();

		var accepted = false;
		popover.find('form').submit(function(e) {
			var results = $(this).serializeObject();
			callbacks.onSuccess(results);
			button.popover('destroy');
			e.preventDefault();
		})

		popover.find('*[data-dismiss=popover]').click(function(e) {
			button.popover('destroy');
			callbacks.onCancelled();
		});


		popover.on('keydown', function(e) {
			if(e.keyCode == 27) {
				button.popover('destroy');
				callbacks.onCancelled(); 
			}
		});

		function getRect(element) {
			var rect = {};

			rect.width = element.width();
			rect.height = element.height();

			// position is not supported for the window object
			if (element.get(0) != window) {
				var position = element.position();
				rect.x = position.left;
				rect.y = position.top;
				rect.right = rect.x + rect.width;
		  		rect.bottom = rect.y + rect.height;
	  		}
	  		return rect;
		}

	}

})(Popover);function Renderer(options) {
	this.options = options;
	this.toElement = options.toElement;
};

(function(me) {

	/**
	 * Transform an array of data objects to HTML using
	 * the provided template function
	 * @param func  pre-compiled template function
	 * @param array array of {
	 * 	 position: 'relative',	
	 * 	 left: 30,  top: 10,
	 * 	 width: 30, height: 20 
	 * }
	 */
	
	me.prototype.render = function(template, array) {
		array = array || this.options.array || [{}];

		// Allow a single element by turning it into an array
		if($.isArray(array) === false) {
			array = [array];
		}		

		var html = '', i = -1, len = array.length - 1;
		while(i < len) {
			html += template(array[i += 1]);			
		}
		return html;
	}


	me.prototype.latestDataRendered = [];

	me.prototype.write = function(template, array, toElement) {
		
		// Optimize rendering by only doing it when array data has changed 
		if(equals(array, this.latestDataRendered)) return;
		this.latestDataRendered = array; 

		toElement = toElement || this.options.toElement;

		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.style.width = toElement.style.width;
		div.style.height = toElement.style.height;
		div.innerHTML = this.render(template, array);

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

})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}} 	<!--  	http://cdn3.iconfinder.com/data/icons/ilb/Perspective%20Button%20-%20Go.png  	-->	<div id="button_{{=it.id}}" 	 	 class="component button {{=it.resizeDir}} 	 		    {{?it.isMoving}}isMoving{{?}}	 	     	{{?it.image}}hasImage{{?}}"	 	 style="left: {{=it.x(null, it.position)}}{{#def.unit}};	 	     	top: {{=it.y(null, it.position)}}{{#def.unit}};	 	     	width: {{=it.width(null, it.position)}}{{#def.unit}};	 	     	height: {{=it.height(null, it.position)}}{{#def.unit}};	 	     	background-color: {{=it.background}}	 	     	">	 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat center center; position: absolute;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}		<div class="content" style="color: {{=it.foreground}}">			{{=it.text}}		</div>	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}		{{? it.showPositionType}}	 		<div class="positionTypeAdorner">{{#def.unit}}</div>		{{?}}	</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Preselection = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component preselection {{=it.customClass || ""}}				{{?it.image}}hasImage{{?}}" 		 style="left: {{=it.x(null, it.position)}}{{#def.unit}};	 	     	top: {{=it.y(null, it.position)}}{{#def.unit}};	 	     	width: {{=it.width(null, it.position)}}{{#def.unit}};	 	     	height: {{=it.height(null, it.position)}}{{#def.unit}};">	 		 		 	{{?it.image}}			<div style="background: url({{=it.image}}) no-repeat center center; position: absolute;						width: {{=it.width(null, "absolute")}}px;	 	     			height: {{=it.height(null, "absolute")}}px;"></div>	 	{{?}}	 	{{? it.resizeDir}}	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>	 	{{?}}		<span class="label label-info" style="position: absolute; 											  top: 50%; 											  left: 50%; 											  margin-top: -9px; 											  margin-left: -35px;">			{{=Math.round(it.width(null, it.position))}}{{#def.unit}} 			<span style="color: #2A779D;">x</span> 			{{=Math.round(it.height(null, it.position))}}{{#def.unit}}		</span>			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.CreateButtonPopover = '<div class="createButtonPopover">	<form>		<div>			<div class="input-append color" data-color="{{=it.foreground}}" data-color-format="rgba">				<input type="text" name="inputText" class="input" id="inputText" placeholder="Text" value="{{? it.text}}{{! it.text}}{{?}}" />				<input type="text" name="inputForeground" value="{{=it.foreground}}" class="colorInput" id="inputForeground" style="display: none;" />				<span class="add-on"><i style="background-color: {{=it.foreground}}"></i></span>			</div>			<div class="input-append color" data-color="{{=it.background}}" data-color-format="rgba">				<input type="text" name="inputImage" class="input" id="inputImage" placeholder="Image URL" value="{{? it.image}}{{! it.image}}{{?}}" />				<input type="text" name="inputBackground" value="{{=it.background}}" class="colorInput" id="inputBackground" style="display: none;" />				<span class="add-on"><i style="background-color: {{=it.background}}"></i></span>			</div>		</div>		<div>  			<input type="submit" class="btn btn-primary" value="OK" data-accept="form" />			<a href="#" class="btn" data-dismiss="popover">Close</a>		</div>		</form></div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Grid = '	<div class="grid-root">	{{ for(var x = 0; x < 30; x++ ) { }}		{{ for(var y = 0; y < 30; y++ ) { }}			<div class="grid-cell" style="				left: {{=x * it.cellSize.width}}px; 				top: {{=y * it.cellSize.height}}px;				width: {{=it.cellSize.width}}px; 				height: {{=it.cellSize.height}}px;"></div>		{{ } }}	{{ } }}	</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);