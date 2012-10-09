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

 	<!-- 
 	http://cdn3.iconfinder.com/data/icons/ilb/Perspective%20Button%20-%20Go.png 
 	-->

	<div id="button_{{=it.id}}" 
	 	 class="component button {{=it.resizeDir}} 
	 		    {{?it.isMoving}}isMoving{{?}}
	 	     	{{?it.image}}hasImage{{?}}"
	 	 style="left: {{=it.x(null, it.position)}}{{#def.unit}};
	 	     	top: {{=it.y(null, it.position)}}{{#def.unit}};
	 	     	width: {{=it.width(null, it.position)}}{{#def.unit}};
	 	     	height: {{=it.height(null, it.position)}}{{#def.unit}};
	 	     	background-color: {{=it.background}}
	 	     	">

	 	{{?it.image}}
			<div style="background: url({{=it.image}}) no-repeat center center; position: absolute;
						width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}

		<div class="content" style="color: {{=it.foreground}}">
			{{=it.text}}
		</div>

	 	{{? it.resizeDir}}
	 		<div class="resizeAdorner {{=it.resizeDir}}"></div>
	 	{{?}}

		{{? it.showPositionType}}
	 		<div class="positionTypeAdorner">{{#def.unit}}</div>
		{{?}}
	</div>

';