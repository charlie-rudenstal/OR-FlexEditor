/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementSelected = '

	<div id="element_{{=it.property("id")}}" 
	 	 class="component button"
	 	 style="left: {{=it.xUnit()}};
	 	     	top: {{=it.yUnit()}};
	 	     	width: {{=it.widthUnit()}};
	 	     	height: {{=it.heightUnit()}};
	 	     	background: {{=it.property("background")}}
	 	     	">

		<div class="content">
			{{=it.contentTemplate(it)}}
		</div>
	
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