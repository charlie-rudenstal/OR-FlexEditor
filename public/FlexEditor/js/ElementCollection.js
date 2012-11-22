var ElementCollection = (function(me) {

	var elements = {};
	var selectedElement;
	var ghostId = null;
	var cellSize = null;

	me.setCellSize = function(pCellSize) {
		cellSize = pCellSize;
	}

	me.create = function(parent) {
		return new Element(parent, {cellSize: cellSize});
	}

	// add an element to the collection. isGhost can be specified to keep
	// track of which ID:s are drag&drop ghosts which will simplify removal of these 
	// temporary elements. could be generalized later to some kind of 'delete by tag' 
	// or 'modify by tag' when/if needed
	me.add = function(element, isGhost) {
		elements[element.property('id')] = element;
		if(isGhost) {
			ghostId = element.property('id');
			element.template = Templates.ElementGhost;
		}
		$(element).on('change', function() { $(me).trigger('change'); });
		$(me).trigger('change');
	}

	me.remove = function(element) {
		elements[element.property('id')] = null;
		delete elements[element.property('id')];
		$(me).trigger('change');

		// we need to update the results of hasGhost if user removed 
		// the ghost by other means than removeGhost
		if(element.id == ghostId) ghostId = null;
	}

	me.removeGhost = function() {
		me.remove({id: ghostId});
		ghostId = null;
	}

	me.convertGhostToElement = function() {
		var ghost = elements[ghostId];
		ghostId = null;
		ghost.property('contentType', ghost.property('contentType'));
	}

	me.getGhost = function() {
		return elements[ghostId];
	}

	me.hasGhost = function() {
		return ghostId != null;
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
