(function($) {
	/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {

	// Fetch options or defaults
	this.element = document.getElementById(options.elementId);
	this.cellSize = options.cellSize || { width: 10, height: 10 };
	
	// Init view model
	this.model = options.view || new View();	

	// Init renderer
	this.renderer = options.renderer || new Renderer();

	// Init Grid renderer
	this.gridRenderer = options.gridRenderer || new GridRenderer();

	// Compile templates from the tpl folder
	Templates.init();
};

(function(me) {

	me.prototype.load = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		// Init mouse handler
		this.mouseHandler = new MouseHandler(element, cellSize, this.renderer, this.model);

		// Render grid
		this.gridRenderer.render(element, cellSize);
	};

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, element);
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

})(GridRenderer);// background-size: 10% 10%, 10% 10%;

function MouseHandler(element, cellSize, renderer, model) {

	var eventHandler = MouseHandler.getEventHandler(element, cellSize, renderer, model);		
	$(element).on('mousemove', eventHandler);
	$(element).on('mousedown', eventHandler);
};

(function(me) {

	me.getEventHandler = function(element, cellSize, renderer, model) {
		
		// Store size of the container once when loaded 
		// (needed to calculate relative mouse position)
		var position = $(element).position();			
		var elmRect = {
			  x: position.left
			, y: position.top
			, width: $(element).width()
			, height: $(element).height()
		};
 
		return eventHandler(elmRect, element, cellSize, renderer, model);
	}

	function eventHandler(elmRect, element, cellSize, renderer, model) {
		return function(e) {
			eventEmitter(e, elmRect, element, cellSize, renderer, model);			
		}
	}

	function eventEmitter(e, elmRect, element, cellSize, renderer, model) {
		
		var mousePosition    = { x: e.pageX, y: e.pageY };
		
		var absolutePosition = subtract(mousePosition, elmRect);
		var relativePosition = percentage(absolutePosition, elmRect);		
		var snappedRect      = getSnappedRect(relativePosition, cellSize);

		var position = {
			  absolute: absolutePosition
			, relative: relativePosition
			, snapped: snappedRect
		};
		
		switch(e.type) {
			case 'mousemove': onMouseMove.call(this, position, element, renderer, model); break;
			case 'mousedown': onMouseDown.call(this, position, element, renderer, model); break;
		}
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

	/**
	 * Mouse move handler
	 * @param object e is the event object from jQuery but with 4 new properties
	 *               absoluteX/absoluteY - Pixels relative to editor
	 *               relativeX/relativeY - Percentage relative to editor
	 *               cell 				 - Relative position and size of cell
	 */
	var onMouseMove = function(position, element, renderer, model) {
		//console.log(e.cell.left, e.cell.top);
	}

	var onMouseDown = function(position, element, renderer, model) {
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: position.snapped.x, width:  position.snapped.width
			, top:  position.snapped.y, height: position.snapped.height
		};

		model.add(button);		
		renderer.write(Templates.Button, model.getButtons(), element);
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