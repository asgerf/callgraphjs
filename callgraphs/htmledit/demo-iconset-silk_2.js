var hb_silk_icon_set_blue = $("#htmlbox_silk_icon_set_blue").css("height","100").css("width","600").htmlbox({
    toolbars:[
	     ["cut","copy","paste","separator_dots","bold","italic","underline","strike","sub","sup","separator_dots","undo","redo","separator_dots",
		 "left","center","right","justify","separator_dots","ol","ul","indent","outdent","separator_dots","link","unlink","image"],
		 ["code","removeformat","striptags","separator_dots","quote","paragraph","hr","separator_dots",
			 {icon:"new.png",tooltip:"New",command:function(){hb_silk_icon_set_blue.set_text("<p></p>");}},
			 {icon:"open.png",tooltip:"Open",command:function(){alert('Open')}},
			 {icon:"save.png",tooltip:"Save",command:function(){alert('Save')}}
		  ]
	],
	icons:"silk",
	skin:"blue"
});
