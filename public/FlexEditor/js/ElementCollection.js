var ElementCollection = (function(me) {

	var elements = {};
	var selectedElement;

	me.add = function(element) {
		elements[element.id] = element;
		$(element).on('change', function() { $(me).trigger('change'); });
		$(me).trigger('change');
	}

	me.select = function(elementToSelect) {
		if(elementToSelect == selectedElement) return;
		if(selectedElement) selectedElement.blur();
		selectedElement = elementToSelect;
		if(elementToSelect) elementToSelect.select();
		$(me).trigger('change');
		$(me).trigger({type: 'selection', element: elementToSelect});
	}

	me.getById = function(elementId) {
		return elements[elementId];
	}

	me.getAsArray = function() {
		var elmArray = [];
		for(var i in elements) {
			elmArray.push(elements[i]);
		}
		return elmArray;
	}

	me.getSelected = function() {
		return selectedElement;
	}

	return me;
})({});
