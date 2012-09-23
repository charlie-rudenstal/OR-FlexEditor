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

	var onEvent = function(e, context) {

		switch(context.event) {

			case 'preselection':

				// Is the selection overlapping an existing button?
				// Then we should go into 'move mode'
				// Otherwise we should create a new button preview
				var buttonAtPoint = getButtonAtPoint(context.buttons, e.rect.x, e.rect.y);
				if(buttonAtPoint) {	
					// Register a new move aware context for the preselection + selection events						
					context.handler.register(merge(context.handler.context, {
						    onPreSelection: eventHandler(onEvent, merge(context, { 
						  	    event: 'preselection.moving'
						  	  , movedButton: buttonAtPoint
						    }))
						  , onSelection: eventHandler(onEvent, merge(context, {
								event: 'selection.movinga'
							  , movingButton: true
						    }))
						  , mouseDown: true 
					}));

				} else {

					// Create a new button based on preselection rect
					var button = { 
						  position: 'relative'
						, text: ''
						, left: e.rect.x, width:  e.rect.width
						, top:  e.rect.y, height: e.rect.height
					};

					// Render a preview of the selection
					context.renderer.write(Templates.Preselection, context.buttons.concat(button));

					// Register a new preselection aware context for the selection event
					context.handler.register(merge(context.handler.context, {
					 	  onSelection: eventHandler(onEvent, merge(context, {
					 		    event: 'selection'
					 	  	  , button: button
					 	  }))
					 	, mouseDown: true
					 	, snapRectStart: e.snapRectStart
					}));
				}		
			
				break;

			case 'preselection.moving': 
				var before = context.buttons.slice(0, context.movedButton.index);
				var after = context.buttons.slice(context.movedButton.index + 1);
				
				var newButton = merge(context.movedButton.button, {
				      position: 'relative'
					, left: e.x - context.movedButton.deltaX
					, top:  e.y - context.movedButton.deltaY
					, width: context.movedButton.button.width 
					, height: context.movedButton.button.height
				});

				// Render a preview of the moved button
				var preButtons = before.concat(newButton).concat(after);
				context.renderer.write(Templates.Preselection, preButtons);

				// Register a new move aware context for the selection event
				context.handler.register(merge(context.handler.context, {
					onSelection: eventHandler(onEvent, merge(context, {
						  event: 'selection.moving'
						, movingButton: true
						, buttons: preButtons
						, movedButtonIndex: null
					}))
				}));
				break;

			case 'selection': 		
				Modal.getResults(Templates.CreateButtonModal, context.renderer, {
					onSuccess: function(results) {		
						// Create a new button based on selection-preview-context and input from modal
						var newButton = merge(context.button, { text: results.inputText });
						var newButtons = context.buttons.concat(newButton);

						// Render it
						context.renderer.write(Templates.Button, newButtons);

						// And register selection events with the new context
						context.handler.register(merge(context.handler.context, {
							    onPreSelection: eventHandler(onEvent, merge(context, { 
							        event: 'preselection'
							  	  , buttons: newButtons
							    }))
							  , mouseDown: false
						}));
					},
					onCancelled: function() {
						// Just render already stored buttons to clear preselection
						context.renderer.write(Templates.Button, context.buttons);
					}
				});				
				break;

			case 'selection.moving':
				// Render buttons from context
				context.renderer.write(Templates.Button, context.buttons);

				// And register selection events with the new context
				context.handler.register(merge(context.handler.context, {
					    onPreSelection: eventHandler(onEvent, merge(context, { 
					  	    event: 'preselection'
					  	  , movingButton: false
					    }))
					  , mouseDown: false
				}));
				break;

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
		
		this.context = context;

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
				// Trigger a mouse move directly on mouse down
				// to get preSelection rendering directly
				//me.onMouseEvent(merge(e, {type: 'mousemove'}),
				//				merge(context, {mouseDown: true}));
				
				// Register a new handler and with a starting point for the selection	
				
				var newContext = merge(context, {
					  mouseDown: true
					, snapRectStart: snapRect
				});

				var newHandler = eventHandler(me.onMouseEvent, newContext);

				$(context.element).off('mousedown mouseup mousemove');
				$(context.element).on ('mousedown mouseup mousemove', newHandler);

				break;
			case 'mousemove':	
				if(context.mouseDown) {
					context.onPreSelection({
						rect: rectFrom(context.snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y,
						snapRectStart: context.snapRectStart
					});
				}
				break;
			case 'mouseup': 		
				if(context.mouseDown) {			
					var newHandler = eventHandler(me.onMouseEvent, merge(context, {
						mouseDown: false	
					}));

					$(context.element).off('mousedown mouseup mousemove');
					$(context.element).on ('mousedown mouseup mousemove', newHandler);

					context.onSelection({
						rect: rectFrom(context.snapRectStart || snapRect, snapRect),
						x: snapRect.x,
						y: snapRect.y
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
			header: "Modal",
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
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component button" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		{{=it.text}}			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Preselection = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component preselection" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		<span class="label label-info">			{{=it.width}}{{#def.unit}} 			<span style="color: #2A779D;">x</span> 			{{=it.height}}{{#def.unit}}		</span>			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.CreateButtonModal = '  <form class="form-horizontal" style="margin: 0">	  	  <div class="modal-body">		    <div class="control-group">		      <label class="control-label" for="inputText">Text</label>		      <div class="controls">		        <input type="text" name="inputText" id="inputText" placeholder="Text" />		      </div>		    </div>	  	  </div>	  <div class="modal-footer">  	  	    <a href="#" class="btn" data-dismiss="modal">Close</a>	    <input type="submit" class="btn btn-primary" value="Save changes" data-accept="form" />	  	  </div>	  </form>  ';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Modal = '<div class="modal" tabindex="-1" role="dialog">  <div class="modal-header">    <button type="button" class="close" data-dismiss="modal">&times;</button>    <h3>{{=it.header}}</h3>  </div>  {{=it.body}}</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);