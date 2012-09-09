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

	// Compile templates from the tpl folder
	Templates.init();
};

(function(me) {

	me.prototype.load = function(element, cellSize) {
		element = element || this.element;
		cellSize = cellSize || this.cellSize;

		// Init mouse handler
		this.bindMouse(element, cellSize);
	};

	me.prototype.render = function(element, buttons)
	{
		element = element || this.element;
		this.renderer.write(Templates.Button, buttons, this.element);
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

})(View);function TestPerformance() {};

(function(me) {

	me.prototype.run = function() {
		var me = this;

		var test = function(msg, func) {
			var divContainer = document.createElement('div');
			divContainer.appendChild(document.createElement('div'));
			
			var start = (new Date).getTime();
			for(var i = 0; i < 3; i++ ) {
				func(divContainer);			
			}
			console.log(msg, ((new Date).getTime() - start), ' ms');		
		};

		// Create 15 000 buttons
		var buttons = [{ left: 30, top: 20, width: 20, height: 20, text: 'Hello'}];
		for(var i = 0; i < 15000; i++) buttons.push(buttons[0]);
		
		console.log('Time to render 1000 buttons 5 times (redraws involves destroy)');

		test('DOM', function(divContainer) {			
			var doc = me.renderDom(buttons);
 			divContainer.innerHTML = '';
			divContainer.appendChild(doc);
		});

		/**
		 * Creating a new element, fill with innerHTML and 
		 * replaceChild is multiple times faster than both DOM
		 * and innerHTML alone in most browsers
		 * 
		 * From
		 * http://blog.stevenlevithan.com/archives/faster-than-innerhtml
		 *
		 * Benchmarks
		 * http://stevenlevithan.com/demo/replaceHtml.html
		 */
		test('replaceHtml', function(divContainer) {		
			var html = me.renderHtml(buttons);
			var div = document.createElement('div');
			div.innerHTML = html;
			divContainer.replaceChild(div, divContainer.firstChild);			
		});

		test('innerHTML', function(divContainer) {		
			var html = me.renderHtml(buttons);
			divContainer.innerHTML = html;
		});
	};

	me.prototype.renderDom = function(buttons) {
		var fragment = document.createDocumentFragment();
		for(var i in buttons) {
			if(buttons.hasOwnProperty(i) == false) continue;
			
			var div = document.createElement('div');
			div.innerText = buttons[i].text;
			
			fragment.appendChild(div);
		}
		return fragment;
	};
	
	me.prototype.renderHtml = function(buttons) {
		var html = [];
		for(var i in buttons) {
			if(buttons.hasOwnProperty(i) == false) continue;
			html.push('<div>' + buttons[i].text + '</div>');
		}
		return html.join('');
	};

}(TestPerformance));

function Renderer() {

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

		// We need to replace a child within the element,
		// if there doesn't already exist one - create it.
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

})();/* Will be compressed into one line by Makefile */var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; Templates.Raw.Button = '	{{##def.unit:		{{? it.position == "relative" }}		%		{{?? it.position == "absolute" }}		px		{{??}} 		px		{{?}}	#}}	<div class="component" 		 style="left: {{=it.left}}{{#def.unit}};	 	     	top: {{=it.top}}{{#def.unit}};">		{{=it.text}}	</div>';
	/**
	 * Make Open Ratio a global object
	 * and expose the Main module of FlexEditor
	 */
	window.OR = window.OR || {};
	OR.FlexEditor = Main;
	OR.TestPerformance = TestPerformance;

})(jQuery);