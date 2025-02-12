"use strict";
// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)
// view class
define.class(function(module, sprite, text, view, button, icon){
	var testdata = {name:'test Node', children:[
		{name:'Child 1000', children:[
			{name:'node 0-0-0 '}
		]},
		{name:'Child 2', children:[
			{name:'node 0-1-0'}
		]},
		{name:'node 0-2' },
		{name:'node 0-3', children:[
			{name:'node 0-3-0'},
			{name:'node 0-3-1',	children:[
				{name:'node 0-3-1-0', children:[
					{name:'node 0-3-1-0-0', children:[
						{name:'node1a'}
					]}
				]},
				{name:'node with an earlier parent'}
			]}
		]}
	]}
	
	this.attribute("dataset", {type: Object, value:{}});
	this.attribute("selected", {type: String, value:""});

	var flatbutton = button.extend(function flatbutton(){
		this.borderwidth = 0;
		this.padding =  4;
		this.labelactivecolor = vec4("#303000");
		this.bordercolor= "transparent" ;
		this.buttoncolor1 = vec4(1,1,1,0.0)
		this.buttoncolor2 = vec4(1,1,1,0.0)
		this.pressedcolor1 = vec4(0,0,0,0.14)
		this.pressedcolor2 = vec4(0,0,0,0.05);
		this.hovercolor1 = vec4(0,0,0,0.1);
		this.hovercolor2 = vec4(0,0,0,0.1);
		this.cornerradius = 0;
		this.fgcolor = "black";
		this.margin = 0;
		this.bgcolor = "transparent";
		this.flex = undefined;
		this.alignself = "flex-start" 	
	})
	
	var newitemheading = view.extend(function newitemheading(){
		this.borderwidth = 0;
		this.attribute("folded", {type: boolean, value: false});
		this.padding =  4;
		this.labelactivecolor = vec4("#303000");
		this.bordercolor= "transparent" ;
		this.buttoncolor1 = vec4(1,1,1,0.0)
		this.buttoncolor2 = vec4(1,1,1,0.0)
		this.pressedcolor1 = vec4(0,0,0,0.14)
		this.pressedcolor2 = vec4(0,0,0,0.05);
		this.hovercolor1 = vec4(0,0,0,0.1);
		this.hovercolor2 = vec4(0,0,0,0.1);
		this.cornerradius = 0;
		this.fgcolor = "black";
		this.margin = 0;
		this.bgcolor = "transparent";
		this.flex = undefined;
		this.alignself = "flex-start" 	
		
		this.render = function(){
			return [
				this.haschildren?flatbutton({icon:this.folded?"arrow-right":"arrow-down",padding: 2,width:14,height:16, click: this.toggleclick}):[], 
				//flatbutton({icon:this.folded?"arrow-right":"arrow-down",padding: 2, click: this.toggleclick}),
				flatbutton({text: this.text})
			];
		}
	});		
		
	var itemheading = view.extend(function itemheading(){
		this.attribute("text", {type:String, value:""});
		this.attribute("id", {type:String, value:""});
		this.pressed = 0;
		this.hovered = 0;
		this.attribute("color1", {type:vec4, value:vec4("white")});
		this.attribute("color2", {type:vec4, value:vec4("#e0e0f0")});
		this.attribute("hovercolor1", {type:vec4, value:vec4("white")});
		this.attribute("hovercolor2", {type:vec4, value:vec4("#f0f0ff")});
		this.attribute("activecolor1", {type:vec4, value:vec4("#e0e0f0")});
		this.attribute("activecolor2", {type:vec4, value:vec4("white")});
		this.bg.col1 = vec4("white");
		this.bg.col2 = vec4("#e0e0f0");
		this.mouseover  = function(){
			this.hovered++;
			this.setDirty(true);
		}			
		
		this.mouseout  = function(){
			this.hovered--;
			this.setDirty(true);
		}			
		
		this.mouseleftdown = function(){
			this.pressed++;
			this.setDirty(true);
		}
		
		this.mouseleftup = function(){
			this.pressed--;
			this.setDirty(true);
		}
		
		this.atDraw = function(){
			
			if (this.hovered> 0){
				if (this.pressed > 0){
					this.bg.col1 = this.activecolor1;
					this.bg.col2 = this.activecolor2;
				}else{
					
					this.bg.col1 = this.hovercolor1;
					this.bg.col2 = this.hovercolor2;
				}
						
			}
			else {
				this.bg.col1 = this.color1;
				this.bg.col2 = this.color2;
			}
		}
		this.bg.bgcolorfn = function(a,b){return mix(col1, col2, a.y);};
		
		
		this.render = function(){
			return [text({text: this.text, bgcolor: "transparent", fontsize: 16, fgcolor: "#404040", margin: 2})];
		}
	})

	var treeitem = view.extend(function (){
		this.flex = 1.0;	
		
		this.attribute("text", {type:String, value:""});
		
		//this.attribute("collapsed", {type:Boolean, value:false});
		this.attribute("bgcolor", {type:vec4, value:vec4("transparent")});
		this.attribute("fgcolor", {type:vec4, value:vec4("black")});
		this.attribute("fontsize", {type:float, value:12});
		
		this.attribute("item", {type:Object});

		this.flexdirection = "row" ;
		
		this.toggle = function(){
			if (this.item){
				if (!this.item.collapsed) this.item.collapsed = true;else this.item.collapsed = false;
				//this.collapsed = this.item.collapsed;
				this.reRender()
			}
			//this.reLayout();
			this.setDirty(true);
		};
		
		this.selectclick = function(){
			console.log("hmm");
		}
		
		this.bgcolor = vec4("transparent");
		this.atConstructor = function(){
			if (this.item){
				if (!this.item.collapsed) this.item.collapsed = false;
			}
			
		//	this.text = this.item.name;
		}
		this.count =0;
		this.render = function(){	
			
			if (!this.item) return [text({text:"empty"})];
			
			//this.collapsed;
			//console.log("treeitem", this.item.name, this.item.children);
			return [view({flexdirection:"row", flex:1},[
				view({bgcolor:"transparent", flexwrap:"none",flexdirection:"column" },
					newitemheading({haschildren:this.item.children&&this.item.children.length, folded: this.item.collapsed, toggleclick: this.toggle.bind(this), selectclick: this.selectclick.bind(this),text:this.item.name, id:this.item.id }),
					this.item.collapsed==false?
						view({bgcolor:"transparent",flexdirection:"row" },
							view({bgcolor:"transparent",  flexdirection:"column" , flex:1},
								this.item.children?
								this.item.children.map(function(m, i, array){return [
									view({bgcolor:"transparent",flexdirection:"row" },
										treeline({width:20,'bg.last':i === array.length - 1?1:0, marginleft: 0,marginright: 0, bgcolor: "#c0c0c0" }), 
										treeitem({item: m})
									)
									]})
								:[]
							)
						)
					:[]
				)
			])]
		}
	})
	
	var treeline = view.extend(function(){
		this.bg.fgcolor = vec4(0.5,0.5,0.5,1.)
		this.bg.last = 0
		this.bg.color = function(){
			//var rel = mesh.xy//cursor_pos
			//var dpdx = dFdx(rel)
			//var dpdy = dFdy(rel)
			//var edge = min(length(vec2(length(dpdx), length(dpdy))) * SQRT_1_2, 1.)
			var pos = mesh.xy * vec2(width, height)
			var center = 15
			var left = 7
			var field = shape.union(
						shape.box(pos, left,0,1,height * (1-last) + center * last),
						shape.box(pos, left,center,width,1)  )
			var edge = 1.

			if (mod( floor (gl_FragCoord.x) + floor(gl_FragCoord.y) , 2.) > 0.)
			{
			return vec4(fgcolor.rgb, smoothstep(edge, -edge, field))
			}
			return vec4(fgcolor.rgb,0);
		}

		this.atDraw = function(){

		}
	})
	
	this.bordercolor = vec4("gray");
	this.cornerradius = 0;
	this.clipping = true;
	this.bgcolor = vec4("white");
	
	this.bggradient = function(a,b){
		return mix(bgcolor, bgcolor *0.8, a.y *a.y);
	}
	
	this.bg.bgcolorfn= this.bggradient;
	this.flexdirection="row";
	this.flex= 1;

	this.alignself="stretch" ;

	this.render = function(){
		var data;
				
		if (this.buildtree) data = this.buildtree(this.dataset.data)
		else{
			data = this.dataset.data
		}
		return [treeitem({item:data})]
	}
})