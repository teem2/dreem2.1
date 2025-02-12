"use strict";
define.class(function(require, screen, node, datatracker, spline, blokjesgrid, menubar,screenoverlay,scrollcontainer,menuitem, view, edit, text, icon, treeview, ruler, foldcontainer,button, splitcontainer, scrollbar, editlayout){	

	var Xml = require('$parsers/htmlparser')

	this.title = "Flowgraph Builder"
	
	//this.attribute("dataset", {type: Object});
	this.state("xmlstring");
	this.state("xmljson");
	this.state("dataset");
	this.state("appstate");
	this.xmlstring = "";
	
	this.BuildXML = function(originalset, dataset){
		if(!this.xmljson) return ''
		var fs = Xml.childByTagName(this.xmljson, 'composition/flowserver')
		if(!fs){
			fs = Xml.createChildNode('flowserver', Xml.childByTagName(this.xmljson, 'composition'))
		}
		fs.child = undefined
		var server_output = {}
		var server_input = {}
		for(var i = 0; i < dataset.connections.length; i++){
			var con = dataset.connections[i]
			var attr = Xml.createChildNode('attribute', fs)
			attr.attr = {
				name:'screens_' + con.to.node + '_' + con.to.input,
				from:'screens_' + con.from.node + '_' + con.from.output,
				type:'string',
				value: con.from.value
			}
			server_output[attr.attr.name] = 1
			server_input[attr.attr.from] = 1
		}

		Xml.childrenByTagName(this.xmljson, 'composition/screens/screen').forEach(function(screen){
			var view = Xml.childByTagName(screen, 'view')
			Xml.childrenByTagName(view, 'attribute').forEach(function(attrib){
				// check if we are in connections
				var to = "screens_"  + screen.attr.name + "_" + attrib.attr.name
				// lets find the right data
				for(var i = 0; i < dataset.screens.length; i++)if(dataset.screens[i].name === screen.attr.name){
					screen.attr.editx = ''+dataset.screens[i].x
					screen.attr.edity = ''+dataset.screens[i].y
					//data.screens.push({name:scr.attr.name,
				}

				if(attrib.attr.input == 'true'){
					if(server_output[to]){
						attrib.attr.value = "${dr.teem.flowserver." + to + "}"
					}
					else delete attrib.attr.value
				}
				if(attrib.attr.input == 'false'){
					var handler = Xml.childByAttribute(view, 'event', 'on'+attrib.attr.name, 'handler');
					if (server_input[to]){ // add-make one
						if(!handler){
							handler = Xml.createChildNode('handler', view);
							handler.attr = {event:'on'+attrib.attr.name};
							var txt = Xml.createChildNode('$text', handler);
							var handlerValue = '';
							for(var j = 0; j < dataset.connections.length; j++){
								var con = dataset.connections[j];
								if(con.from.node === screen.attr.name &&
									con.from.output === attrib.attr.name) {
									handlerValue = "dr.teem.flowserver.screens_" + con.to.node + '_' + con.to.input + ' = this.' + attrib.attr.name + ';'
								}
							}
							txt.value = handlerValue;
						}
					} else if (handler && handler.child && handler.child.length) {
						var child = handler.child[0];
						//check if it's the one we created, if so, remove it
						if (child && child.tag == '$text' && child.value && child.value.startsWith('dr.teem.flowserver')) {
							var index = view.child.indexOf(handler);
							if (index >= 0) {
								view.child.splice(index, 1)
							}
						}
					}
					else{ // try to remove one
					}
					// handler
				}

			})
		})
		var res = Xml.reserialize(this.xmljson);
		return res;
	}
	
	this.loadfile = function(filepath){
		this.teem.fileio.readfile(filepath).then(function(result){
			this.xmljson = Xml(result)			

			var screens = Xml.childByTagName(this.xmljson, 'composition/screens')
			this.dataset.fork(function(data){
				data.screens = []
				data.connections = []
				for(var i = 0; i < screens.child.length; i++){
					var scr = screens.child[i]
					if(scr.tag !=='screen') continue
					var view = Xml.childByTagName(scr, 'view')
					data.screens.push({
						name:scr.attr.name,
						type:scr.attr.type,
						icon: scr.attr.icon?scr.attr.icon:"tv", 
						title:scr.attr.title?scr.attr.title:scr.attr.name,					
						iframeurl: 'http://127.0.0.1:8080/' + this.composition + '?noreload&screen='+scr.attr.name,
						x:parseFloat(scr.attr.editx || 0), y:parseFloat(scr.attr.edity || 0),
						basecolor: (scr.attr.basecolor)?scr.attr.basecolor: vec4('#d0d0a0'), 
						linkables: Xml.childrenByTagName(view, 'attribute').map(function(each){
							return {
								name: each.attr.name,
								icon: each.attr.icon?each.attr.icon:"chevron-right",
								title: each.attr.title?each.attr.title:each.attr.name,
								type: each.attr.type,
								input: each.attr.input === 'true',
								value: each.attr.value
							}
						}.bind(this))
					})
				}

				var flowserver = Xml.childByTagName(this.xmljson,'composition/flowserver')
				Xml.childrenByTagName(flowserver,'attribute').map(function(each){
					var name = each.attr.name
					var tonode = name.slice(name.indexOf('_')+1)
					var toinput = tonode.slice(tonode.indexOf('_')+1)
					tonode = tonode.slice(0,tonode.indexOf('_'))
					var from = each.attr.from
					if (!from) return;
					
					var fromnode = from.slice(from.indexOf('_')+1)
					var fromoutput = fromnode.slice(fromnode.indexOf('_')+1)
					fromnode = fromnode.slice(0,fromnode.indexOf('_'))
					var v = each.attr.value;

					data.connections.push({from:{node:fromnode, output:fromoutput, value:v},to:{node:tonode, input:toinput, value:v}})
				})


				this.xmlstring = this.BuildXML(this.xmljson, data);
			}.bind(this))

	//		this.dataset.fork(function(data){
//				data.connections.push({from:{node:"default", output:'sldvalue'}, to: {node:"mobile", input:'sldinput'}})
		//	})
		}.bind(this))
	}

	this.init = function(){
		this.composition = location.hash.slice(1) || 'compositions/demo/tvdemo.dre'
		this.dataset = datatracker({
			screens:[
			],
			connections:[
			],
		})
		
		this.dataset.atChange  = function(){
			//console.log("data set changed!");
			var newxml = this.BuildXML(this.xmljson, this.dataset.data);
			
			if (newxml != this.xmlstring){
				console.log("need to save new version...");
				this.teem.fileio.writefile('../dreem2/' + this.composition, newxml).then(function(result){				
					console.log("saved composition to server!");
					this.xmlstring = newxml;
				}.bind(this));		
			}else{
			//	console.log("no notable changes.. not saving file to server");
			}
		}.bind(this);
	
		this.appstate = datatracker({
			selected: "composition/screens/default"
		})
		
		var filepath = '../dreem2/' + this.composition
		// lets hook the file change watcher
		this.loadfile(filepath)

		this.teem.fileio.filechange(filepath).then(function filechange(file){
			//console.log("I HAZ FILECHANGE")
			if(file.indexOf("with='editable'") === -1) {
				console.log("RELOADING FILE BECAUSE OF FILE SWITCHING BACK FROM EDIT MODE")
				this.loadfile(filepath)
			} // skip it
			//else console.log("FILECHANGE IS FUCKED")
			this.teem.fileio.filechange(filepath).then(filechange.bind(this))
		}.bind(this))
			

	}
	
	/*var dataset = datatracker({
		screens:[
			{name: "Browser", basecolor: vec4("#ffff60"), linkables:[
				{name:"dataset", type: "list", input: true},
				{name:"spacing", type: "float", input: true},
				{name:"scale", type: "float", input: true},
				{name:"color", type: "vec4", input: true}
			]},
			{name: "Remote", basecolor: vec4("#9090ff"), linkables:[
				{name:"xslider", type: "float", input: false},
				{name:"yslider", type: "float", input: false},
				{name:"title", type: "string", input: true},
				{name:"color", type: "vec4", input: true}
			]},
			{name: "TV", basecolor: vec4("#ff6060"),linkables:[]},
			{name: "Phone", basecolor: vec4("#90df90"),linkables:[]}		
		],
		connections:[
			{to: {node:"Browser", attribute: "spacing"}, from:{node:"Remote", attribute: "xslider"}},
			{to: {node:"TV", attribute: "scale"}, from:{node:"Remote", attribute: "yslider"}}		,
			{to: {node:"Phone", attribute: "scale"}, from:{node:"TV", attribute: "yslider"}}		
		]
	})*/
					
	var flowgraphtreeview = treeview.extend(function flowgraphtreeview(){
		
		this.attribute("appstate", {type:Object});
		
		this.appstate = function(){
			this.selected = this.appstate.data.selectedscreen;
		}
	
		this.buildtree = function(data)
		{
			return { 
				name:"Composition", id: "comp", children:[
					{name:"Screens" , id:"screens", children: data.screens.map(function(d) {
							return {name: d.name, id: d.name, children: []
							}
						})
					},
					{name:"Connections", id:"conns", children:data.connections.map(function(d){return {name:d.from.node + " -> " + d.to.node  }}) }
				] 
			};
			
		}
	})	
	
	var drawerbutton = define.class(function drawerbutton(button){

		this.margin= 6;
		this.padding= 6;
		this.cornerradius = 0
		this.bgcolor= vec4("#ffffff");
		this.borderwidth = 0
		this.bordercolor = vec4(0.5,0.5,0.5,0.1);
		this.fontsize = 16;
		this.alignself = "stretch"

		this.bg.col1 = this.bg.col2 = this.bgcolor

		this.attribute("hovercolor1", {type: vec4, value: vec4("#ffffff")});
		this.attribute("hovercolor2", {type: vec4, value: vec4("#ffffff")});

		this.atDraw = function(){
			this.bg.col2 = this.bgcolor;
			this.bg.col1 = this.bgcolor;
			this.labelcolor = vec4("black");
			this.buttonres.fgcolor = this._labelcolor;
		}

		//this.buttoncolor1 = vec4(1,1,1,0.8);
		//this.buttoncolor2 = vec4(1,1,1,0.8);
		this.labelcolor = vec4("black");
//		this.alignitems = "flex-end"
		//this.justifycontent = "flex-end"

		this.render = function(){
			if(this.backcolor)
				this.bgcolor = vec4(this.backcolor)

			this.buttonres =  text({rotation: 0, bgcolor:"transparent",fgcolor:"white", marginleft: 4,fontsize: this.fontsize, position: "relative", text: this.text})
			if (!this.icon || this.icon.length == 0)
			{
				this.iconres = undefined;
				return [this.buttonres];
			}
			else{
				this.iconres =icon({fontsize: this.fontsize, icon: this.icon});
				return [this.iconres,this.buttonres];
			}
		}
	});

	var drawerfoldcontainer = define.class(function drawerfoldcontainer(foldcontainer){
		this.margin= 0;

		this.clickablebar = view.extend(function(){

			this.bggradient = function(a,b){
				var fill = mix(col1, col2,  (a.y)/0.8);
				return fill;
			}
			this.toggle = function(){console.log("nothing happens")}
			this.attribute("title", {type:String});
			this.position = "relative" ;

			this.bg.col2 = vec4("yellow");
			this.bg.col1 = vec4("yellow");
			this.bg.bgcolorfn = this.bggradient;
			this.padding = 6;


			this.render = function(){

				return [icon({fontsize:16, icon:this.icon, fgcolor: "#303030" }),
					text({marginleft:5,fgcolor:"#303030", fontsize: 16, text:this.title, flex:1, bgcolor: "transparent" }),
					icon({icon: (this.parent.collapsed) ? 'plus' : 'minus', margintop:4,flex:0.06})
				];
			}

			this.atDraw = function()
			{
				this.bg.col1 = vec4(this.parent.basecolor)
				this.bg.col2 = vec4(this.parent.basecolor)
			}
		});


		this.render = function(){

			this.bar = this.clickablebar({icon:this.icon, title: this.title});

			this.bar.click = this.toggle.bind(this);

			var res = [this.bar]

//			this.expander.text = (this.collapsed == false) ? '+' : '-'

			if (this.collapsed == false) {
				this.container = view({
					"bg.bgcolorfn":function(a,b){
						return mix(bgcolor,bgcolor, (a.y/8));
					} ,
					bgcolor: this.bgcolor,
					padding: 4,
					position:"relative"}
					,this.instance_children)
				res.push(this.container)
			}
			this.children = [];

			return res;
		}
	})

	
	this.render = function(){
		var displays = {}
		return[
			view({rotation:0,name:"toplevel",flexdirection: "column", bgcolor: "darkgray" , flex:1}
				,view({name:"menubarholder", bgcolor:"lightgray",flexdirection:'column'}
					,menubar({flex:1,bgcolor:'#f1f1f1'}
						,menuitem({text: "File",bgcolor:'#f1f1f1'}
							,menuitem({text: "Load"})
							,menuitem({text: "Save"})
							,menuitem({text: "Save as"})
							,menuitem({text: "Revert"})
						)
						,menuitem({text: "Edit",bgcolor:'#f1f1f1'}
							,menuitem({text: "Copy", enabled: false})							
							,menuitem({text: "Paste", enabled: false})
							,menuitem({text: "Undo", click:function(){this.dataset.undo()}.bind(this)})
							,menuitem({text: "Redo", click:function(){this.dataset.redo()}.bind(this)})
							,menuitem({text: "Options", enabled: false})															
						)
						,menuitem({text: "Help",bgcolor:'#f1f1f1'}
							,menuitem({text: "Manual", enabled: false})
							,menuitem({text: "About", click: function(){
								this.screen.openModal(screenoverlay({click:function(){this.screen.closeModal()}}
									,view({flexdirection: "column", flex: 1, bgcolor: "transparent"},view({flexdirection: "row", flex: 1, bgcolor: "transparent", alignself:"center"},												
										view({flexdirection: "column", bordercolor: "black" ,bgcolor: vec4(0,0,0,0.3), alignself:  "center" },
											text({text: "About Teem Flowgraph Editor", fontsize: 30, margin: 10, fgcolor: "white", bgcolor: "transparent", alignself:"center"}) ,
											view({bgcolor:"#202020", padding: 20}, text({fontsize: 20, text:"this is a multiline thing\nthat explains what the hell this is all about", bgcolor:"transparent" }))
										)
									))
								));
							}})
						)
						
						,menuitem({text: "new block",bgcolor:'#f1f1f1', click:function(){
							/*
							this.dataset.fork(function(data){
								data.screens.push({name:"new screen", basecolor:vec4("green")})
							})
							*/
						}.bind(this)})
						,menuitem({text: "Undo",bgcolor:'#f1f1f1', click:function(){this.dataset.undo()}.bind(this)})
						,menuitem({text: "Redo",bgcolor:'#f1f1f1', click:function(){this.dataset.redo()}.bind(this)})

					)
					,view({flex:1,height:1,bgcolor:'#d6d6d6'})
				)
				,splitcontainer({name:"mainsplitter", vertical: true}
					,splitcontainer({flex: 0.8, vertical: false}
						,splitcontainer({vertical:false, splitsize :{type :float, value : 0}}
						,view({flexdirection: "column" , flex:1},
							blokjesgrid({dataset: this.dataset, dblclick:function(blokje){
								var display = displays[blokje.data.name]
								display.show()
							}})
						)
						,view({flex:0.22, flexdirection: "column", flexwrap: "none"}
							,drawerfoldcontainer({icon:"sitemap",title:"Layouts", basecolor: "#b0b0b0",bgcolor:'#e6e6e6', alignitems: "stretch" }
								,view({flexdirection:"column", flex: 1, alignself: "stretch", bgcolor:"#e6e6e6"}
									,drawerbutton({text:"Grid",icon:"table",backcolor: "#ffffff" })
									,drawerbutton({text:"List",icon:"reorder",backcolor: "#ffffff" })
									,drawerbutton({text:"Graph", icon:"sitemap" ,backcolor: "#ffffff" })
								)
							)
							,drawerfoldcontainer({icon:"server",title:"Services" , basecolor:"#77b5ff",bgcolor:'#cee9ff' , alignitems: "stretch" }
								,view({flexdirection:"column", flex: 1, alignself: "stretch", bgcolor:"#cee9ff"}
							
								,drawerbutton({text:"Rovi", icon:"film"})
								,drawerbutton({text:"Vimeo", icon:"vimeo"})
								,drawerbutton({text:"Soundcloud", icon:"soundcloud"})
								,drawerbutton({text:"Email", icon:"envelope"})
								,drawerbutton({text:"Facebook",icon:"facebook" })
								,drawerbutton({text:"Twitter",icon:"twitter"})
								,drawerbutton({text:"Tumblr", icon:"tumblr"})
								,drawerbutton({text:"Pinterest", icon:"pinterest"})
								,drawerbutton({text:"Weather", icon:"cloud"})
								,drawerbutton({text:"Maps",icon:"map"})
								)

							)
							,drawerfoldcontainer({icon:"toggle-on",title:"Controllers", basecolor: "#6ec1ae",bgcolor:'#b8dbd3' , alignitems: "stretch" }
								,view({flexdirection:"column", flex: 1, alignself: "stretch", bgcolor:"#b8dbd3"}
								,drawerbutton({text:"D-pad", icon:"gamepad" })
								,drawerbutton({text:"Gyro",icon:"dot-circle"})
								,drawerbutton({text:"Trackpad", icon:"square"})
								,drawerbutton({text:"Keyboard", icon:"keyboard" })
								,drawerbutton({text:"Mouse",icon:"mouse-pointer"})
								)
							)
							
							,drawerfoldcontainer({icon:"tv",title:"Devices", basecolor: "#fdda9d",bgcolor:'#fceacb', alignitems: "stretch" }
								,view({flexdirection:"column", flex: 1, alignself: "stretch", bgcolor:"#fceacb"}

								,drawerbutton({text:"Phone", icon:"phone" })
								,drawerbutton({text:"Server",icon:"server"})
								,drawerbutton({text:"Tab", icon:"tablet"})
								,drawerbutton({text:"TV", icon:"tv"})
								,drawerbutton({text:"PC", icon:"desktop" })
								,drawerbutton({text:"Watch", icon:"clock"})
								,drawerbutton({text:"Fit", icon:"heart"})
								)
							)
							
						)


						)

						)


				)
			)
			//,displays.default = 
//			,displays.mobile= view({name:'frame1', position:'absolute',width:1920, height:1080,flex:1,mode:'DOM', src:'http://127.0.0.1:8080/' + this.composition + '?noreload&edit=1'})

	]}
});



