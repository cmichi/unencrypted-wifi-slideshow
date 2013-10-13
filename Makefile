default: install

install:
	mkdir ./tmp/
	touch config.js


install-blacklists:
	# Please make sure you are within the usage rights of URLBlacklist
	#curl "http://urlblacklist.com/cgi-bin/commercialdownload.pl?type=download&file=bigblacklist" > blacklist.tar.gz
	#tar xfvz blacklist.tar.gz
	#rm blacklist.tar.gz

	echo "exports.blacklists = [" >> config.js
	find ./blacklists/porn/urls* -type f | xargs -i echo "'{}'," >> config.js
	sed -i '$$ s/,/]/g' config.js
	
