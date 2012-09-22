function Modal(options) {
	return {
		getResults: Model.getResults.bind(Model, options.contentsTemplate,
												 options.renderer,
												 options.onRetrieved)
	};
};

(function(me) {

	me.getResults = function(contentsTemplate, renderer, onRetrieved) {
		var contents = renderer.render(Templates.CreateButtonModal, [{}]);
			
		renderer.write(Templates.Modal, [{

			header: "Modal",
			body: contents

		}], document.body);

		// Retrieve a reference to the generated modal element
		var modal = $('.modal');

		// Enable js behaviors for twitter bootstrap
		modal.modal();

		// Give focus to first text area (autofocus don't work with twitter bootstraps modal)
		modal.find('input:first-child').focus();
		
		var onSubmit = function() {
			// Serialize form data with jquery
			var results = modal.find('form').serializeObject();
			// Pass form data to callback and close modal
			onRetrieved(results);
			modal.modal('hide');
		}		

		modal.find('.btn-primary').click(onSubmit);
		modal.find('form').submit(function(e) {
			onSubmit();
			e.preventDefault();
		})

	}

})(Modal);