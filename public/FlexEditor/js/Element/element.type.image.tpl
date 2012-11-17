/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeImage = '

	<div>
	 	{{?it.image && it.image != "null"}}
			<div style="position: absolute;
                        background: url({{=it.image}}) no-repeat {{=it.halign}} {{=it.valign}}; 

                        {{?it.stretch == "width"}}
            			    background-size: {{=it.width(null, "absolute")}}px auto;
						{{?}}
                        {{?it.stretch == "height"}}
                            background-size: auto {{=it.height(null, "absolute")}}px;
                        {{?}}
                        {{?it.stretch == "fill"}}
                            background-size: {{=it.width(null, "absolute")}}px {{=it.height(null, "absolute")}}px;
                        {{?}}

                        width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}
	</div>

';