// Copyright 2015 Teem2 LLC, MIT License (see LICENSE)
// Rpc Promise handler object

define.class(function(require, exports){

	this.atConstructor = function(host){
		this.host = host
		this.promises = {}
		this.uid_free = []
		this.uid = 0
	}

	this.callRpc = function(name, msg){
		msg.rpcid = name
		return this.host.callRpc(msg)
	}

	this.resolveReturn = function(msg){
		var promise = this.promises[msg.uid]
		if(!promise) return console.log('Error resolving RPC promise id ' + msg.uid)
		this.uid_free.push(msg.uid)
		this.promises[msg.uid] = undefined
		if(msg.error){
			promise.reject(msg)
		}
		else{
			promise.resolve(msg)
		}
	}

	this.allocPromise = function(){
		var uid 

		if(this.uid_free.length) uid = this.uid_free.pop()
		else uid = this.uid++

		if(this.uid > 100){
			// TODO make a promise timeout cleanup
			console.log('Warning, we have an RPC promise leak')
			for(var i = 0;i<100;i++){
				console.log(this.promises[i].msg)
			}
		}

		var resolve, reject
		var prom = new Promise(function(_resolve, _reject){resolve = _resolve, reject = _reject})
		prom.resolve = resolve
		prom.reject = reject
		prom.uid = uid
		this.promises[uid] = prom

		return prom
	}

})