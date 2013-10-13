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

**Current state: Haven't worked on this for a year so. Now I am updating it
to current libraries!**   

Has been succesfully tested in Firefox 10 under Mac OS X and Linux.
		

# Install & Run

Install [node.js](https://github.com/joyent/node) and libpcap.
On OSX it should be preinstalled, on Linux it should either be there by
default or within a package like libpcap-dev: `sudo apt-get install libpcap-dev`.

	git clone https://github.com/cmichi/unencrypted-wifi-slideshow.git
	cd unencrypted-wifi-slideshow/
	
	# Install dependencies
	npm install 
	make install

	# optional, see section Filtering below
	make install-blacklists
		
	# start capturing on wlan0, 20 MB buffer
	sudo node showit.js -i wlan0 -b 20
	
	# open the graphical frontend in your browser
	http://localhost:3000/


# Filtering

For a publicly visible slideshow of the wifi you might want to set up a 
blacklist of domains. To install the [URLBlacklist](http://urlblacklist.com/) 
the Makefile provides a handy command: `make install-blacklists`.
However it will only setup an adult filter, see the `./blacklists/` folder
for other categories. Please make sure you are within the usage rights of 
URLBlacklist.

The `config.js` should contain an array of files:

	exports.blacklists = ["./blacklist-domains.txt", "./more-domains.txt"]

The blacklist files have to be a text file separated by CRLFs like this:
	
	notDisplayed.com
	neverShown.org
	...


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


# Changelog

 * April 2012: Timo Haas <haas.timo@uni-ulm.de> kindly proposed some changes 
which added, among other things, Linux support.


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
