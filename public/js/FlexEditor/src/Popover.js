function Popover(options) {
	return {
		getResults: Popover.getResults.bind(Popover, options.contentsTemplate,
												     options.renderer,
												     options.onRetrieved)
	};
};

(function(me) {

	me.getResults = function(contentsTemplate, renderer, button, callbacks, existingButton) {


		var existingButton = existingButton || new Button();

		// Render a popover using the body template with the Create Button form
		// Retrieve a reference to the generated popover element
		// and enable js beaviors for twitter bootstrap
		button.popover({
			title: "Button",
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

	}

})(Popover);