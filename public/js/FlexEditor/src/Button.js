function Button(options) {
	if(options == null) throw "Button options cannot be null";
	if(options.parent == null) throw "Parent option cannot be null";

	// Parent
	this.parentWidth = $(options.parent).width();
	this.parentHeight = $(options.parent).height(); 

	// ID and text
	this.id = Button.idCounter++;
	
	// Position
	this.position = options.position || 'absolute';
	this.rect = { x: 0, y: 0, width: 0, height: 0 };
	if (options.rect) {
		this.x(options.rect.x, this.position);
		this.y(options.rect.y, this.position);
		this.width(options.rect.width, this.position);
		this.height(options.rect.height, this.position);
	}

	// States
	this.showPositionType = options.showPositionType || false;
	this.isMoving = options.isMoving || false;

	// Colors, text and image
	this.text = options.text || '';
	this.background = options.background || '#3276a9';
	this.foreground = options.foreground || '#ffffff';
	this.image = options.image || null;
	this.customClass = options.customClass;
};

Button.idCounter = 0;

Button.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			 return this.rect.x;
		else return this.rect.x / 100 * this.parentWidth;
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(between(value, 0, 100 - this.rect.width)) this.rect.x = value;
	}
};

Button.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this.rect.y;
		else return this.rect.y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(between(value, 0, 100 - this.rect.height)) this.rect.y = value;
	}
};

Button.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative")
			 return this.rect.width;
		else return this.rect.width / 100 * this.parentWidth;
	else 
		if(positionType == "relative")		
			 this.rect.width = value;
		else this.rect.width = value / this.parentWidth * 100;	
};

Button.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this.rect.height;
		else return this.rect.height / 100 * this.parentHeight;
	else 
		if(positionType == "relative") 
			 this.rect.height = value;
		else this.rect.height = value / this.parentHeight * 100;
};

