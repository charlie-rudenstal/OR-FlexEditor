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
	this.selected = false;

	this.cellSize = cellSize;
	
	if(this.hasProperty('contentType')) this.onContentTypeChanged();
	$(this).on('contentTypeChange', this.onContentTypeChanged);

	$(this).on('parentElementChange', this.onParentElementChange);
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
	if(this.parentElement) {
		this.parent = $('#element_' + this.parentElement.property('id')).get(0);
	}	
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
	return this.parent;
}

function getStandardPositionFrom(value, positionType, parentWidthOrHeight, cellSize) {
	if(positionType == 'relative') return value;
	if(positionType == 'absolute') return value / parentWidthOrHeight * 100;
	if(positionType == 'cells') {
		var absolute = value * cellSize;
		var relative = absolute / parentWidthOrHeight * 100;
		return relative;
	}
}

Element.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			return this._x;
		else {
			var absolute = this._x / 100 * this.parentWidth;
			if(this.parentElement) absolute += this.parentElement.x(null, 'absolute');
			return absolute;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value != this._x) {
			this._x = value;
			this.invalidate('x');
		}
	}
};

Element.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this._y;
		else {			
			var absolute = this._y / 100 * this.parentHeight;			
			if(this.parentElement) absolute += this.parentElement.y(null, 'absolute');
			return absolute;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value != this._y) {
			this._y = value;
			this.invalidate('y');
		}
	}
};

Element.prototype.width = function(value, positionType) {
	if(value == null)
		if(positionType == "relative")
			 return this._width;
		else return this._width / 100 * this.parentWidth;
	  else {
	  	value = getStandardPositionFrom(value, positionType, this.parentWidth, this.cellSize.width);
	  	if(value != this._width) {
	  		this._width = value;
			this.invalidate('width');	
		}
	}
};

Element.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this._height;
		else return this._height / 100 * this.parentHeight;
	else 
	  	value = getStandardPositionFrom(value, positionType, this.parentHeight, this.cellSize.height);
	  	if(value != this._height) {
	  		this._height = value;
			this.invalidate('height');	
		}
};

