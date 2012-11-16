var PropertyPanel = (function(me) { 

	me.show = function(element, renderer, renderToElement, x, y) {

		// we only handle one PropertyPanel at once, close all others
		me.closeAll();

		// and render the panel with current element
		render();
		
		function render() {

			var templateName = 'Properties' + element.contentType();
			var template = Templates[templateName];
			if(!template) console.log("Warning: Property Template for Element type ", element.type, "not found");

			renderer.write({ element: element, x: x,  y: y }, renderToElement, template, false, true);
			setTimeout(function() { $('.propertyPanel input').first().select() }, 0)
		}

		// Save properties directly on each keystroke. Determine which property
		// should be modified by looking at the inputs data-property attribute
		$('.propertyPanel').on('keyup', 'input[data-property]', function(e) {
			var input = $(e.currentTarget);
			var property = input.data('property');			
			element[property] = input.val();
			element.invalidate();
		});

		// A click on an element with the class .btn-delete in the properties template is treated as a delete button 
		$('.propertyPanel').on('click', '.btn-delete', removeElement);
		$('body').on('keydown.propertyPanel', function(e) {
			var keyDelete = 46;
			if(e.shiftKey && e.keyCode == keyDelete) {
				removeElement();
			}
		});

		// Remove the element for this PropertyPanel when the remove/delete button is clicked and close this panel
		function removeElement() {
			
			// TODO: Select next element in list before Delete

			// Remove the element
			ElementCollection.remove(element);		 
			
			// Since this PropertyPanels element is removed there is no purpose to leave it open
			me.closeAll();
		}
	}

	me.closeAll = function() {
		$('body').off('keydown.propertyPanel');
		$('.propertyPanel').remove();
	}

	return me;
})({});