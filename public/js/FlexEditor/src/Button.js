function Button(options) {
	 this.id = Button.idCounter++;
	 this.text = options.text || 'New button';
	 this.position = options.position || 'relative';
	 this.rect = options.rect;
	 this.rectAbs = toAbsolute(options.rect);
	 this.customClass = options.customClass;
	 this.showPositionType = options.showPositionType || false;
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

