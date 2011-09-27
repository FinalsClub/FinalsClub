/* vim: set ts=2: */

var url		= require( 'url' );

var mongo	= require( 'mongodb' );

module.exports.open = function( uri, callback ) {
	if( ! uri ) {
		throw new Error( 'No URI defined!' );
	}

	var parsed			= url.parse( uri );
	var path				= parsed.pathname.split( '/' );

	var port				= parsed.port || 27017;
	var host				= parsed.hostname || 'localhost';

	var db					= path[ 1 ];
	var collection	= path[ 2 ];

	if( parsed.auth ) {
		var auth = parsed.auth.split( ':' );

		var username = auth[ 0 ];
		var password = auth[ 1 ];
	}

	if( ! db ) {
		throw new Error( 'Unable to parse database name!' );
	}

	var server		= new mongo.Server( host, port, { auto_reconnect : true } );
	var database	= new mongo.Db( db, server );

	database.open( function( err, database ) {
		// XXX: add authentication

		if( err ) {
			callback( err );
		} else {
			// do we want to open a specific collection? otherwise just return DB
			if( ! collection ) {
				callback( null, database );
			} else {
				database.createCollection( collection, function( err, c ) {	
					if( err ) {
						callback( err );
					} else {
						callback( null, c );
					}
				});
			}
		}	
	});
}
