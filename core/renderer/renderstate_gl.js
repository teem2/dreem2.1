// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)

define.class(function(require, exports, self){
	
	this.pushClipRect = function(rect){
		var previousdepth = this.clipStack.length;
		this.clipStack.push(rect);		
		var gl = this.device.gl;
		
		//console.log("clipdepth: ", previousdepth, "frame: ", this.frame);
		
		
		gl.enable(gl.STENCIL_TEST);				
		gl.colorMask(true, true,true,true);
		gl.stencilFunc(gl.EQUAL, previousdepth, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
	}
	
	this.pushClip = function( sprite){
		
		this.pushClipRect(sprite.boundingrect);
	}
	
	this.translate = function(x,y){
		var m2 = mat4.T(x,y,0);
	//	this.matrix = mat4.mul(this.matrix, m2);
		this.viewmatrix = mat4.mul( m2, this.viewmatrix);
	}
	
	this.stopClipSetup = function(){
		var gl = this.device.gl;
		var depth = this.clipStack.length
		
		//gl.colorMask(true,true,true,true);
	
		gl.stencilFunc(gl.EQUAL, depth, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);	
	}
	
	this.popClip = function(sprite) {
		
		this.clipStack.pop();
		var previousdepth = this.clipStack.length;
		var gl = this.device.gl;
		
		//gl.enable(gl.STENCIL_TEST);		// should still be enabled!
		gl.colorMask(gl.FALSE, gl.FALSE, gl.FALSE, gl.FALSE);
		gl.stencilFunc(gl.EQUAL, previousdepth +1, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

		// this erases the current sprite from the stencilmap
		if (sprite) sprite.drawStencil(this);
		
		gl.colorMask(true,true,true,true);
		gl.stencilFunc(gl.EQUAL, previousdepth , 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);			
	}
	
this.frame =0;

	this.setup = function(device, viewportwidth, viewportheight, offx, offy){
		if (offx === undefined) offx = 0;
		if (offy === undefined) offy = 0;
		this.device = device;
		this.clipStack = [];
		this.frame++;
		
		if (viewportwidth === undefined) viewportwidth = device.size[0];
		if (viewportheight === undefined) viewportheight = device.size[1];
		
		this.uimode = true;
		this.matrix = mat4.identity();
		this.viewmatrix = mat4.ortho(0 + offx, device.size[0] + offx, 0 + offy, device.size[1] + offy, -100, 100);
		//this.device.gl.scissor(0,0, viewportwidth * device.ratio, viewportheight * device.ratio);
		this.device.gl.viewport(0, 0, device.size[0] * device.ratio, device.size[1] * device.ratio)
		this.device.gl.clearStencil(0);
		this.cliprect = rect(0,0, device.size[0], device.size[1]);
	}
})
