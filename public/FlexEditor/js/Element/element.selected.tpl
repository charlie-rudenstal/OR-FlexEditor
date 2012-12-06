/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementSelected = '

	<div id="element_{{=it.property("id")}}" 
	 	 class="component button"
	 	 data-element-id="{{=it.property("id")}}"
	 	 style="left: {{=it.xUnit()}};
	 	     	top: {{=it.yUnit()}};
	 	     	width: {{=it.widthUnit()}};
	 	     	height: {{=it.heightUnit()}};
	 	     	background: {{=it.property("background")}};
				{{?it.property("centerx")}}
                	position: absolute;
                	left: 50%;
                	margin-left: -{{=it.property("width") / 2 + it.getUnit()}};
				{{?}}
				{{?it.property("centery")}}
                	position: absolute;
                	top: 50%;
                	margin-top: -{{=it.property("height") / 2 + it.getUnit()}};
				{{?}}
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