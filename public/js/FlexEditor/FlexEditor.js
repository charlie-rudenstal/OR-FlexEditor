(function($) {
	// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	this.options = options;
};

(function(me) {

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

	var state = new cursorState();
	var buttons = [];
	var renderer = null;

	var onEvent = function(e, context) {
		var action = state[context.event];
		if(action) {
			action(e);
		}
	}

	function cursorState() {
		this.mouseDown = function(e) {
			var buttonAtPoint = getButtonAtPoint(buttons, e.rect.x, e.rect.y);
			if(buttonAtPoint) {	
				state  = new moveState(buttonAtPoint);
			}
			else {
				state = new selectionState();
			}
		}
	}

	function selectionState() {
		this.mouseMove = function(e) {
			var previewButton = { 
				  text: ''
				, position: 'relative'
				, left: e.rectFromMouseDown.x, width:  e.rectFromMouseDown.width
				, top:  e.rectFromMouseDown.y, height: e.rectFromMouseDown.height
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
						, left: e.rectFromMouseDown.x, width:  e.rectFromMouseDown.width
					 	, top:  e.rectFromMouseDown.y, height: e.rectFromMouseDown.height
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
			movedButton.button.left = e.rect.x - movedButton.deltaX;
			movedButton.button.top = e.rect.y - movedButton.deltaY;
			renderer.write(Templates.Button, buttons);
		}

		this.mouseUp = function(e) {
			state = new cursorState();
		}
	}
	
	var getButtonAtPoint = function(buttons, x, y) {
		for(var i in buttons) {
			var b = buttons[i];
			if(x >= b.left && x < b.left + b.width && 
			   y >= b.top && y < b.top + b.height)
				return { button: buttons[i]
					   , index: parseInt(i)
					   , deltaX: x - b.left
					   , deltaY: y - b.top }
		}
		return null;
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

	/**
	 * Handle a mouse event and call onPreSelection(rect) when user interacts
	 * @param  obj e       Mouse Event
	 * @param  obj context Current Context {element, cellSize, onPreSelection}
	 */
	
	var states = { MOUSE_UP: 0, MOUSE_DOWN: 1 };
	var state = states.MOUSE_UP;
	var snapRectStart = null;

	me.onMouseEvent = function(e, context) {

		// Retrieve element size (rectangle) if not supplied
		if(context.elementRect == null) {
			return me.onMouseEvent(e, $.extend(context, {elementRect: getElementRect(context.element)}));
		}

		// Retrieve mouse position and a rectangle it snaps to given cellsize
		var mouse     = { x: e.pageX, y: e.pageY };
		var absolute  = subtract(mouse, context.elementRect);
		var relative  = percentage(absolute, context.elementRect);		
		var snapRect  = getSnappedRect(relative, context.cellSize);

		switch (e.type) {		
			case 'mousedown':			
				if(state == states.MOUSE_UP) {
					state = states.MOUSE_DOWN;
					snapRectStart = snapRect;
					context.onMouseDown({
					 	rect: rectFrom(snapRect, snapRect),
					 	x: snapRect.x,
					 	y: snapRect.y,
					});
				}

				break;
			case 'mousemove':	
				if(state == states.MOUSE_DOWN) {
					context.onMouseMove({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
					});
				}
				break;
			case 'mouseup': 		
				if(state == states.MOUSE_DOWN) {	
					state = states.MOUSE_UP;		
					context.onMouseUp({
						rect: rectFrom(snapRect, snapRect),
						rectFromMouseDown: rectFrom(snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
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

function merge(a, b) {
	return $.extend({}, a, b);
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
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component button" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		{{=it.text}}			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Preselection = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component preselection" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		<span class="label label-info" style="position: absolute; 											  top: 50%; 											  left: 50%; 											  margin-top: -9px; 											  margin-left: -35px;">			{{=it.width}}{{#def.unit}} 			<span style="color: #2A779D;">x</span> 			{{=it.height}}{{#def.unit}}		</span>			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.CreateButtonModal = '  <form class="form-horizontal" style="margin: 0">	  	  <div class="modal-body">		    <div class="control-group">		      <label class="control-label" for="inputText">Text</label>		      <div class="controls">		        <input type="text" name="inputText" id="inputText" placeholder="Text" />		      </div>		    </div>	  	  </div>	  <div class="modal-footer">  	  	    <a href="#" class="btn" data-dismiss="modal">Close</a>	    <input type="submit" class="btn btn-primary" value="Save changes" data-accept="form" />	  	  </div>	  </form>  ';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Modal = '<div class="modal" tabindex="-1" role="dialog">  <div class="modal-header">    <button type="button" class="close" data-dismiss="modal">&times;</button>    <h3>{{=it.header}}</h3>  </div>  {{=it.body}}</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);