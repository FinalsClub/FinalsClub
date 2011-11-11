
/*
Copyright 2011 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/


ProtoDiv = {}

ProtoDiv.elem = function(v) {
	return (typeof v === "string") ? document.getElementById(v) : v
}

ProtoDiv.reduce = function(list, cb) {
	var i, l = list.length
	for(i = 0; i < l; i++) 
		cb(list[i])
}

ProtoDiv.map = function(node, list, cb) {
	if(node.hasChildNodes()) {
		var kids = node.childNodes
		for(var i = 0; i < kids.length; i++) {
			var kid = kids[i]
			if(cb(kid))
				list.push(kid)
			ProtoDiv.map(kid, list, cb)
		}
	}
}

ProtoDiv.substitute = function(s, obj) {
	for(var key in obj) {
		re = new RegExp("__"+key+"__", "g")
		s = s.replace(re, obj[key])
	}
	return s
}

ProtoDiv.inject = function(id, obj) {
	var proto = ProtoDiv.elem(id)

	proto.innerHTML = ProtoDiv.substitute(proto.innerHTML, obj)

	for(var i = 0; i < proto.attributes.length; i++) {
		var a = proto.attributes[i]
		a.textContent = ProtoDiv.substitute(a.textContent, obj)
	}

	for(var key in obj) {
		var c = key.substring(1)
		var list = []
		switch(key.substring(0,1)) {
		case "#":
			ProtoDiv.map(proto, list, function(e) {
				return e.id == c
			})
			ProtoDiv.reduce(list, function(e) {
				e.innerHTML = obj[key]
			})
			break
		case ".":
			ProtoDiv.map(proto, list, function(e) {
				return e.className == c
			})
			ProtoDiv.reduce(list, function(e) {
				e.innerHTML = obj[key]
			})
			break
		}
	}

	return proto
}

ProtoDiv.replicate = function(id, arr, keep) {
	var proto = ProtoDiv.elem(id)
	var sib = proto.nextSibling 	// might be null
	var mom = proto.parentNode
	if(!(arr instanceof Array))
		arr = [arr]
	var l = arr.length
	var obj
	
	if(proto.origSib === undefined) {
		proto.origSib = sib
		proto.origDisplay = proto.style.display
	}

	for(var i = 0; i < l; i++) {
		obj = arr[i]
		var e = proto.cloneNode(true)
		delete e.id
		mom.insertBefore(e, sib)
		ProtoDiv.inject(e, obj)
	}

	if(!keep)
		proto.style.display = "none"

	return proto
}

ProtoDiv.reset = function(id) {
	var proto = ProtoDiv.elem(id)
	if(proto.origSib !== undefined) {
		proto.style.display = proto.origDisplay
		while(proto.nextSibling !== proto.origSib) {
			proto.parentNode.removeChild(proto.nextSibling)
		}
		delete proto.origSib
		delete proto.origDisplay
	}
	return proto
}


