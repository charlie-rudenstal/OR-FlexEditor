/* Will be compressed into one line by Makefile */
var Templates = Templates || {}; Templates.Raw = Templates.Raw || {}; 
Templates.Raw.ElementTypeText = '

	<div class="content" style="color: {{=it.foreground}};
                                {{?it.padding}}padding: {{=it.padding}}px;{{?}}">
		{{=it.text}}
	</div>

';