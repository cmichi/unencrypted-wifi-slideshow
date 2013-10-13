var fs = require("fs");
var blacklists = [];

exports.load = function(conf_blacklists) {
	console.log('starting to load blacklists...');
	console.log(conf_blacklists)

	for (var index in conf_blacklists) {
		var path = conf_blacklists[index];
		if (typeof path != "string") continue;

		console.log("loading blacklist " + path)
		console.log(conf_blacklists.length)

		var cnt = fs.readFileSync(path, 'utf8');
		var arr = cnt.split('\n');

		blacklists = blacklists.concat(arr);
		console.log("loaded " + path)
	}
}

exports.match = function(host) {
	var hostparts = host.split('.');

	// strip all subdomain stuff (cdn networks, etc.)
	if (hostparts.length >= 2) {
		hostparts = hostparts.slice(-2).join('.');
	} else {
		hostparts = http.request.headers['Host'];
	}

	for (var i in blacklists) {
		if (blacklists[i].replace(hostparts, "") != blacklists[i]) {
			return true;
		}
	}

	return false;
}
