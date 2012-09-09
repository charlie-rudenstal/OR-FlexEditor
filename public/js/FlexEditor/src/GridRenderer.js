// background-size: 10% 10%, 10% 10%;

function GridRenderer() {

};

(function(me) {

	me.prototype.render = function(element, cellSize) {
		$(element).addClass('grid-single');

		var width = cellSize.width + '%';
		var height = cellSize.height + '%';

		var css = height +  ' ' + height + ', ' +
				  width  +  ' ' + width;

		element.style.backgroundSize = css;
	}

})(GridRenderer);