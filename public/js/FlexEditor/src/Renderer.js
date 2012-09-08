function Renderer() {
	
	var htmlBtn = Templates.Button;
	this.btn = doT.template(htmlBtn);

};

(function(me) {
	
	/**
	 * Transform an array of buttons to HTML
	 * @param array buttons of {
	 * 	 position: 'relative'	
	 * 	 left: 30,
	 * 	 top: 10,
	 * 	 width: 30,
	 *   height: 20 
	 * }
	 */
	me.prototype.render = function(buttons) {
		var html = '', i = -1, len = buttons.length - 1;
		while(i < len) {
			html += this.btn(buttons[i += 1]);			
		}
		return html;
	}

})(Renderer);