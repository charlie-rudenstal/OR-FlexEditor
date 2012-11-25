var ElementCollection = (function(me) {

	var elements = {};
	var selectedElement;
	var ghostId = null;

	me.create = function(properties) {
		return new Element(properties);
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
		$(element).on('layoutInvalidated', function() { me.invalidateLayout() });
		me.invalidateLayout();
	}

	me.invalidateLayout = function() {
		$(me).trigger('layoutInvalidated');
	}

	me.remove = function(element) {
		elements[element.property('id')] = null;
		delete elements[element.property('id')];

		invalidateLayout();

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
		$(me).trigger('invalidateLayout');
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

	me.getRootChildrenAsArray = function() {
		var elmArray = [];
		for(var i in elements) {
			if(elements[i].parentElement == null) elmArray.push(elements[i]);
		}
		return elmArray;	
	}

	me.getSelected = function() {
		return selectedElement;
	}

	me.getFromDom = function(domElement) {
		var closest = $(domElement).closest('*[data-element-id]');
		if(closest.size() == 0) return null;
		var elementId = closest.data('element-id');
		return me.getById(elementId);
	}

	return me;
})({});
