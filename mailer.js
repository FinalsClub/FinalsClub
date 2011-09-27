/* vim: set ts=2: */

// Core
var fs	= require( 'fs' );

// Amazon
var aws	= require( 'aws-lib' );

// Templating
var ejs	= require( 'ejs' );

function buildPath( template ) {
	return './emails/' + template + '.ejs';
}

function Mailer( accessKey, secretKey ) {
	this.accessKey	= accessKey;
	this.secretKey	= secretKey;

	this.client			= aws.createSESClient( this.accessKey, this.secretKey );
}
	
module.exports = Mailer;

Mailer.prototype.send = function( msg, callback ) {
	if( ! msg.template && ! msg.body ) {
		callback( new Error( 'Invalid message specification!' ) );
	}

	if( msg.template ) {
		var templatePath = buildPath( msg.template );

		var data = fs.readFileSync( templatePath, 'utf8' );

		msg.body = ejs.render( data, { locals: msg.locals } ); // .replace( /\\n/g, '\n' );
	}

	var params = {
		'Destination.ToAddresses.member.1'	: msg.to,
		'Message.Body.Html.Charset'					: 'UTF-8',
		'Message.Body.Html.Data'						: msg.body,
		'Message.Subject.Charset'						: 'UTF-8',
		'Message.Subject.Data'							: msg.subject,
		'Source'										: 'FinalsClub.org <info@finalsclub.org>'
	};

	this.client.call( 'SendEmail', params, function( result ) {
		console.log( result );

		if( result.Error ) {
			callback( result.Error );
		} else {
			callback( null, result );
		}
	});
}
