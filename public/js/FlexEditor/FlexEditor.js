(function($) {
	/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	this.options = options;
};

(function(me) {

	me.prototype.load = function(options) {
		
		// Merge parameter-options with the constructor-options
		var options = $.extend({}, this.options, options);

		// Fetch options or defaults
		var element = document.getElementById(options.elementId);
		var cellSize = options.cellSize || { width: 10, height: 10 };
		
		// Init view model
		var model = options.view || new View();	

		// Init renderer
		var renderer = options.renderer || new Renderer();

		// Init templates from the tpl folder
		Templates.init();

		// Init Grid renderer and render the grid
		var gridRenderer = options.gridRenderer || new GridRenderer();
		gridRenderer.render(element, cellSize);

		// Init mouse handler and handle onPreSelection (grid selection)
		var mouseHandler = new MouseHandler({
			  element: element
			, cellSize: cellSize 
			, onPreSelection: eventHandler(onPreSelection, { 
				  element: element 
				, model: model
				, renderer: renderer })
			, onSelection: eventHandler(onSelection, {
				  element: element
				, model: model
				, renderer: renderer })
		});
	};

	var onPreSelection = function(e, context) {
		var button = {
			  position: 'relative'
			, text: ''
			, left: e.rect.x, width:  e.rect.width
			, top:  e.rect.y, height: e.rect.height
		};

		context.renderer.write(Templates.Button, [button], context.element);
		
		// Idea: Call a new function when a new button is created 
		// where the new button is injected to a button array 
		// instead of using this storage?
		//context.model.add(button);		
		//context.renderer.write(Templates.Button, context.model.getButtons(), context.element);				
	}

	var onSelection = function(e, context) {
			
		Modal.getResults(Templates.CreateButtonModal, context.renderer);

		//context.renderer.write(Templates.CreateButtonModal, [{}], document.body);
		//$('.modal').modal();
		//console.log($('.modal'));
	}

	//var start = (new Date).getTime();
	//for(var i = 0; i < 10000; i++)		
	//console.log('time', ((new Date).getTime() - start), ' ms');
	
}(Main));

function View() {
	this.buttons = [];
};

(function(me) {
	
	me.prototype.add = function(button) {
		this.buttons.push(button);
	}

	me.prototype.getButtons = function() {
		return this.buttons;
	}

})(View);// background-size: 10% 10%, 10% 10%;

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

})(GridRenderer);function MouseHandler(options) {
	$(options.element).on('mousedown', eventHandler(MouseHandler.onMouseEvent, {
		element: options.element,  
		cellSize: options.cellSize,
		onPreSelection: options.onPreSelection,
		onSelection: options.onSelection
	}));
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
			case 'mousemove':
				context.onPreSelection({
					rect: rectFrom(context.snapRectStart, snapRect)
				});
				break;
			case 'mousedown':			
				context.onPreSelection({rect: snapRect});
				newContext = $.extend(context, {snapRectStart: snapRect});
				$(context.element).on('mousemove', eventHandler(me.onMouseEvent, newContext));
				$(context.element).on('mouseup', eventHandler(me.onMouseEvent, newContext));
				break;		
			case 'mouseup': 
				$(context.element).off('mousemove');
				$(context.element).off('mouseup');
				context.onSelection({
					rect: rectFrom(context.snapRectStart, snapRect)
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
};function Modal(options) {
	return {
		getResults: Model.getResults.bind(Model, options.contentsTemplate,
												 options.renderer,
												 options.onRetrieved)
	};
};

(function(me) {

	me.getResults = function(contentsTemplate, renderer, onRetrieved) {
		var contents = renderer.render(Templates.CreateButtonModal, [{}]);
			
		renderer.write(Templates.Modal, [{

			header: "Modal",
			body: contents

		}], document.body);

		// Retrieve a reference to the generated modal element
		var modal = $('.modal');

		// Enable js behaviors for twitter bootstrap
		modal.modal();
		
		modal.find('.btn-primary').click(function() {
			// Serialize form data with jquery
			
			var results = modal.find('form').serializeObject();

			//console.log(modal.find('form'));

			console.log(results);

		})
	}

})(Modal);function Renderer() {

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
		var html = '', i = -1, len = array.length - 1;
		while(i < len) {
			html += template(array[i += 1]);			
		}
		return html;
	}

	me.prototype.write = function(template, array, toElement)
	{		
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
	Templates.init = function() {	
		// TODO: Loop Templates.Raw and do this automatically
		Templates.Button = doT.template(Templates.Raw.Button);
		Templates.Modal = doT.template(Templates.Raw.Modal);
		Templates.CreateButtonModal = doT.template(Templates.Raw.CreateButtonModal);
	}
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		{{=it.text}}			</div>';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.CreateButtonModal = '  <form class="form-horizontal">    <div class="control-group">      <label class="control-label" for="inputText">Text</label>      <div class="controls">        <input type="text" name="inputText" id="inputText" placeholder="Text" />      </div>    </div>  </form>  ';/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Modal = '<div class="modal" tabindex="-1" role="dialog">  <div class="modal-header">    <button type="button" class="close" data-dismiss="modal">&times;</button>    <h3>{{=it.header}}</h3>  </div>  <div class="modal-body">    {{=it.body}}  </div>  <div class="modal-footer">    <a href="#" class="btn" data-dismiss="modal">Close</a>    <a href="#" class="btn btn-primary">Save changes</a>  </div></div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);