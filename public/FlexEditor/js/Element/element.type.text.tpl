/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeText = '

    <div style="display: table-cell;
                vertical-align: {{=it.valign}};
                text-align: {{=it.halign}};
                width: {{=it.width(null, "absolute")}}px;
                height: {{=it.height(null, "absolute")}}px;
                font-family: helvetica;
                font-size: 14px;
                color: {{=it.foreground}};
                padding: {{=it.padding}}px;">

	  {{=it.text}}
    
    </div>

';