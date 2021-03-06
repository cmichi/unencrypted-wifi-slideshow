/* This code is based on the node_pcap module written by Matthew Ranney. */

var imagemagick = require('./lib/imagemagick.js');
var blacklists = require('./lib/blacklists.js');

var io = require('socket.io');
var express = require('express');
var fs = require("fs");
var sys = require("util");
var http = require('http');
var pcap = require("pcap");
var pcap_session;
var buffer = require('buffer');
var options = {};
var cnt = 0;
var mime_types = {
	"image/png" : ".png"
	, "image/jpeg": ".jpeg"
	, "image/jpg": ".jpg"
};

var app = express();
var server = http.createServer(app);
var io = io.listen(server);

app.use(express.static(__dirname + '/public'));

io.configure(function(){
	io.set('log level', 1);
});

server.listen(3000);

var config = require('./config.js');
var tmp_path = './public/tmp/';

if (config.blacklists !== undefined) 
	blacklists.load(config.blacklists);

var ANSI = (function () {
	/* http://en.wikipedia.org/wiki/ANSI_escape_code */
	var formats = {
		bold: [1, 22], // bright
		light: [2, 22], // faint
		italic: [3, 23],
		underline: [4, 24], // underline single
		blink_slow: [5, 25],
		blink_fast: [6, 25],
		inverse: [7, 27],
		conceal: [8, 28],
		strikethrough: [9, 29], // crossed-out
		// 10 - 20 are font control
		underline_double: [21, 24],
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		grey: [90, 39]
	};
	var CSI = String.fromCharCode(27) + '[';

	return function (str, format) {
		if (options["no-color"]) {
			return str;
		}

		return CSI + formats[format][0] + 'm' + str + CSI + formats[format][1] + 'm';
	};
}());

function lpad(num, len) {
	var str = num.toString();

	while (str.length < len) {
		str = "0" + str;
	}

	return str;
}

function format_timestamp(timems) {
	var date_obj = new Date(timems);

	return ANSI(
		lpad(date_obj.getHours(), 2) 
		+ ":" + lpad(date_obj.getMinutes(), 2) 
		+ ":" + lpad(date_obj.getSeconds(), 2) + "." 
		+ lpad(date_obj.getMilliseconds(), 3), "blue"
	);
}

function format_hostname(hostname) {
	if (/[a-zA-Z]/.test(hostname)) {
		var parts = hostname.split(":");
		return ANSI(parts[0].split('.')[0] + ":" + parts[1], "magenta");
	} else {
		return ANSI(hostname, "magenta");
	}
}

function format_line_start(ts, src, dst) {
	return format_timestamp(ts) + " " + format_hostname(src) + " -> " + format_hostname(dst);
}

function format_headers(headers) {
	return Object.keys(headers).map(function (val) {
		if (val === "Cookie") {
			var cookie_pairs = headers[val].split("; ").sort();
			return ("    " + ANSI(val, "white") + ": " + ANSI(cookie_pairs.map(function (pair) {
				var parts = pair.split('=');
				return parts[0] + ": " + parts[1];
			}).join("\n            "), "grey"));
		} else {
			return ("    " + ANSI(val, "white") + ": " + ANSI(headers[val], "grey"));
		}
	}).join("\n");
}

function format_size(size) {
	if (size < 1024 * 2) {
		return size + "B";
	} else if (size < 1024 * 1024 * 2) {
		return (size / 1024).toFixed(2) + "KB";
	} else {
		return (size / 1024 / 1024).toFixed(2) + "MB";
	}
}

function format_obj(obj) {
	var keys = Object.keys(obj).sort();

	return keys.map(function (key) {
		if (typeof obj[key] === 'object') {
			return "    " + ANSI(key, "white") + sys.inspect(obj[key]);
		} else {
			return "    " + ANSI(key, "white") + ": " + ANSI(obj[key], "grey");
		}
	}).join('\n');
}

