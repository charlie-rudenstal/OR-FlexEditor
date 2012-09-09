function View() {
	this.buttons = [];
};

(function(me) {
	
	me.prototype.add = function(button) {
		this.buttons.push(button);
	}

	me.prototype.getButtons = function() {
		return this.buttons;
	}

})(View);