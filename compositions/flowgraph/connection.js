"use strict";
define.class(function(require,spline){

	this.state("from")
	this.state("to");
	
	this.state("fromattr");
	this.state("toattr");
	
	this.position = "absolute" 
	this.linewidth = 10;
	
	this.init = function(){
		this.setDirty();
	}
	
	this.linecolor = vec4("black");

	this.preDraw = function(){
		this.update();
	}
	
	this.atDraw = function(){	
		if (this.hovered > 0){				
			this.linecolor1 = vec4.vec4_mul_float32(vec4(this.from.data.basecolor),1.5);
			this.linecolor2 = vec4.vec4_mul_float32(vec4(this.to.data.basecolor),1.5);
		}else{
			this.linecolor1 = this.from.data.basecolor;
			this.linecolor2 = this.to.data.basecolor;				
		}

		spline.prototype.atDraw.call(this)
	}

	this.update = function(from, to){
		//console.log(this.from.name, this.to.name);
		if (from === undefined) from = this.from;
		if (to === undefined) to = this.to;
		
		var parentrect = this.parent.getBoundingRect();
		var fromrect = from.getBoundingRect();
		var fromattrrect =  from.outputsdict[this.fromattr].getBoundingRect();
	
		var torect = to.getBoundingRect();
		var toattrrect =  to.inputsdict[this.toattr].getBoundingRect();

//	console.log(fromrect, fromattrrect);
		
		var fromoff = fromattrrect.top - fromrect.top ;
		var tooff = toattrrect.top - torect.top;
		
		
		var br1 = fromrect;
		var w =   br1.right - br1.left;
		var fx = from._pos[0];
		var fy = fromrect.top  + fromoff+ - parentrect.top  + 8;
		var tx = to._pos[0];
		var ty = torect.top+ tooff- parentrect.top  + 8;
		
	//	console.log(fx, tx, br1);
		
		
		this.p0 = vec2(fx + w, fy);
		this.p1 = vec2(fx+ w +100, fy );
		this.p2 = vec2(tx-100,  ty);
		this.p3 = vec2(tx, ty);
	
		var minx = this.p0[0];var maxx = minx;
		if (this.p1[0] < minx) minx = this.p1[0];else if (this.p1[0]>maxx) maxx = this.p1[0];
		if (this.p2[0] < minx) minx = this.p2[0];else if (this.p2[0]>maxx) maxx = this.p2[0];
		if (this.p3[0] < minx) minx = this.p3[0];else if (this.p3[0]>maxx) maxx = this.p3[0];
		
		var miny = this.p0[1];var maxy = miny;
		if (this.p1[1] < miny) miny = this.p1[1];else if (this.p1[1]>maxy) maxy = this.p1[1];
		if (this.p2[1] < miny) miny = this.p2[1];else if (this.p2[1]>maxy) maxy = this.p2[1];
		if (this.p3[1] < miny) miny = this.p3[1];else if (this.p3[1]>maxy) maxy = this.p3[1];
		
	//	console.log(minx, miny, maxx, maxy);
		
		this.pos = vec2(minx-11, miny-11);
		this.size = vec3(maxx-minx + 22, maxy-miny +22);
		this.off = vec4(minx-11,miny-11,0,0);
		//this.getBoundingRect(true);
		//this.setDirty();
	}
	this.hovered =0;
	this.mouseover = function()
	{
		this.hovered++;
		this.setDirty();
	}
	
	this.mouseout = function(){
		if (this.hovered > 0) this.hovered--;
		this.setDirty();
	}
	
	this.click = function(){
		console.log("spline click")
		
		this.dataset.fork(function(data){
			
			console.log(this.to.data.name , this.from.data.name)
			for(var a in data.connections){
				var con = data.connections[a];
				if (con.from.node == this.from.data.name &&
					con.to.node == this.to.data.name &&
					con.to.input == this.toattr &&
					con.from.output == this.fromattr)
					{
						data.connections.splice(a, 1);
						return;
					}
			}
				
		}.bind(this))
	}
})