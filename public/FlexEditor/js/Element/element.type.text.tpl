/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeText = '

    <div style="display: table-cell;
                vertical-align: {{=it.property("valign")}};
                text-align: {{=it.property("halign")}};
                width: {{=it.width(null, "absolute")}}px;
                height: {{=it.height(null, "absolute")}}px;
                font-family: helvetica;
                font-size: 14px;
                color: {{=it.property("foreground")}};
                padding: {{=it.property("padding")}}px;">

	  {{=it.property("text")}}
    
    </div>

';