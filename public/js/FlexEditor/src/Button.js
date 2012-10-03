function Button(options) {
	 this.text = options.text || 'New button';
	 this.position = options.position || 'relative';
	 this.rect = options.rect;
	 this.rectAbs = toAbsolute(options.rect);
	 this.customClass = options.customClass;
};

Button.prototype.x = function(value, positionType) {
	if(value) 
		if(positionType == "absolute") 
			this.rect.x = value / 800 * 100;
		else 
			this.rect.x = value;
	else 
		if(positionType == "absolute") 
			return this.rect.x / 100 * 800;
		else 
			return this.rect.x;
};

Button.prototype.y = function(value, positionType) {
	if(value) 
		if(positionType == "absolute") 
			this.rect.y = value / 800 * 100;
		else 
			this.rect.y = value;
	else 
		if(positionType == "absolute") 
			return this.rect.y / 100 * 800;
		else 
			return this.rect.y;
};

Button.prototype.width = function(value, positionType) {
	if(value) 
		if(positionType == "absolute") 
			this.rect.width = value / 800 * 100;
		else 
			this.rect.width = value;
	else 
		if(positionType == "absolute") 
			return this.rect.width / 100 * 800;
		else 
			return this.rect.width;
};

Button.prototype.height = function(value, positionType) {
	if(value) 
		if(positionType == "absolute") 
			this.rect.height = value / 800 * 100;
		else 
			this.rect.height = value;
	else 
		if(positionType == "absolute") 
			return this.rect.height / 100 * 800;
		else 
			return this.rect.height;
};

