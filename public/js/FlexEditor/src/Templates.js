var Templates = Templates || {};

(function() {
	Templates.compile = function() {	
		// TODO: Loop Templates.Raw and do this automatically
		Templates.Button = doT.template(Templates.Raw.Button);
		Templates.Modal = doT.template(Templates.Raw.Modal);
		Templates.CreateButtonModal = doT.template(Templates.Raw.CreateButtonModal);
		Templates.CreateButtonPopover = doT.template(Templates.Raw.CreateButtonPopover);
		Templates.Preselection = doT.template(Templates.Raw.Preselection);
	}
})();