# Readme

This project aims on encouraging privacy awareness. It displays unencrypted 
traffic over wireless networks in a slideshow manner.
Interesting content like Facebook photos, ICQ messages or Mail subjects 
is/should be (still a todo) prioritized.

Caution: Be sure to use the project in a dedicated network where users are
informed and aware that everything is displayed on a screen! 
Otherwise you might face legal consequences!

We have used this project as part of the "[Chaos macht Schule](http://ulm.ccc.de/ChaosMachtSchule)" 
program of the german CCC. We give presentations in schools to raise awareness 
of privacy issues or data capturing on social networks and the internet.

As part of the programm we set up a beamer with the slideshow and a dedicated 
wireless network. During the presentation we plan to hand out smartphones with
pre-installed apps and let the pupils experiment with them.
		
		
# Run it!

	git clone https://github.com/cmichi/unencrypted-wifi-slideshow.git
	cd unencrypted-wifi-slideshow/
	
	# temporary folder for media content
	mkdir tmp 
	
	# start capturing on en1
	sudo node showit.js -i en1
	
	# start processing	


# Screenshot

ToDo


# ToDo

 * Prioritize interesting content (facebook, icq, mail subjects)
 * Blacklist "special" sites
 * Log everything to as JSON file, load that file at startup.
   This way unexpected shutdowns can be handled.


# Libraries

 * [node_pcap](https://github.com/mranney/node_pcap)


# License

This project is licensed under MIT:

	Copyright (c) 2011 
	
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
