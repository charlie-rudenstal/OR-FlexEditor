/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementSelected = '

	<div id="element_{{=it.id}}" 
	 	 class="component button {{=it.resizeDir}} 
	 		    {{?it.isMoving}}isMoving{{?}}
	 	     	{{?it.image}}hasImage{{?}}
	 	     	element-selected"
	 	 style="left: {{=it.x(null, "absolute")}}px;
	 	     	top: {{=it.y(null, "absolute")}}px;
	 	     	width: {{=it.width(null, "absolute")}}px;
	 	     	height: {{=it.height(null, "absolute")}}px;
	 	     	background-color: {{=it.background}}
	 	     	">

	 	{{?it.image}}
			<div style="background: url({{=it.image}}) no-repeat left top; position: absolute;
						background-size: {{=it.width(null, "absolute")}}px auto;
						width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}

		<div class="content" style="color: {{=it.foreground}}">
			{{=it.text}}
		</div>

	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}

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