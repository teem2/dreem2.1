// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)
// Mouse class

define.class('$base/node', function (require, exports, self){
	this.event('start')
	this.event('end')
	this.event('cancel')
	this.event('leave')
	this.event('move')
	this.attribute('x',{type:int})
	this.attribute('y',{type:int})
	this.attribute('x1',{type:int})
	this.attribute('y1',{type:int})
	this.attribute('x2',{type:int})
	this.attribute('y2',{type:int})
	this.attribute('x3',{type:int})
	this.attribute('y3',{type:int})
	this.attribute('x4',{type:int})
	this.attribute('y4',{type:int})
	this.attribute('fingers',{type:int})
	this.ratio = 0
	this.activedown = 0;
		
	this.clickspeed = 350

	this.setTouches = function(touches){
		var arr = []
		arr[0] = vec2(this.x = touches[0].pageX, this.y = touches[0].pageY)
		for(var i = 1; i < 5;i++){
			if(i >= touches.length) break;
			arr[i] = vec2(this['x'+i] = touches[1].pageX, this['y'+i] = touches[1].pageY)
		}
		return arr
	}

	this.atConstructor = function(){
		if(this.ratio == 0) this.ratio = window.devicePixelRatio

		document.ontouchmove = function(e){
			e.preventDefault()
		}.bind(this)

		window.addEventListener('touchstart', function(e){
			var arr = this.setTouches(e.touches)
			this.emit('start', arr)
		}.bind(this))

		window.addEventListener('touchend', function(e){
			this.emit('end')
		}.bind(this))

		window.addEventListener('touchcancel', function(e){
			this.emit('cancel')
		}.bind(this))

		window.addEventListener('touchleave', function(e){
			this.emit('leave')
		}.bind(this))

		window.addEventListener('touchmove', function(e){
			var arr = this.setTouches(e.touches)
			this.emit('move', arr)
		}.bind(this))
	}
})
