(function($) {
/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	this.domContainer = document.getElementById(options.containerId);
	this.renderer = new Renderer();
	Templates.init();
};

(function(me) {

	me.prototype.load = function(domContainer) {
		domContainer = domContainer || this.domContainer;
	
		var buttons = [
			  { position: 'relative', left: 30, top: 10, width: 20, height: 20, text: 'Hello'}
			, { position: 'relative', left: 40, top: 10, width: 20, height: 20, text: 'World'}
			, { position: 'absolute', left: 50, top: 50, width: 20, height: 20, text: 'Again'}
		];

		var start = (new Date).getTime();
		for(var i = 0; i < 10000; i++)		
			this.renderer.write(Templates.Button, buttons, domContainer);	
		console.log('time', ((new Date).getTime() - start), ' ms');		
	};

	me.prototype.test = function(domContainer) {
		var buttons = [
			  { left: 50, top: 50, width: 20, height: 20, text: 'Hello'}
			, { left: 19, top: 10, width: 20, height: 20, text: 'World'}
		];

		var start = (new Date).getTime();
		for(var i = 0; i < 10000; i++)		
			this.renderer.write(Templates.Button, buttons, domContainer);	
		console.log('time', ((new Date).getTime() - start), ' ms');
	}

}(Main));

function TestPerformance() {};

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