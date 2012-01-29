var socket = io.connect('http://localhost:1337');

var displaying = new Array();
var queue = new Array();
var blocking = false;


$(document).ready(function() {
	var foo = 120;
	var $container = $('#container');

	$container.isotope({
		itemSelector : '.element',
		animationEngine: 'jquery',
		animationOptions: {
			duration: 0,
			queue: false,
			complete: function() {
				console.log('no animation..');
			}
		},
		resizable: false, // disable normal resizing

		masonry: { 
			columnWidth: foo,
			masonryHorizontal : {
				rowHeight: foo
			},
			cellsByRow : {
				columnWidth : foo*2,
				rowHeight : foo*2
			},
			cellsByColumn : {
				columnWidth : foo*2,
				rowHeight : foo*2
			}
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
		
	var sizeOptWidth = '';
	var sizeOptHeight = '';
	
	if (data.width > 110) sizeOptWidth = 2;
	//if (data.width > 230) sizeOptWidth = 3;
	
	if (data.height > 110) sizeOptHeight = 2;
	//if (data.height > 230) sizeOptHeight = 3;
	
	var item = $('<div class="element halogen nonmetal width' + 
				sizeOptWidth+' height' + sizeOptHeight + 
				'" data-symbol="Cl" data-category="halogen">' +
	 		   '<img src="./tmp/' + data.path + '" />' +
			   '</div>');
			
	if (!displaying.inArray(data.path) && blocking === false) {			
		displaying.push(data.path);
		blocking = true;
		
		console.log('appending ' + data.path);
		
		$('#container').isotope( 'insert', item );
		blocking = false;
		
		/*
		$('#container').append( $(item) ).isotope( 'insert', $(item) , function() {
			//console.log('fertisch');
			blocking = false;
			displaying.push(data.path);
		});
		*/
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

window.setInterval("addNew();", 1000);

socket.on('news', function (data) {
	console.log(data);

	if (!queue.inArray(data) && !displaying.inArray(data.path)) { 
		queue.push(data);
		console.log("new file: " + data.path);
	}
});
