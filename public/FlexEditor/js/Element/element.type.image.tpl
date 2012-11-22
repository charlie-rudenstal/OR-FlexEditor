/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeImage = '

	<div>
	 	{{?it.hasProperty("image") && it.property("image") != "null"}}
			<div style="position: absolute;
                        background: url({{=it.property("image")}}) no-repeat {{=it.property("halign")}} {{=it.property("valign")}}; 

                        {{?it.property("stretch") == "width"}}
            			    background-size: {{=it.width(null, "absolute")}}px auto;
						{{?}}
                        {{?it.property("stretch") == "height"}}
                            background-size: auto {{=it.height(null, "absolute")}}px;
                        {{?}}
                        {{?it.property("stretch") == "fill"}}
                            background-size: {{=it.width(null, "absolute")}}px {{=it.height(null, "absolute")}}px;
                        {{?}}

                        width: {{=it.width(null, "absolute")}}px;
	 	     			height: {{=it.height(null, "absolute")}}px;"></div>
	 	{{?}}
	</div>

';