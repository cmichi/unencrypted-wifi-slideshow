var socket = io.connect('http://localhost:3000');

var displaying = new Array();
var queue = new Array();
var blocking = false;

var fixedSizeY;


$(document).ready(function() {
	var $container = $('#container');
	var foo = 50;
	
	fixedSizeY = $container.height();
	
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
	console.log("addNew continues")
		
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
				sizeOptWidth+' height' + sizeOptHeight + '">' +
	 		   '<img src="./tmp/' + data.path + '" />' +
			   '</div>');
			
			console.log("add img")
	if (!displaying.inArray('#' + data.path.match(/^\d+/gi)) && blocking === false) {					
		blocking = true;		
			console.log("insert img")
		insert(item, '#' + id);
		blocking = false;
	}else {
		console.log("skipping")
	}
}


function insert(item, sel) {
	/* in welcher row steckt das Ganze? */
	$('#container').isotope( 'insert', item, function() {
		checkInsert(item, sel);
	});
}


function checkInsert(item, sel) {
	var top = parseInt($(sel).css('top').replace("px",""));			
	var height = parseInt($(sel).height());			
	//console.log('top: ' + top + ", height:" + height + '. ' + parseInt(top + height) + ' > ' + fixedSizeY);
	
	if ((top + height) > fixedSizeY) {
		// delete the newly inserted elements
		var $removable = $('#container').find( sel );
        $('#container').isotope( 'remove', $removable );

		var oldSel = displaying.shift();		
		console.log('removing old element: ' + oldSel);
		
		// delete the oldest element 
		var $removable = $('#container').find( oldSel );
        $('#container').isotope( 'remove', $removable );

		// use a longer interval, otherwise the ui will be too fast
		clearInterval(interval);
		interval = window.setInterval("addNew();", 800);

		// then try inserting the new one again		
		insert(item, sel);
	} else {
		displaying.push(sel);
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


socket.on('news', function (data) {
	console.log(data);
	if (data.width < 48 || data.height < 48) return;

	if (!queue.inArray(data) && !displaying.inArray('#' + data.path.match(/^\d+/gi))) { 
		queue.push(data);
		console.log("new file: " + data.path);
	}
});

// until the first time when elements get deleted
// use a short interval
var interval = window.setInterval("addNew();", 200);
