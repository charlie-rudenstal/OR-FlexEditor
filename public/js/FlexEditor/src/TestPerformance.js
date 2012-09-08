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

