/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.Button = '

	{{##def.unit:
		{{? it.position == "relative" }}
		%
		{{?? it.position == "absolute" }}
		px
		{{??}} 
		px
		{{?}}
	#}}

	<div class="component button {{=it.resizeDir}} 
	 		    {{?it.isMoving}}isMoving{{?}}" 
	 	 id="button_{{=it.id}}" 
	 	 style="left: {{=it.x(null, it.position)}}{{#def.unit}};
	 	     	top: {{=it.y(null, it.position)}}{{#def.unit}};
	 	     	width: {{=it.width(null, it.position)}}{{#def.unit}};
	 	     	height: {{=it.height(null, it.position)}}{{#def.unit}};">
	 	
	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}

		{{=it.text}}

		{{? it.showPositionType}}
	 		<div class="positionTypeAdorner">{{#def.unit}}</div>
		{{?}}
	</div>

';