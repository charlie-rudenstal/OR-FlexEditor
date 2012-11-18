function Renderer(options) {
	var options = options || {};
	this.items = options.items;
	this.toElement = options.toElement;
	this.latestDataRendered = [];
};

(function(me) {

	/**
	 * Transform an item array of data objects to HTML using
	 * the provided template function
	 * @param func  pre-compiled template function
	 * @param array array of {
	 * 	 position: 'relative',	
	 * 	 left: 30,  top: 10,
	 * 	 width: 30, height: 20 
	 * }
	 */
	me.prototype.render = function(items, defaultTemplate, alwaysUseDefaultTemplate) {
			
		items = items || this.items || [{}];

		// Allow a single element by turning it into an array
		if($.isArray(items) === false) {
			items = [items];
		}	

		var html = '';
		var i = -1;
		var len = items.length - 1;

		while(i++ < len) {
			// Use custom template provided by item if existing,
			// otherwise use default template
			if(items[i].template && !alwaysUseDefaultTemplate) {
				html += items[i].template(items[i]);
			} else {
				html += defaultTemplate(items[i]);	
			}	
		}
		
		return html;
	}


	me.prototype.write = function(items, toElement, defaultTemplate, ignoreCache, alwaysUseDefaultTemplate) {
		// Optimize rendering by only doing it when item array data has changed 
		if(!ignoreCache && equals(items, this.latestDataRendered)) return;
		this.latestDataRendered = clone(items); 

		toElement = toElement || this.toElement;

		// Creating empty div, set innerHTML and then replaceChild
		// is a major performance boost compared to just innerHTML
		var div = document.createElement('div');
		div.style.width = toElement.style.width;
		div.style.height = toElement.style.height;
		div.innerHTML = this.render(items, defaultTemplate, alwaysUseDefaultTemplate);

		// We need a child element inside the Editor div which 
		// we can replace, create if not existing
		if(!toElement.firstChild) {
			var innerDiv = document.createElement('div');
			toElement.appendChild(innerDiv);
		}

		toElement.replaceChild(div, toElement.firstChild);
	}

	var equals = function(x, y)
	{
		if(x == y) return true;

		var p;
		for(p in y) {
			if(typeof(x[p])=='undefined') {return false;}
		}

		for(p in y) {
			if (y[p]) {
				switch(typeof(y[p])) {
					case 'object':
					if (!equals(y[p], x[p])) { return false; } break;
					case 'function':
					if (typeof(x[p])=='undefined' ||
					(p != 'equals' && y[p].toString() != x[p].toString()))
					return false;
					break;
					default:
					if (y[p] != x[p]) { return false; }
				}
			} else {
				if (x[p])
				return false;
			}
		}

		for(p in x) {
			if(typeof(y[p])=='undefined') {return false;}
		}

		return true;
	}

})(Renderer);