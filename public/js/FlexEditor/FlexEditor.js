(function($) {
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
		$(context.element).on('mousedown mouseup mousemove', eventHandler(MouseHandler.onMouseEvent, context));
	}
};

(function(me) {

	var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	var state = states.MOUSE_UP;
	var snapRectStart = null;
	var xMouseDown = null;
	var yMouseDown = null;
	var xMouseDownSnapped = null;
	var yMouseDownSnapped = null;


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
		var mouse     	= { x: e.pageX, y: e.pageY };
		var abs  		= subtract(mouse, context.elementRect);
		var relToEditor	= percentage(abs, context.elementRect);		
		var snapRect  	= getSnappedRect(relToEditor, context.cellSize);

		switch (e.type) {		
			case 'mousedown':			
				if(state == states.MOUSE_UP) {
					state = states.MOUSE_DOWN;
					snapRectStart = snapRect;
					xMouseDown = relToEditor.x;
					yMouseDown = relToEditor.y;
					xMouseDownSnapped = snapRect.x;
					yMouseDownSnapped = snapRect.y;
					context.onMouseDown({
					 	rect: rectFrom(snapRect, snapRect),
					 	x: snapRect.x,
					 	y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y
					});
				}

				break;
			case 'mousemove':	
				// if(state == states.MOUSE_DOWN) {
					context.onMouseMove({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y,
						xMouseDown: xMouseDown,
						yMouseDown: yMouseDown,
						xMouseDownSnapped: xMouseDownSnapped,
						yMouseDownSnapped: yMouseDownSnapped
					});
				// }
				break;
			case 'mouseup': 		
				if(state == states.MOUSE_DOWN) {	
					state = states.MOUSE_UP;		
					context.onMouseUp({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
						relX: relToEditor.x,
						relY: relToEditor.y,
						xMouseDown: xMouseDown,
						yMouseDown: yMouseDown,
						xMouseDownSnapped: xMouseDownSnapped,
						yMouseDownSnapped: yMouseDownSnapped
					});
				}
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
		return {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};
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
}function Modal(options) {
	return {
		getResults: Model.getResults.bind(Model, options.contentsTemplate,
												 options.renderer,
												 options.onRetrieved)
	};
};

(function(me) {

	me.getResults = function(contentsTemplate, renderer, callbacks) {

		// Render a modal using the body template with the Create Button form
		renderer.write(Templates.Modal, [{
			header: "Create new button",
			body: renderer.render(Templates.CreateButtonModal)
		}], document.body);

		// Retrieve a reference to the generated modal element
		// and enable js beaviors for twitter bootstrap
		var modal = $('.modal');
		modal.modal();

		// Give focus to first text area (html5 autofocus doesn't work in twitter bootstraps modal)
		modal.find('input:first-child').focus();

		var accepted = false;

		modal.find('form').submit(function(e) {
			
			var results = $(this).serializeObject();
			callbacks.onSuccess(results);
			
			accepted = true;
			modal.modal('hide');

			e.preventDefault();
		})

		modal.on('hidden', function(e) {
			if(!accepted) callbacks.onCancelled();
		});

	}

})(Modal);function Renderer(options) {
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

	me.prototype.write = function(template, array, toElement) {
		toElement = toElement || this.options.toElement;

		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.innerHTML = this.render(template, array);

		// We need a child element inside the Editor div which 
		// we can replace, create if not existing
		if(!toElement.firstChild) {
			toElement.appendChild(document.createElement('div'));
		}

		toElement.replaceChild(div, toElement.firstChild);
	}

})(Renderer);var Templates = Templates || {};

(function() {
	Templates.compile = function() {	
		// TODO: Loop Templates.Raw and do this automatically
		Templates.Button = doT.template(Templates.Raw.Button);
		Templates.Modal = doT.template(Templates.Raw.Modal);
		Templates.CreateButtonModal = doT.template(Templates.Raw.CreateButtonModal);
		Templates.Preselection = doT.template(Templates.Raw.Preselection);
	}
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component button {{=it.resizeDir || ""}}" 		 style="left: {{=it.rect.x}}{{#def.unit}};	 	     	top: {{=it.rect.y}}{{#def.unit}};	 	     	width: {{=it.rect.width}}{{#def.unit}};	 	     	height: {{=it.rect.height}}{{#def.unit}};">		{{=it.text}}			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Preselection = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component preselection" 		 style="left: {{=it.rect.x}}{{#def.unit}};	 	     	top: {{=it.rect.y}}{{#def.unit}};	 	     	width: {{=it.rect.width}}{{#def.unit}};	 	     	height: {{=it.rect.height}}{{#def.unit}};">		<span class="label label-info" style="position: absolute; 											  top: 50%; 											  left: 50%; 											  margin-top: -9px; 											  margin-left: -35px;">			{{=it.rect.width}}{{#def.unit}} 			<span style="color: #2A779D;">x</span> 			{{=it.rect.height}}{{#def.unit}}		</span>			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.CreateButtonModal = '  <form class="form-horizontal" style="margin: 0">	  	  <div class="modal-body">		    <div class="control-group">		      <label class="control-label" for="inputText">Text</label>		      <div class="controls">		        <input type="text" name="inputText" id="inputText" placeholder="Text" />		      </div>		    </div>	  	  </div>	  <div class="modal-footer">  	  	    <a href="#" class="btn" data-dismiss="modal">Close</a>	    <input type="submit" class="btn btn-primary" value="Save changes" data-accept="form" />	  	  </div>	  </form>  ';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Modal = '<div class="modal" tabindex="-1" role="dialog">  <div class="modal-header">    <button type="button" class="close" data-dismiss="modal">&times;</button>    <h3>{{=it.header}}</h3>  </div>  {{=it.body}}</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);