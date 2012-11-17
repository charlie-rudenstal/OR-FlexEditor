/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementGhost = '

	<div id="element_{{=it.id}}" 
	 	 class="component button {{=it.resizeDir}} 
	 		    {{?it.isMoving}}isMoving{{?}}
	 	     	{{?it.image}}hasImage{{?}}"
	 	 style="left: {{=it.x(null, "absolute")}}px;
	 	     	top: {{=it.y(null, "absolute")}}px;
	 	     	width: {{=it.width(null, "absolute")}}px;
	 	     	height: {{=it.height(null, "absolute")}}px;
	 	     	background: none;
	 	     	border: 1px solid #3276a9;
	 	     	">

		<div class="content">
			
		</div>

	</div>

';