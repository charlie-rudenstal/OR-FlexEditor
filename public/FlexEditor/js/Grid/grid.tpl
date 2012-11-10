/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Grid = '

	<div class="grid-root">
	{{ for(var x = 0; x < it.width + 1; x++ ) { }}
		<div class="grid-line" style="
				left: {{=x * it.cellSize.width}}px; 
				top: 0px;
				width: 1px; 
				height: 800px;"></div>
	{{ } }}
	{{ for(var y = 0; y < it.height + 1; y++ ) { }}
		<div class="grid-line" style="
				left: 0px; 
				top: {{=y * it.cellSize.height}}px;
				width: 800px; 
				height: 1px;"></div>		
	{{ } }}
	</div>

';