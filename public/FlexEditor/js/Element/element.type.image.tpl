/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeImage = '

	<div style="width: 100%; height: 100%">
	 	{{?it.hasProperty("image") && it.property("image") != "null"}}
			<div style="position: absolute;
                        background: url({{=it.property("image")}}) no-repeat {{=it.property("halign")}} {{=it.property("valign")}}; 

                        {{?it.property("stretch") == "width"}}
                            background-size: {{=it.widthUnit()}} auto;
                        {{?}}
                        {{?it.property("stretch") == "height"}}
                            background-size: auto {{=it.heightUnit()}};
                        {{?}}
                        {{?it.property("stretch") == "fill"}}
                            background-size: {{=it.widthUnit()}} {{=it.heightUnit()}};
                        {{?}}
                        width: {{=it.widthUnit()}};
	 	     			height: {{=it.heightUnit()}};
                        ">
            </div>
	 	{{?}}

        <div style="position: relative; width: 100%; height: 100%;">

            {{~it.property("children") :child:index}}
                {{=child.template(child)}}
            {{~}}

        </div>

	</div>

';