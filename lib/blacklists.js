var fs = require("fs");
var blacklists = [];

exports.load = function(conf_blacklists) {
	console.log('starting to load blacklists...');
	console.log(conf_blacklists)

	for (var index in conf_blacklists) {
		var path = conf_blacklists[index];
		if (typeof path != "String") continue;

		console.log("loading blacklist " + path)
		console.log(conf_blacklists.length)

		var cnt = fs.readFileSync(path, 'utf8');
		var arr = cnt.split('\n');

		blacklists = blacklists.concat(arr);
		console.log("loaded")
	}
}

exports.match = function(host) {
	if (blacklists.inArray(host)) return true;

	return false;
}

Array.prototype.inArray = function(value) {
	if (this === null) return false;
	
	if (this.length === 0) {
		return false;
	}
		
	for (var index in this) {
		if (this[index] === value) {
			return true;
		}
	}
	return false;
}	