function usage_die(message) {
	if (message) {
		sys.error("");
		sys.error(message);
	}

	sys.error("");
	sys.error("usage: http_trace [options]");
	sys.error("");
	sys.error("Capture options:");
	sys.error("    -i <interface>           interface name for capture (def: first with an addr)");
	sys.error("    -f <pcap_filter>         packet filter in pcap-filter(7) syntax (def: all TCP packets)");
	sys.error("    -b <buffer>              size in MB to buffer between libpcap and app (def: 10)");
	sys.error("");
	sys.error("HTTP filtering:");
	sys.error("    Filters are OR-ed together and may be specified more than once.");
	sys.error("    --method <regex>         filter on method");
	sys.error("    --host <regex>           filter on Host request header");
	sys.error("    --url <regex>            filter on URL");
	sys.error("    --user-agent <regex>     filter on User-Agent request header");
	sys.error("");
	sys.error("HTTP output:");
	sys.error("    --headers                print headers of request and response (def: off)");
	sys.error("    --bodies                 print request and response bodies, if any (def: off)");
	sys.error("    --tcp-verbose            display TCP events (def: off)");
	sys.error("    --no-color               disable ANSI colors (def: pretty colors on)");
	sys.error("");
	sys.error("Examples:");
	sys.error('    http_trace -f "tcp port 80"');
	sys.error('       listen for TCP port 80 on the default device');
	sys.error('    http_trace -i eth1 --method POST');
	sys.error('       listen on eth1 for all traffic that has an HTTP POST');
	sys.error('    http_trace --host ranney --headers');
	sys.error('       matches ranney in Host header and prints req/res headers');
	process.exit(1);
}

function parse_options() {
	var argv_slice = process.argv.slice(2), 
	    optnum = 0, opt, optname, optval,
	    state = "match optname", matches,
	    valid_options;

	valid_options = {
		"i": { multiple: false, has_value: true },
		"f": { multiple: false, has_value: true },
		"b": { multiple: false, has_value: true },
		"method": { multiple: true, has_value: true, regex: true },
		"host": { multiple: true, has_value: true, regex: true },
		"url": { multiple: true, has_value: true, regex: true },
		"user-agent": { multiple: true, has_value: true, regex: true },
		"headers": { multiple: false, has_value: false },
		"bodies": { multiple: false, has_value: false },
		"tcp-verbose": { multiple: false, has_value: false },
		"no-color": { multiple: false, has_value: false },
		"help": { multiple: false, has_value: false }
	};

	function set_option(name, value) {
		if (valid_options[name].multiple) {
			if (valid_options[name].regex) {
				value = new RegExp(value);
			}
			if (options[name] === undefined) {
				options[name] = [value];
			} else {
				options[name].push(value);
			}
		} else {
			if (options[name] === undefined) {
				options[name] = value;
			} else {
				usage_die("Option " + name + " may only be specified once.");
			}
		}
	}

	while (optnum < argv_slice.length) {
		opt = argv_slice[optnum];

		if (state === "match optname") {
			matches = opt.match(/^[\-]{1,2}([^\-].*)/);
			if (matches !== null) {
				optname = matches[1];
				if (valid_options[optname]) { // if this is a known option
					if (valid_options[optname].has_value) {
						state = "match optval";
					} else {
						set_option(optname, true);
					}
				} else {
					usage_die("Invalid option name: " + optname);
				}
			} else {
				usage_die("bad option name: " + opt);
			}
		} else if (state === "match optval") {
			if (opt[0] !== '-') {
				set_option(optname, opt);
				state = "match optname";
			} else {
				usage_die("bad option value: " + opt);
			}
		} else {
			throw new Error("Unknown state " + state + " in options parser");
		}

		optnum += 1;
	}

	if (state === "match optval") {
		usage_die("Missing option value for " + optname);
	}
}

function filter_match(http) {
	var filters = [
		[http.request.method, options.method],
		[http.request.url, options.url],
		[http.request.headers.Host, options.host],
		[http.request.headers["User-Agent"], options["user-agent"]],
	], filter_pair_num, filter_index;

	if (options.method || options.host || options.url || options["user-agent"]) {
		return filters.some(function (filter_pair) {
			if (typeof filter_pair[1] === 'object') {
				return filter_pair[1].some(function (filter) {
					return filter.test(filter_pair[0]);
				});
			}
			return false;
		});
	} else {
		return true; // if no filters, then everything "matches"
	}
}

function start_capture_session() {
	if (! options.f) {
		// default filter is all IPv4 TCP, which is all we know how to decode right now anyway
		options.f = "ip proto \\tcp";
	}
	pcap_session = pcap.createSession(options.i, options.f, (options.b * 1024 * 1024));

	console.log("Listening on " + pcap_session.device_name);
}

