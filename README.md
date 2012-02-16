# Unencrypted WiFi Slideshow

This project aims on raising privacy awareness. It displays unencrypted 
traffic over wireless networks in a slideshow manner.
Interesting content like Facebook photos, ICQ messages or Mail subjects 
should be (still a todo) prioritized.

Caution: Be sure to use the project in a dedicated network, where users are
informed and aware that everything is displayed on a screen! 
Otherwise you might face legal consequences!

We want to use this project as part of the "[Chaos macht Schule](http://ulm.ccc.de/ChaosMachtSchule)" 
program. The goal of the CmS project is to raise awareness on privacy/security
issues and data exposure in social networks/the internet by giving presentations
in schools.

As part of our presentation we set up a beamer with the slideshow and a dedicated 
wireless network. During the presentation we plan to hand out smartphones with
pre-installed apps and let the pupils experiment with them.

**Current state: Definitely Work-In-Progress!**   
I am developing under Mac OS X and -- as far as I know -- it currently doesn't work
on other operating systems. On my system it works well though! 
		

# Install & Run

Install [node.js](https://github.com/joyent/node). I am working with v0.6.6.

	git clone https://github.com/cmichi/unencrypted-wifi-slideshow.git
	cd unencrypted-wifi-slideshow/
	
	# Install dependencies
	npm install socket.io
	npm install express
	npm install imagemagick	
	
	# temporary folder for media content
	mkdir tmp 
		
	# start capturing on en1
	sudo node showit.js -i en1
	
	# open the graphical frontend in your browser
	file://.../unencrypted-wifi-slideshow/frontend.html


# Filtering

For a publicly visible slideshow of the wifi you might want to set up a 
blacklist of domains. You can do this by updating the `config.js`:

	exports.blacklists = ["./some-domains", "./more-domains"]

The blacklist has to be a text file separated by CRLFs like this:
	
	notDisplayed.com
	neverShown.org
	...
	
A publicly available blacklist is [URLBlacklist](http://urlblacklist.com/) 
for example.


# ToDo

 * Prioritize interesting content (facebook, icq, mail subjects)
 * Blacklist "special" sites
 * Log everything to as JSON file, load that file at startup.
   This way unexpected shutdowns can be handled.
 * Add possibility to set the slideshow up via a proxy.  
   This way legal problems could be avoided by handing out Smartphones
   which have the proxy globally enabled. Preventing applications from 
   using https could also be done by the proxy!


# Libraries

 * [node_pcap](https://github.com/mranney/node_pcap)
 * [socket.io](https://github.com/LearnBoost/socket.io)
 * [imagemagick](https://github.com/rsms/node-imagemagick)
 * [isotope](https://github.com/desandro/isotope)


# License

This project is licensed under MIT:

	Copyright (c) 2012
	
		Michael Mueller <http://micha.elmueller.net/>
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
