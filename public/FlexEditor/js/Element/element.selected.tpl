/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementSelected = '

	<div id="element_{{=it.id}}" 
	 	 class="component button"
	 	 style="left: {{=it.x(null, "absolute")}}px;
	 	     	top: {{=it.y(null, "absolute")}}px;
	 	     	width: {{=it.width(null, "absolute")}}px;
	 	     	height: {{=it.height(null, "absolute")}}px;
	 	     	background-color: {{=it.background}}
	 	     	">

		{{=it.contentTemplate(it)}}
	
	 	<div class="resizeBorder"></div>

	 	<div class="resizeBox resizeBox-topleft"></div>
	 	<div class="resizeBox resizeBox-topright"></div>
	 	<div class="resizeBox resizeBox-bottomleft"></div>
	 	<div class="resizeBox resizeBox-bottomright"></div>
	 	
	 	<div class="resizeBox resizeBox-middleleft"></div>
	 	<div class="resizeBox resizeBox-middleright"></div>
	 	<div class="resizeBox resizeBox-middletop"></div>
	 	<div class="resizeBox resizeBox-middlebottom"></div>

	</div>

';