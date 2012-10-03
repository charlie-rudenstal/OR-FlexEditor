function eventHandler(action, context) {
	return function(e) {
		action(e, context);
	}
    
};

function merge(a, b, deep) {
	var isDeep = deep === true;
	return $.extend(isDeep, {}, a, b);
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