function start_drop_watcher() {
	// Check for pcap dropped packets on an interval
	setInterval(function () {
		var stats = pcap_session.stats();
		if (stats.ps_drop > 0) {
		    console.log(ANSI("pcap dropped packets, need larger buffer or less work to do: " + sys.inspect(stats), "bold"));
		}
	}, 2000);
}

function setup_listeners() {
	var tcp_tracker = new pcap.TCP_tracker();

	// listen for packets, decode them, and feed TCP to the tracker
	pcap_session.on('packet', function (raw_packet) {
		var packet = pcap.decode.packet(raw_packet);
		tcp_tracker.track_packet(packet);
	});

	if (options["tcp-verbose"]) {
		tcp_tracker.on("start", function (session) {
			console.log(format_line_start(session.current_cap_time, session.src_name, session.dst_name) +
			" TCP start ");
		});

		tcp_tracker.on("retransmit", function (session, direction, seqno) {
			var line_start;
			if (direction === "send") {
				line_start = format_line_start(session.current_cap_time, session.src_name, session.dst_name);
			} else {
				line_start = format_line_start(session.current_cap_time, session.dst_name, session.src_name);
			}
			console.log(line_start + "TCP retransmit at " + seqno);
		});

		tcp_tracker.on("end", function (session) {
			console.log(format_line_start(session.current_cap_time, session.src_name, session.dst_name) 
				+ " TCP end ");
		});

		tcp_tracker.on("reset", function (session) {
			// eventually this event will have a direction.  Right now, it's only from dst.
			console.log(format_line_start(session.current_cap_time, session.dst_name, session.src_name) 
				+ " TCP reset ");
		});

		tcp_tracker.on("syn retry", function (session) {
			console.log(format_line_start(session.current_cap_time, session.src_name, session.dst_name) 
				+ " SYN retry");
		});
	}

	tcp_tracker.on('http response', function (session, http) {
		var head = http.response.headers["Content-Type"],
		    encoding = http.response.headers["Content-Encoding"],
		    clength = http.response.headers["Content-Length"],
		    ext;

		// console.log("\nok: " + JSON.stringify(http.response.headers));
		if (head) {
			head = head.split(';')[0]
			ext = mime_types[head];
			session._ext = ext;
		}
		// console.log(encoding + ", ", ext);

		//_p([http.request.headers.Host, http.request.url]);
		// TODO: handle gzip Content-Encoding
		if (encoding || !ext) { return }
		//if (encoding || !ext) { return }

		// Missing Content-Lenght
		if (!clength) { _p("Missing content-length"); return }

		session._writerBuffer = new buffer.Buffer(parseInt(clength));
		session._writerBuffer._pos = 0; // where to write
		session._path = (new Date).getTime() + (++cnt) + ext;
	});

	tcp_tracker.on('http response body', function (session, http, data) {
		if (session._writerBuffer) {
			if (session._writerBuffer.length - session._writerBuffer._pos < data.length) {
				console.log("buffer overflow");
			}

			data.copy(session._writerBuffer, session._writerBuffer._pos);
			session._writerBuffer._pos += data.length;
			// console.log(session._path + " < " + session._writerBuffer._pos + '/' + session._writerBuffer.length);
		}
	});

	tcp_tracker.on('http response complete', function (session, http) {
		if (session._writerBuffer) {
			if (session._writerBuffer._pos != session._writerBuffer.length) {
				console.log("file was not completely written!");
				return;
			}

			if (blacklists.match(http.request.headers['Host']) == true) {
				console.log('skipping ' + http.request.headers['Host']);
				return;
			}

			var filepath = tmp_path + session._path;

			console.log("");
			console.log("Writing " + filepath + ", " + session._writerBuffer.length);

			fs.writeFile(filepath, session._writerBuffer, function(err) {
				if (err) console.log("err: " + err)
				console.log("hooray " + filepath)
				delete session._writerBuffer;

				ident(filepath);
			});
		}	
	});
}

function ident(filepath, session) {
	console.log(filepath + " written")
	var path = filepath.replace("./public/tmp/","");
	imagemagick.identify(filepath, function(err, features){
		if (!err) {
			console.log('broadcasting ' + path + " to " + io.sockets.clients().length);
			io.sockets.emit('news', { "path": path, width : features.width, height : features.height });
			console.log("")
		} else {
			console.log(err)
		}
	});
}


parse_options();
if (options.help) {
	usage_die();
}

start_capture_session();
start_drop_watcher();
setup_listeners();
