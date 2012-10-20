function Popover(options) {
	return {
		getResults: Popover.getResults.bind(Popover, options.contentsTemplate,
												     options.renderer,
												     options.onRetrieved)
	};
};

(function(me) {


	me.getResults = function(contentsTemplate, renderer, button, callbacks, existingButton) {

		// Determine best placement depending on available screen area
		var buttonPosition = button.position();

		var buttonRect = getRect(button);
  		var windowRect = getRect($(window));

		var distanceToLeftEdge = buttonRect.x;
		var distanceToRightEdge = windowRect.width - buttonRect.right;
		var distanceToTopEdge = buttonRect.y;
		var distanceToBottomEdge = windowRect.height - buttonRect.bottom;

		// Find out which direction has the least distance to an edge
		// and use to opposite placement (ie, if we're close to the left, the popover should
		// be displayed to the right)
		var popoverWidth = 236;
		var popoverHeight = 146;
		var placement = 'right'; // opposite of left edge
		var minDistance = distanceToLeftEdge; 
		if(minDistance > distanceToRightEdge) { placement = 'left'; minDistance = distanceToRightEdge };
		if(minDistance > distanceToTopEdge) { placement = 'bottom'; minDistance = distanceToTopEdge };
		if(minDistance > distanceToBottomEdge) { placement = 'top'; minDistance = distanceToBottomEdge };
		
		// Render a popover using the body template with the Create Button form
		// Retrieve a reference to the generated popover element
		// and enable js beaviors for twitter bootstrap
		button.popover({
			title: "Button",
			placement: placement,
			html: true,
			content: renderer.render(Templates.CreateButtonPopover, existingButton),
			trigger: 'manual'
		});

		button.popover('show');

		var popover = $('.popover');

		popover.find('.color').colorpicker();
		
		// Give focus to first text area (html5 autofocus doesn't work in twitter bootstraps popover)
		popover.find('input:first-child')[0].focus();

		var accepted = false;
		popover.find('form').submit(function(e) {
			var results = $(this).serializeObject();
			callbacks.onSuccess(results);
			button.popover('destroy');
			e.preventDefault();
		})

		popover.find('*[data-dismiss=popover]').click(function(e) {
			button.popover('destroy');
			callbacks.onCancelled();
		});


		popover.on('keydown', function(e) {
			if(e.keyCode == 27) {
				button.popover('destroy');
				callbacks.onCancelled(); 
			}
		});

		function getRect(element) {
			var rect = {};

			rect.width = element.width();
			rect.height = element.height();

			// position is not supported for the window object
			if (element.get(0) != window) {
				var position = element.position();
				rect.x = position.left;
				rect.y = position.top;
				rect.right = rect.x + rect.width;
		  		rect.bottom = rect.y + rect.height;
	  		}
	  		return rect;
		}

	}

})(Popover);