var PropertyPanel = (function(me) { 

	me.show = function(element, renderer, renderToElement, x, y) {

		render();
		
		function render() {
			renderer.write({ element: element, x: x,  y: y }, renderToElement, Templates.PropertiesText, false, true);
			setTimeout(function() { $('.propertyPanel input').first().select() }, 0)
		}

	}

	me.closeAll = function() {
		$('.propertyPanel').remove();
	}

	return me;
})({});