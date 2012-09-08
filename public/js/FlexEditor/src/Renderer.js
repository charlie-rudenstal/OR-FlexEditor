function Renderer() {

};

(function(me) {
	
	/**
	 * Transform an array to HTML
	 * @param func  pre-compiled template function
	 * @param array buttons of {
	 * 	 position: 'relative',	
	 * 	 left: 30,  top: 10,
	 * 	 width: 30, height: 20 
	 * }
	 */
	me.prototype.render = function(template, buttons) {
		var html = '', i = -1, len = buttons.length - 1;
		while(i < len) {
			html += template(buttons[i += 1]);			
		}
		return html;
	}

	me.prototype.write = function(template, buttons, toElement)
	{		
		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.innerHTML = this.render(template, buttons);

		// We need to replace a child within the element,
		// if there doesn't already exist one - create it.
		if(!toElement.firstChild) {
			toElement.appendChild(document.createElement('div'));
		}
		
		toElement.replaceChild(div, toElement.firstChild);
	}

})(Renderer);