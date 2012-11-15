var ElementCollection = (function(me) {

	var elements = {};
	var selectedElement;

	me.add = function(element) {
		elements[element.id] = element;
	}

	me.select = function(elementToSelect) {
		if(elementToSelect == selectedElement) return;
		if(selectedElement) selectedElement.blur();
		if(elementToSelect) elementToSelect.select();
		selectedElement = elementToSelect;
		$(me).trigger('change');
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
