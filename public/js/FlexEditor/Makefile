src = src
tpl = src/tpl

start = 	$(src)/_start.js
end =		$(src)/_end.js

#$(src)/TestPerformance.js
			
files = 	$(src)/Main.js\
	 	 	$(src)/GridRenderer.js\
			$(src)/MouseHandler.js\
			$(src)/Helpers.js\
			$(src)/Modal.js\
			$(src)/Renderer.js\
			$(src)/Templates.js
			
templates = $(tpl)/button.tpl\
 		    $(tpl)/preselection.tpl\
			$(tpl)/createButton.modal.tpl\
			$(tpl)/modal.tpl

FlexEditortarget.js: ${files}

	# Add the function wrapper
	cat ${start} > FlexEditor.js

	# Append the modules
	cat ${files} >> FlexEditor.js

	# HTML Templates (remove newlines to support multiline strings in source)
	cat ${templates} | tr -d "\n" >> FlexEditor.js
	
	# And finally exposing public objects
	cat ${end} >> FlexEditor.js

watch:
	echo Watching for changes and automatically merging FlexEditor.js yeah
	$(MAKE) -s FlexEditor.js
	while true ; do \
		inotifywait -qqr src; \
		$(MAKE) -s; \
	done

watchmac:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while kqwait src; do \
		echo build \
		$(MAKE) -s; \
	done	

.PHONY: watch, FlexEditortarget.js
.SILENT: watch FlexEditortarget.js 