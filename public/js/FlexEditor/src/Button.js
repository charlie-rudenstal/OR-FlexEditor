function Button(options) {
	 options = options || {};
	 this.id = Button.idCounter++;
	 this.text = options.text || '';
	 this.position = options.position || 'relative';
	 this.rect = options.rect || { x: 0, y: 0, width: 0, height: 0 };
	 this.rectAbs = toAbsolute(this.rect);
	 this.showPositionType = options.showPositionType || false;
	 this.isMoving = options.isMoving || false;
	 this.customClass = options.customClass;
	 this.image = options.image || null;

	 this.background = options.background || '#5296c9';
	 this.foreground = options.foreground || '#ffffff';
};

Button.idCounter = 0;

Button.prototype.x = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.x / 100 * 800;
		else 
			return this.rect.x;
	else 
		if(positionType == "absolute") 
			this.rect.x = value / 800 * 100;
		else 
			this.rect.x = value;
};

Button.prototype.y = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.y / 100 * 800;
		else 
			return this.rect.y;
	else 
		if(positionType == "absolute") 
			this.rect.y = value / 800 * 100;
		else 
			this.rect.y = value;
};

Button.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.width / 100 * 800;
		else 
			return this.rect.width;
	else 
		if(positionType == "absolute") 
			this.rect.width = value / 800 * 100;
		else 
			this.rect.width = value;
};

Button.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.height / 100 * 800;
		else 
			return this.rect.height;
	else 
		if(positionType == "absolute") 
			this.rect.height = value / 800 * 100;
		else 
			this.rect.height = value;
};

