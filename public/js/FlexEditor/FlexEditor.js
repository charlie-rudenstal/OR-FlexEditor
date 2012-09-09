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
		this.bindMouse(element, cellSize);

		// Render grid
		this.gridRenderer.render(element, cellSize);
	};

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, element);
	}

	me.prototype.bindMouse = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		var mouseHandler = getMouseHandler(element, cellSize).bind(this);

		$(element).on('mousemove', mouseHandler);
		$(element).on('mousedown', mouseHandler);
	}

	var getMouseHandler = function(element, cellSize) {
		var position = $(element).position(),
			width = $(element).width(),
			height = $(element).height();

		return function(e) {
			e.absoluteX = e.pageX - position.left;
			e.absoluteY = e.pageY - position.top;
			e.relativeX = e.absoluteX / width * 100;
			e.relativeY = e.absoluteY / height * 100;
			e.cell = getSnappedPosition(e.relativeX, e.relativeY, cellSize);

			switch(e.type) {
				case 'mousemove': onMouseMove.call(this, e); break;
				case 'mousedown': onMouseDown.call(this, e); break;
			}
		}
	}

	/**
	 * Mouse move handler
	 * @param object e is the event object from jQuery but with 4 new properties
	 *               absoluteX/absoluteY - Pixels relative to editor
	 *               relativeX/relativeY - Percentage relative to editor
	 *               cell 				 - Relative position and size of cell
	 */
	var onMouseMove = function(e) {
		//console.log(e.cell.left, e.cell.top);
	};

	var onMouseDown = function(e) {
		var c = e.cell;
		var button = {
			  position: 'relative'
			, text: 'Button'
			, left: c.left, width:  c.width
			, top:  c.top,  height: c.height
		};

		this.model.add(button);
		this.render(this.element, this.model.getButtons());
	}

	/**
	 * Retrieve position for the cell located at this position
	 * @param  object cellSize  Expects {width, height} for snapping  
	 * @return object           {left, top, width, height}
	 */
	var getSnappedPosition = function(relativeX, relativeY, cellSize) {
		return {
			// 					   ~~ is a fast way to trim decimals
			left: cellSize.width * ~~(relativeX / cellSize.width),
			top: cellSize.height * ~~(relativeY / cellSize.height),
			width: cellSize.width,
			height: cellSize.height
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

	me.prototype.render = function(element, cellSize) {
		$(element).addClass('grid-single');

		var width = cellSize.width + '%';
		var height = cellSize.height + '%';

		var css = height +  ' ' + height + ', ' +
				  width  +  ' ' + width;

		element.style.backgroundSize = css;
	}

})(GridRenderer);function Renderer() {

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