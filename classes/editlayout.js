// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)

define.class(function(require, cadgrid){
	this.init = function(){
		// we need to map 'screen' to something else
		define.atLookupClass = function(cls){
			if(cls === 'screen'){ // remap our screen class
				return '$renderer/screen_edit'	
			}
			return define.lookupClass(cls)
		}

		require.async('/compositions/' + this.composition + '/index.js').then(function(TeemClient){
			define.atLookupClass = define.lookupClass
			// alright lets load this thing up
			this.sub_teem = new TeemClient(undefined, this)
			this.sub_teem.screen.flex = 1;
			this.sub_teem.screen.alignself = "stretch";
			
			this.children = [this.sub_teem.screen]

			this.setDirty(true)
			this.reLayout()
		}.bind(this))
	}

	this.atDraw = function(){
		// alright now we need to draw the things in our sub_teem
		// screen.
		if(!this.sub_teem) return
	}
})