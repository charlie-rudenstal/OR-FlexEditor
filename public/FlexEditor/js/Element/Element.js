function Element(parent, cellSize, properties) {

	this.properties = {};
	this.parentElement = null;
	if(properties) this.setProperties(properties);
	if(!this.properties.id) this.generateNewId();
		
	if(parent == null) throw "Parent for Element cannot be null";

	this.parent = parent;
	this.parentWidth = $(parent).width();
	this.parentHeight = $(parent).height();

	this.template = Templates.Element;
	this.layerTemplate = Templates.Layer;
	this.selected = false;

	this.cellSize = cellSize;
	
	if(this.hasProperty('contentType')) this.onContentTypeChanged();
	$(this).on('contentTypeChange', this.onContentTypeChanged);

	//$(this).on('parentElementChange', this.onParentElementChange);
};

Element.idCounter = 0;

Element.prototype.properties = {};

Element.prototype.property = function(key, value) {
	if(value == null) {
		return this.properties[key];
	} else {
		if(this.properties[key] != value) {
			if(value == 'true') value = true;
			if(value == 'false') value = false;
			this.properties[key] = value;
			$(this).trigger(key + 'Change'); // widthChange, paddingChange etc
		}
	}
}

Element.prototype.onParentElementChange = function() {
	//if(this.parentElement) {
	//	this.parent = $('#element_' + this.parentElement.property('id')).get(0);
	//}	
	// this.parentWidth = $(this.parent).width();
	// this.parentHeight = $(this.parent).height();

	// Listen for movements on the parent and move this element to reflect that
	// if(this.parentElement) {
	// 	$(this.parentElement).off('xChange yChange', this.onParentMoved);
	// 	$(this.parentElement).on('xChange yChange', this.onParentMoved);
	// 	console.log("setup event handlers for", this.parentElement, this.parent);
	// }
}

// Element.prototype.onParentMoved = function() {
// 	this.x(this.x(null, 'relative'), 'relative');
// 	this.y(this.y(null, 'relative'), 'relative');
// }

Element.prototype.hasProperty = function(key) {
	return this.properties.hasOwnProperty(key);
}

Element.prototype.toggleProperty = function(key) {
	this.property(key, !this.properties[key]);
}

Element.prototype.generateNewId = function() {
	this.property('id', Element.idCounter++);
}

Element.prototype.select = function() {
	this.template = Templates.ElementSelected;
	this.selected = true;
}

Element.prototype.blur = function() {
	this.template = Templates.Element;
	this.selected = false;
}

Element.prototype.onContentTypeChanged = function() {
	var contentType = this.property('contentType');
	this.contentTemplate = Templates['ElementType' + contentType];
	if(!this.contentTemplate) console.log('Warning: Could not find Content Template for Element type', contentType);
}

// Should be called after raw attributes has been changed, like for example text
// to notify this object and other listener about the change
Element.prototype.invalidate = function(property) {
	if(property) $(this).trigger(property + 'Change');
	$(this).trigger('change');
}

Element.prototype.getProperties = function() {
	return clone(this.properties);
}

Element.prototype.setProperties = function(properties) {
	this.properties = clone(properties);
}

Element.prototype.getParent = function() {
	var parent = this.getDomElement().parent().closest('.component');
	if(parent.size() == 0) parent = $("#editor");
	return parent;
	//return this.parent;
}

Element.prototype.getDomElement = function() {
	return $('#element_' + this.property('id'));
}

Element.prototype.getUnit = function() {
	return this.property('positionType') == 'absolute' ? 'px' : '%';
}

Element.prototype.xUnit = function() {
	return this.x() + this.getUnit();
}

Element.prototype.yUnit = function() {
	return this.y() + this.getUnit();
}

Element.prototype.widthUnit = function() {
	return this.width() + this.getUnit();
}

Element.prototype.heightUnit = function() {
	return this.height() + this.getUnit();
}

Element.prototype.x = function(value) {
	if(value == null) {
		return this._x;
	} else {
		this._x = value;
		this.invalidate('x');
	}
};

Element.prototype.y = function(value) {
	if(value == null) {
		return this._y;
	} else {
		this._y = value;
		this.invalidate('y');
	}
};

Element.prototype.width = function(value) {
	if(value == null) {
		return this._width;
	} else {
		this._width = value;
		this.invalidate('width');
	}
};

Element.prototype.height = function(value) {
	
	if(value == null) {
		return this._height;
	} else {
		this._height = value;
		this.invalidate('height');
	}
};

