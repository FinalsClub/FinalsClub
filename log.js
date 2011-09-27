
var util = require("util")

global.logLevel = 0

var n0 = function(n) {
	if(n >= 0 && n < 10)
		return "0"+n
	return n
}

global.log0 = function(s, l) {

	if(s instanceof Object)
		s = util.inspect(s)

	if(l === undefined)
		l = 0
	if(l <= logLevel) {
		var d = new Date()
		var t = d.getFullYear()+"-"+n0(d.getMonth()+1)+"-"+n0(d.getDate())+"_"+n0(d.getHours())+":"+n0(d.getMinutes())+":"+n0(d.getSeconds())

		process.stdout.write(t+" "+s+"\n");
	}
}
global.log1 = function(s) { log0(s, 1) }
global.log2 = function(s) { log0(s, 2) }
global.log3 = function(s) { log0(s, 3) }
global.log4 = function(s) { log0(s, 4) }
global.log5 = function(s) { log0(s, 5) }

