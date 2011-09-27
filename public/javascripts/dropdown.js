$( document ).ready( function() {
	$( 'ul.dropdown li' ).hover(
		// hover in
		function() {
			var elem = $( this );

			elem.find( 'ul' ).slideDown( 100 );
		},
		// hover out
		function() {
			var elem = $( this );

			elem.find( 'ul' ).slideUp( 100 );
		}
	);
});
