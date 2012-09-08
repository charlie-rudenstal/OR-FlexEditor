dir = src/
files = 	$(dir)_start.js\
		 	$(dir)Main.js\
			$(dir)Renderer.js\
			$(dir)_end.js

FlexEditor.js: ${files}
	@cat > $@ $^

watch:
	echo Watching for changes and automatically merging FlexEditor.js
	$(MAKE) -s FlexEditor.js
	while true ; do \
		inotifywait -qqr .; \
		$(MAKE) -s FlexEditor.js; \
	done

.PHONY: watch
.SILENT: watch FlexEditor.js 