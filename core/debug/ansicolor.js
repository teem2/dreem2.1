// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)
// Ansi colorization function, us ~rb~ to set color in string

// r - red, g - green, b - blue
// y - yellow, m - magenta, c - cyan, w - white
// br - bold red, bg - bold green,  bb - bold blue
// by - bold yellow, bm - bold magenta, bc - bold cyan, bw - bold white

define(function(){
	return function(output) {
		var colors = {
			bl:"30",bo:"1",r:"0;31",g:"0;32",y:"0;33",b:"0;34",m:"0;35",c:"0;36",
			w:"0;37",br:"1;31",bg:"1;32",by:"1;33",bb:"1;34",bm:"1;35",bc:"1;36",bw:"1;37"
		}
		return function(){
			for (var v = Array.prototype.slice.call(arguments), i = 0; i < v.length; i++) {
				v[i] = String(v[i]).replace(/~(\w*)~/g, function(m, a) {
					return "\033[" + (colors[a] || 0) + "m";
				}) + "\033[0m";
				output(v[i])
			}
		}
	}
})