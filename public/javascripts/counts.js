/* vim: set ts=2: */

var loc		= document.location;
var port	= loc.port == '' ? ( loc.protocol == 'https:' ? 443 : 80 ) : loc.port;
var url		= loc.protocol + '//' + loc.hostname + ':' + port;

counts = io.connect( url + '/counts' );

counts.on( 'connect', function() {
	if( typeof noteID !== 'undefined' ) {
		counts.emit( 'join', noteID );
	}

	counts.emit( 'watch', lectureID );
});

counts.on( 'counts', function( c ) {
	for( id in c ) {
		var selector = 'span[note-id="' + id + '"].count';
		var target = $( selector );

		if( target ) {
			target.text( c[ id ] );
		}
	}
});
