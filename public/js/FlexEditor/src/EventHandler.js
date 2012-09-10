function eventHandler(action, context) {
	return function(e) {
		action(e, context);
	}
};