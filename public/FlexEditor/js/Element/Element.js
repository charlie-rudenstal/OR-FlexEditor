function Element(properties) {
	this.properties = {};
	this.parentElement = null;
	if(properties) this.setProperties(properties);
	if(!this.properties.id) this.generateNewId();
	
	this.template = Templates.Element;
	this.layerTemplate = Templates.Layer;
	this.selected = false;

	if(this.hasProperty('contentType')) this.onContentTypeChanged();
	$(this).on('contentTypeChange', this.onContentTypeChanged);

	$(this).on('xChange yChange widthChange heightChange positionTypeChange', this.onLayoutChanged);
};

Element.prototype.onLayoutChanged = function() {
	this.invalidateLayout();
}

Element.idCounter = 0;
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
Element.prototype.invalidateLayout = function() {
	$(this).trigger('layoutInvalidated');
}

/********************/
/* Handle Propeties */
/********************/
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

Element.prototype.hasProperty = function(key) {
	return this.properties.hasOwnProperty(key);
}

Element.prototype.toggleProperty = function(key) {
	this.property(key, !this.properties[key]);
}

Element.prototype.getProperties = function() {
	return clone(this.properties);
}

Element.prototype.setProperties = function(properties) {
	this.properties = clone(properties);
}

/********************************/
/* Shortcuts for positioning    */
/********************************/
Element.prototype.getUnit = function() {
	return this.property('positionType') == 'absolute' ? 'px' : '%';
}

Element.prototype.xUnit = function() {
	return this.property('x') + this.getUnit();
}

Element.prototype.yUnit = function() {
	return this.property('y') + this.getUnit();
}

Element.prototype.widthUnit = function() {
	return this.property('width') + this.getUnit();
}

Element.prototype.heightUnit = function() {
	return this.property('height') + this.getUnit();
}

Element.prototype.move = function(x, y) {
	var cellSize = this.getCurrentCellSize();
	var absoluteX = x * cellSize.width;
	var absoluteY = y * cellSize.height;
	this.property('x', this.property('x') + absoluteX);
	this.property('y', this.property('y') + absoluteY);
}

Element.prototype.setX = function(x) {
	this.property('x', this.getCurrentCellSize().width * x);
}

Element.prototype.setY = function(y) {
	this.property('y', this.getCurrentCellSize().height * y);
}

Element.prototype.setWidth = function(x) {
	this.property('width', this.getCurrentCellSize().width * x);
}

Element.prototype.setHeight = function(y) {
	this.property('height', this.getCurrentCellSize().height * y);
}

Element.prototype.getCurrentCellSize = function() {
	return this.property('positionType') == 'absolute' 
			? Grid.getCellSize() 
			: Grid.getRelativeCellSize(this.parentElement);
}

Element.prototype.resize = function(width, height) {
	var cellSize = this.getCurrentCellSize();
	var absoluteWidth = width * cellSize.width;
	var absoluteHeight = height * cellSize.height;
	this.property('width', this.property('width') + absoluteWidth);
	this.property('height', this.property('height') + absoluteHeight);
}


Element.prototype.getAbsolute = function() {
	var domElement = this.getDomElement();
	var position = domElement.offset();
	var rootPosition = $('#editor').offset();
	return { x: position.left - rootPosition.left,
			 y: position.top - rootPosition.top, 
			 width: domElement.width(), 
			 height: domElement.height() };
}

Element.prototype.getAbsoluteInParent = function() {
	var domElement = this.getDomElement();
	var position = domElement.position();
	return { x: position.left, y: position.top, 
			 width: domElement.width(), height: domElement.height() };
}

Element.prototype.getCell = function() {
	var abs = this.getAbsoluteInParent();
	var cellSize = Grid.getCellSize();
	return {
		x: ~~(abs.x / cellSize.width),
		y: ~~(abs.y / cellSize.height),
		width: ~~(abs.width / cellSize.width),
		height: ~~(abs.height / cellSize.height)
	};
}

// Element.prototype.getParent = function() {
//  	var parent = this.getDomElement().parent().closest('.component');
//  	if(parent.size() == 0) parent = $("#editor");
//  	return parent;
// }

Element.prototype.getDomElement = function() {
	return $('#element_' + this.property('id'));
}
