var socket = io.connect('http://localhost:1337');

var displaying = new Array();
var queue = new Array();
var blocking = false;
var currDisplaying = new Array();

$(document).ready(function() {
	var $container = $('#container');
	
	var foo = 50;
	

	$container.isotope({
		itemSelector : '.element',
		animationEngine: 'jquery',
		animationOptions: {
			duration: 0,
			queue: false,
			complete: function() {
				// console.log('no animation..');
			}
		},
		resizable: false, // disable normal resizing
		
		masonry: { 
			columnWidth: foo
			/*
			, masonryHorizontal : {
				rowHeight: foo
			}
			
			, cellsByRow : {
				columnWidth : foo,
				rowHeight : foo
			}
			, cellsByColumn : {
				columnWidth : foo,
				rowHeight : foo
			}
			*/
		}
	});

	// update columnWidth on window resize
	$(window).smartresize(function(){
	  $container.isotope({
	    // update columnWidth to a percentage of container width
	    masonry: { columnWidth: foo }
	  });
	});
});


function addNew() {
	if (queue.length < 1) return;
	if ((data = queue.shift()) == 'undefined') return;
		
	var sizeOptWidth = '0';
	var sizeOptHeight = '0';
	
	if (data.width > 100) sizeOptWidth = 1;
	if (data.height > 100) sizeOptHeight = 1;

	if (data.width > 200) sizeOptWidth = 2;
	if (data.height > 200) sizeOptHeight = 2;

	if (data.width > 250) sizeOptWidth = 5;
	if (data.height > 250) sizeOptHeight = 5;

	if (data.width > 350) sizeOptWidth = 3;	
	if (data.height > 350) sizeOptHeight = 3;

	if (data.width > 450) sizeOptWidth = 4;	
	if (data.height > 450) sizeOptHeight = 4;
	
	var id = data.path.match(/^\d+/gi);
	
	var item = $('<div id="' + id + '" style="display:block" class="element width' + 
				sizeOptWidth+' height' + sizeOptHeight + 
				'">' +
	 		   '<img src="./tmp/' + data.path + '" />' +
			   '</div>');
			
	if (!displaying.inArray(data.path) && blocking === false) {			
		displaying.push(data.path);
		blocking = true;
		
		insert(item, '#' + id);
		
//		console.log('appending ' + data.path);
		
//		console.log('next y is.. ' + $('#container').isotope( 'foo', item) );
		/*
		$('#container').isotope( 'insert', item, function() {
//			console.log( 'height:' +  $('#container').height() );			
			
//			insert(el);
			
			
			console.log($('#' + data.path).attr(''));
			
		} );
		*/
		
		
		blocking = false;
	}
}

function insert(item, sel) {
	/* in welcher row steckt das Ganze? */
	$('#container').isotope( 'insert', item, function() {
		checkInsert(item, sel);
	});
}

function checkInsert(item, sel) {
	var top = $(sel).css('top').replace("px","");			
	console.log('here: ' + top);
	
	if (top > 200) {
		// das aktuelle löschen
		var $removable = $('#container').find( sel );
        $('#container').isotope( 'remove', $removable );

		var oldSel = currDisplaying.shift();		
		console.log('remove sth old! ' + oldSel)
		// so lange alte rauslöschen, bis es reinpasst
		var $removable = $('#container').find( oldSel );
        $('#container').isotope( 'remove', $removable );

		insert(item, sel);
	} else {
		currDisplaying.push(sel);
	}
}


Array.prototype.inArray = function(value) {
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


window.setInterval("addNew();", 200);

socket.on('news', function (data) {
	console.log(data);

	if (!queue.inArray(data) && !displaying.inArray(data.path)) { 
		queue.push(data);
		console.log("new file: " + data.path);
	}
});
