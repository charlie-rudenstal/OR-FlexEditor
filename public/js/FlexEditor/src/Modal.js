function Modal(options) {
	return {
		getResults: Model.getResults.bind(Model, options.contentsTemplate,
												 options.renderer,
												 options.onRetrieved)
	};
};

(function(me) {

	me.getResults = function(contentsTemplate, renderer, callbacks) {

		// Render a modal using the body template with the Create Button form
		renderer.write(Templates.Modal, [{
			header: "Modal",
			body: renderer.render(Templates.CreateButtonModal)
		}], document.body);

		// Retrieve a reference to the generated modal element
		// and enable js beaviors for twitter bootstrap
		var modal = $('.modal');
		modal.modal();

		// Give focus to first text area (html5 autofocus doesn't work in twitter bootstraps modal)
		modal.find('input:first-child').focus();

		var accepted = false;

		modal.find('form').submit(function(e) {
			
			var results = $(this).serializeObject();
			callbacks.onSuccess(results);
			
			accepted = true;
			modal.modal('hide');

			e.preventDefault();
		})

		modal.on('hidden', function(e) {
			if(!accepted) callback.onCancelled();
		});

	}

})(Modal);