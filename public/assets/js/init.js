$(function() {

	var mouseIsInside;


	//
	// live courses dropdown
	//
	
	$('#live-courses').hover(function() {
		mouseIsInside = true;
	}, function() {
		mouseIsInside = false;
	});

	$('#live-courses').delegate('#live-courses-link', 'click', function(e) {
		e.preventDefault();
		var link = this;

		$(this).toggleClass('s-active').siblings('#live-courses-overlay').toggle();

		$('body').bind('click', function() {
			if ( !(mouseIsInside) ) {
				closeModal();
			}
		});

		function closeModal() {
			$(link).toggleClass('s-active').siblings('#live-courses-overlay').toggle();
			$('body').unbind('click');
		}
	});


	//
	// live courses carousel
	//

	var 
	$pag = $('.modal-pag-controls'),
	$wrapper = $('.modal-carousel-wrapper'),
	$carousel = $wrapper.children('.modal-carousel'),
	$prev = $pag.find('.pag-left'),
	$next = $pag.find('.pag-right'),
	carouselWidth = $wrapper.width(),
	carouselHeight = $wrapper.height();
	slides = $carousel.children('.live-course-slide').length;
	slidePos = 0;

	$prev.click(function(e) {
		e.preventDefault();

		if (slidePos > 0)  {
			slidePos--;
			carouselBack();
			$next.removeClass('s-disabled');
			if (slidePos === 0) {
				$(this).addClass('s-disabled');
			}
			else {
				$(this).removeClass('s-disabled');
			}
		}

	});

	$next.click(function(e) {
		e.preventDefault();

		if (slidePos < slides - 1) {
			slidePos++;
			carouselForward();
			$prev.removeClass('s-disabled');
			if (slidePos == slides - 1) {
				$(this).addClass('s-disabled');
			}
			else {
				$(this).removeClass('s-disabled');
			}
		}
	});


	function carouselForward() {
		console.log($carousel);
		$carousel.animate(
			{ marginLeft: '-=' + carouselWidth },
			{ easing: 'linear', duration: 'fast' }
		);
	}

	function carouselBack() {
		$carousel.animate(
			{ marginLeft: '+=' + carouselWidth },
			{ easing: 'linear', duration: 'fast' }
		);
	}

});
