var PropertyPanel = (function(me) { 

	me.show = function(element, renderer, renderToElement, x, y) {

		// we only handle one PropertyPanel at once
		me.closeAll();

		render();
		
		function render() {

			var templateName = 'Properties' + element.contentType();
			var template = Templates[templateName];
			if(!template) console.log("Warning: Property Template for Element type ", element.type, "not found");

			renderer.write({ element: element, x: x,  y: y }, renderToElement, template, false, true);
			setTimeout(function() { $('.propertyPanel input').first().select() }, 0)
		}

		$('.propertyPanel').on('keyup', 'input[data-property]', function(e) {

			var input = $(e.currentTarget);
			var property = input.data('property');
			
			element[property] = input.val();
			element.invalidate();

		});

	}

	me.closeAll = function() {
		$('.propertyPanel').remove();
	}

	return me;
})({});