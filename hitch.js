/*
	jQuery.hitch() -  Advanced scope manipulation for jQuery 
	version: 0.1, Peter Higgins (dante at dojotoolkit.org)

	(c) 2004-2010 The Dojo Foundation - adapted from `dojo.hitch`
	Either AFL/New BSD license, see: http://dojotoolkit.org/license 

	usage 1:
	
		var obj = {
			attr: "blah",
			func: function(){
				console.log(this.attr);
			}
		}
		
		// most useful example out of context, with setTimeout/Interval:
		setInterval($.hitch(obj, "func"), 2100) // call obj.func() in scope of obj
		setTimeout($.hitch(obj, function(){
			this.attr = "blargh";
			this.func();
		}), 2100);
	
	usage 2:
		
		// pseudo-class
		var Thinger = function(){
			this.foo = "bar";
			this.bar = function(event){
				// super generic function to reuse lots
				this.foo = $(event.target).attr("id");
			}
		}
		
		var mine = new Thinger();
		var yours = new Thinger();
		
		$(".foo").click($.hitch(mine, "bar"));
		$(mine).bind("bar", $.hitch(yours, "bar"));
		
*/
;(function($){

	$.hitch = function(scope, method){
		// summary: Create a function that will only ever execute in a given scope
		if(!method){ method = scope; scope = null; }
		if(typeof method == "string"){
			scope = scope || window;
			if(!scope[method]){ throw(['method not found']); }
			return function(){ return scope[method].apply(scope, arguments || []); };
		}
		return !scope ? method : function(){ return method.apply(scope, arguments || []); };
	}

})(jQuery);

