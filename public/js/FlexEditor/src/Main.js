/**
 * TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
 */

function Main(options) {
	this.domContainer = document.getElementById(options.containerId);
	this.renderer = new Renderer();	
};

(function(me) {

	me.prototype.load = function(domContainer) {
		domContainer = domContainer || this.domContainer;
		domContainer.appendChild(document.createElement('div'));

		var buttons = [
			  { left: 50, top: 50, width: 20, height: 20, text: 'Hello'}
			, { left: 19, top: 10, width: 20, height: 20, text: 'World'}
		];

		var start = (new Date).getTime();
		
		for(var i = 0; i < 30000; i++ ) {
			var html = this.renderer.render(buttons);
		}

		console.log('time', ((new Date).getTime() - start), ' ms');		
		

		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.innerHTML = html;
		domContainer.replaceChild(div, domContainer.firstChild);
	};

}(Main));

