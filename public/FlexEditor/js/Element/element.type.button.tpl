/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeButton = '

<!--     <div style="display: table-cell;
                vertical-align: {{=it.property("valign")}};
                text-align: {{=it.property("halign")}};
                width: {{=it.widthUnit()}};
                height: {{=it.heightUnit()}};
                font-family: helvetica;
                font-size: 14px;
                color: {{=it.property("foreground")}};
                padding: {{=it.property("padding")}}px;">

        {{=it.property("text")}}
    
    </div> -->

    <div style="position: absolute;
                bottom: 6px;
                width: 100%;
                text-align: center;
                font-family: helvetica;
                font-size: 14px;
                color: {{=it.property("foreground")}};
                padding: {{=it.property("padding")}}px;">

	    <span>{{=it.property("text")}}</span>
    
    </div>

';