/* vim: set ts=2: */
function resizeElems() {
  var ubHeight = public ? -17 : $('.userBox').height();
  var height = $(window).height() - $('.header').height();
  $('#posts').height( height - ubHeight - 101 );
  $('#editor').height( height - 55 )
}

$( document ).ready( function() {
	var padVisible = bcVisible = true;

	var editor	= $( '#editor' );
	var bc			= $( '#sidebar' );

  if (mobile) {
    editor.toggle();
    bc.css( 'width', '100%' );
    $('#togglePad').hide();
    $('#toggleBC').hide();
    $('#epliframe').remove();
  } else {
    resizeElems();
    $(window).resize(resizeElems);
  }

	$( '#toggleBC' ).click( function() {
		if( padVisible ) {
			// hide pad and, if bc is visible, grow it
			editor.toggle();

      bc.css( 'width', '100%' );
      
      $('#togglePad').attr('disabled', true);

			padVisible = false;
		} else {
			editor.toggle();

      $('#togglePad').removeAttr('disabled');

      bc.css( 'width', '30%' );

      editor.css( 'width', '70%' );
      
			padVisible = true;
		}
	});

	$( '#togglePad' ).click( function() {
		if( bcVisible ) {
			bc.toggle();

      editor.css( 'width', '100%' );

      $('#toggleBC').attr('disabled', true);

			bcVisible = false;
		} else {
			bc.toggle();

      $('#toggleBC').removeAttr('disabled');

      editor.css( 'width', '70%' );

      bc.css( 'width', '30%' );

			bcVisible = true;
		}
	});
});
