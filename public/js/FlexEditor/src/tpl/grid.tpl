/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Grid = '

	<div class="grid-root">
	{{ for(var x = 0; x < 80; x++ ) { }}
		{{ for(var y = 0; y < 80; y++ ) { }}
			<div class="grid-cell" style="
				left: {{=x * it.cellSize.width}}px; 
				top: {{=y * it.cellSize.height}}px;
				width: {{=it.cellSize.width}}px; 
				height: {{=it.cellSize.height}}px;"></div>
		{{ } }}
	{{ } }}
	</div>

';