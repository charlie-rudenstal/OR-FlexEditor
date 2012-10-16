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
	 this.parentWidth = $(options.parent).width();
	 this.parentHeight = $(options.parent).height(); 

	 this.background = options.background || '#3276a9';
	 this.foreground = options.foreground || '#ffffff';
};

Button.idCounter = 0;

Button.prototype.getEditorWidth = function() {
	// return $('#button_' + this.id).closest('.editor').width();
	return this.parentWidth;
}

Button.prototype.getEditorHeight = function() {
	// return $('#button_' + this.id).closest('.editor').height();
	return this.parentHeight;
}

Button.prototype.x = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") {
			return this.rect.x / 100 * this.getEditorWidth();
		} else 
			return this.rect.x;
	else 
		if(positionType == "absolute") 
			this.rect.x = value / this.getEditorWidth() * 100;
		else 
			this.rect.x = value;
};

Button.prototype.y = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.y / 100 * this.getEditorHeight();
		else 
			return this.rect.y;
	else 
		if(positionType == "absolute") 
			this.rect.y = value / this.getEditorHeight() * 100;
		else 
			this.rect.y = value;
};

Button.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") {

			// console.log("left", this, this.getEditorWidth());
			return this.rect.width / 100 * this.getEditorWidth();
		} else 
			return this.rect.width;
	else 
		if(positionType == "absolute")		
			this.rect.width = value / this.getEditorWidth() * 100;
		else 
			this.rect.width = value;
};

Button.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "absolute") 
			return this.rect.height / 100 * this.getEditorHeight();
		else 
			return this.rect.height;
	else 
		if(positionType == "absolute") 
			this.rect.height = value / this.getEditorHeight() * 100;
		else 
			this.rect.height = value;
};

