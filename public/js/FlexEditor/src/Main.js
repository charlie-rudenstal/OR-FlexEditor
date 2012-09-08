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

