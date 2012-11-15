// function eventHandler(action, context) {
// 	return function(e) {
// 		action(e, context);
// 	}    
// };

function delegate(eventHandler) {
	return function(e) {
		if(eventHandler.hasOwnProperty(e.type)) {
			eventHandler[e.type](e, before);
		}
	}
};

function merge(a, b, deep) {
	var isDeep = deep === true;
	return $.extend(isDeep, {}, a, b);
}

function clone(a) {
	if(a instanceof Array) {
		var arr = [];
		for(var i in a) arr.push(clone(a[i]));
		return arr; 
	} else {
		return merge(a, a, true);
	}
}

function cloneArrayShallow(array) {
	return array.slice();
}

function limit(value, min, max) {
	if(value < min) return min;
	if(value > max) return max;
	return value;
}

function between(value, min, max) {
	return value >= min && value <= max;
}

function remove(item, array) {
	var newArray = [];
	for(var i in array) {
		if(array[i] !== item) newArray.push(array[i]);
	}
	return newArray;
}

function replace(array, oldItem, newItem) {
	var newArray = [];
	for(var i in array) {
		if(array[i] === oldItem) newArray.push(newItem);
		else newArray.push(array[i]);
	}
	return newArray;
}

function snapPoint(point, cellSize) {
	return {
		// 					      ~~ is a fast way to trim decimals
		x:      cellSize.width  * ~~(point.x / cellSize.width),
		y:      cellSize.height * ~~(point.y / cellSize.height),
		width:  cellSize.width,
		height: cellSize.height
	};
}

function snapRect(rect, cellSize) {
	// Why math round and not floor, ceil, int cast or ~~?
	// Because we want it to snap to the closest snap point availble,
	// x: 0.8 should snap to 1, and x: 0.3 to 0
	return {
		x:      cellSize.width  * Math.round(rect.x / cellSize.width),
		y:      cellSize.height * Math.round(rect.y / cellSize.height),
		width:  cellSize.width  * Math.round(rect.width / cellSize.width),
		height: cellSize.height * Math.round(rect.height / cellSize.height)
	};	
}

function toAbsolute(fromRect) {
	var editorWidth = 800;
	toRect = {};
	toRect.x = fromRect.x/100 * editorWidth;
	toRect.y = fromRect.y/100 * editorWidth;
	toRect.width = fromRect.width/100 * editorWidth;
	toRect.height = fromRect.height/100 * editorWidth;
	return toRect;
}	

function toRelative(fromRect) {
	var editorWidth = 800;
	toRect = {};
	toRect.x = fromRect.x/editorWidth * 100;
	toRect.y = fromRect.y/editorWidth * 100;
	toRect.width = fromRect.width/editorWidth * 100;
	toRect.height = fromRect.height/editorWidth * 100;
	return toRect;
}