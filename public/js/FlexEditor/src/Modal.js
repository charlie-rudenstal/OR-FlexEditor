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
		
		modal.find('.btn-primary').click(function() {
			// Serialize form data with jquery
			
			var results = modal.find('form').serializeObject();

			//console.log(modal.find('form'));

			console.log(results);

		})
	}

})(Modal);