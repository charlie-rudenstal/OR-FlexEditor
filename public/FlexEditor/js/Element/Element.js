function Element(parent, options) {
	if(parent == null) throw "Parent for Element cannot be null";
	options = options || {};
	this.template = Templates.Element;

	// Parent
	this.parent = parent;
	this.parentWidth = $(parent).width();
	this.parentHeight = $(parent).height(); 

	// ID and text
	this.id = Element.idCounter++;

	// Type of Element (based on Text, Image etc)
	this.contentType(options._contentType || 'Text');
	
	// Position
	this.positionType = options.positionType || 'absolute';

	this.selected = false;

	for(var i in options) {
		if(typeof this[i] == 'undefined') this[i] = options[i];
	}
};

Element.idCounter = 0;

Element.prototype.select = function() {
	this.template = Templates.ElementSelected;
	this.selected = true;
}

Element.prototype.blur = function() {
	this.template = Templates.Element;
	this.selected = false;
}

Element.prototype.contentType = function(value) {
	if(value) {
		this._contentType = value;
		this.contentTemplate = Templates['ElementType' + value];
		if(!this.contentTemplate) console.log('Warning: Could not find Content Template for Element type', value);
	} else {
		return this._contentType;
	}
}

// Should be called after raw attributes has been changed, like for example text
// to notify this object and other listener about the change
Element.prototype.invalidate = function() {
	$(this).trigger('change');
}

Element.prototype.getOptions = function() {
	var options = {};
	for(var i in this) {
		if(!this.hasOwnProperty(i)) continue;
		if(typeof this[i] == 'function') continue;
		options[i] = this[i];
	}
	return options;
}

Element.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			return this._x;
		else {
			return this._x / 100 * this.parentWidth;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value < 0) value = 0;
		if(value != this._x) {
			this._x = value;
			this.invalidate();
		}
	}
};

Element.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this._y;
		else return this._y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value < 0) value = 0;
		if(value != this._y) {
			this._y = value;
			this.invalidate();
		}
	}
};

Element.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative")
			 return this._width;
		else return this._width / 100 * this.parentWidth;
	else {
		if(positionType != "relative")	value = value / this.parentWidth * 100; 
		if(value != this._width) {
			this._width = value;
			this.invalidate();	
		}
	}
};

Element.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this._height;
		else return this._height / 100 * this.parentHeight;
	else 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value != this._height) {
			this._height = value;
			this.invalidate();
		}
};

