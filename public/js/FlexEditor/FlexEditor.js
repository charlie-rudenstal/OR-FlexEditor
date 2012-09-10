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

		// Init mouse handler
		var mouseHandler = new MouseHandler(element, cellSize, { 
			onSelected: eventHandler(onSelected, { element: element, 
												   model: model, 
												   renderer: renderer })
		});
	};

	var onSelected = function(e, context) {
		var button = {
			  position: 'relative'
			, text: ''
			, left: e.rect.x, width:  e.rect.width
			, top:  e.rect.y, height: e.rect.height
		};
		context.renderer.write(Templates.Button, [button], context.element);
		//context.model.add(button);		
		//context.renderer.write(Templates.Button, context.model.getButtons(), context.element);				
	}

	var eventHandler = function(action, context) {
		return function(e) {
			action(e, context);
		}
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

})(GridRenderer);// TODO: Move to common location/helper
var eventHandler = function(action, context) {
	return function(e) {
		action(e, context);
	}
}

function MouseHandler(element, cellSize, callbacks) {
	
	var elementRect = MouseHandler.getElementRect(element);

	var context = {
		element: element, 
		elementRect: elementRect, 
		cellSize: cellSize, 
		callbacks: callbacks	
	};

	$(element).on('mousedown', eventHandler(MouseHandler.onMouseEvent, context));
	$(element).on('mouseup', eventHandler(MouseHandler.onMouseEvent, context));
};

(function(me) {

	me.onMouseEvent = function(e, context) {

		var mouse     = { x: e.pageX, y: e.pageY };
		var absolute  = subtract(mouse, context.elementRect);
		var relative  = percentage(absolute, context.elementRect);		
		var snapRect  = getSnappedRect(relative, context.cellSize);

		switch (e.type) {		
			case 'mousemove':
				var totalRect = rectFrom(context.snapRectStart, snapRect);
				context.callbacks.onSelected({rect: totalRect});
				break;
			case 'mousedown':			
				context.callbacks.onSelected({rect: snapRect}); 
				context.snapRectStart = snapRect;
				$(context.element).on('mousemove', eventHandler(me.onMouseEvent, context));
				break;		
			case 'mouseup': 
				$(context.element).off('mousemove');
				break;
		}
	}

	me.getElementRect = function(element) {
		var position = $(element).position();			
		return {
			  x: position.left
			, y: position.top
			, width: $(element).width()
			, height: $(element).height()
		};
	}

	/*function rect(x1, y1, x2, y2) {		
		var x = Math.min(x1, x2)
		  , y = Math.min(y1, y2);

		var	width = Math.max(x1, x2) - x
		  , height = Math.max(y1, y2) - y;

		return { 
			x: x, 
			y: y, 
			width: width,
			height: height
		};
	}*/

	// w70 h70 x10 y10
	function rectFrom(rect1, rect2) {
		
		var x = Math.min(rect1.x, rect2.x);
		var y = Math.min(rect1.y, rect2.y);
		var width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - x;
		var height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - y;

		return {
			x: x,
			y: y,
			width: width,
			height: height
		};
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
	var getSnappedRect = function(point, cellSize) {
		return {
			// 					      ~~ is a fast way to trim decimals
			x:      cellSize.width  * ~~(point.x / cellSize.width),
			y:      cellSize.height * ~~(point.y / cellSize.height),
			width:  cellSize.width,
			height: cellSize.height
		};
	}

})(MouseHandler);function Renderer() {

};

(function(me) {

	/**
	 * Transform an array to HTML
	 * @param func  pre-compiled template function
	 * @param array buttons of {
	 * 	 position: 'relative',	
	 * 	 left: 30,  top: 10,
	 * 	 width: 30, height: 20 
	 * }
	 */
	
	me.prototype.render = function(template, buttons) {
		var html = '', i = -1, len = buttons.length - 1;
		while(i < len) {
			html += template(buttons[i += 1]);			
		}
		return html;
	}

	me.prototype.write = function(template, buttons, toElement)
	{		
		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.innerHTML = this.render(template, buttons);

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
		Templates.Button = doT.template(Templates.Raw.Button);
	}
})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};	 	     	width: {{=it.width}}{{#def.unit}};	 	     	height: {{=it.height}}{{#def.unit}};">		{{=it.text}}			</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	//OR.TestPerformance = TestPerformance;

})(jQuery);