/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeImage = '

	<div class="content">
	 	{{?it.image && it.image != "null"}}
			<div style="background: url({{=it.image}}) no-repeat left top; position: absolute;
						background-size: {{=it.width(null, "absolute")}}px auto;
						width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}
	</div>

';