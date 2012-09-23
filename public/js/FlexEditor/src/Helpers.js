function eventHandler(action, context) {
	return function(e) {
		action(e, context);
	}
};

function merge(a, b) {
	return $.extend({}, a, b);
}