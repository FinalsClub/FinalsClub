/* vim: set ts=2: */

// Prerequisites

var sys					= require( 'sys' );
var os					= require( 'os' );
var url					= require( 'url' );

var express			= require( 'express' );
var mongoStore	= require( 'connect-mongo' );
var async				= require( 'async' );

var db					= require( './db.js' );
var mongoose		= require( './models.js' ).mongoose;
//var mysql				= require( 'mysql' );

var Mailer			= require( './mailer.js' );
var hat					= require('hat');

var connect			= require( 'connect' );
var Session			= connect.middleware.session.Session;
var parseCookie = connect.utils.parseCookie;

var log3 = function() {}

var app = module.exports = express.createServer();

// Database

var User		= mongoose.model( 'User' );
var School	= mongoose.model( 'School' );
var Course	= mongoose.model( 'Course' );
var Lecture	= mongoose.model( 'Lecture' );
var Note		= mongoose.model( 'Note' );

var ArchivedCourse = mongoose.model( 'ArchivedCourse' );
var ArchivedNote = mongoose.model( 'ArchivedNote' );
var ArchivedSubject = mongoose.model( 'ArchivedSubject' );

var ObjectId	= mongoose.SchemaTypes.ObjectId;

// Mysql Init
/*
var sqlClient = mysql.createClient({
	host	 : process.env.MYSQL_DB_HOSTNAME || 'localhost',
	user     : process.env.MYSQL_DB_USER || 'root',
	password : process.env.MYSQL_DB_PASS || 'root',
	port	 : process.env.MYSQL_DB_PORT || 3306,
	database : 'fcstatic',
})
*/

// Configuration

var ADMIN_EMAIL = process.env.DEV_EMAIL || 'info@finalsclub.org';

var serverHost = process.env.SERVER_HOST;
var serverPort = process.env.SERVER_PORT;

if( serverHost ) {
	console.log( 'Using server hostname defined in environment: %s', serverHost );
} else {
	serverHost = os.hostname();

	console.log( 'No hostname defined, defaulting to os.hostname(): %s', serverHost );
}

app.configure( 'development', function() { 
	app.set( 'errorHandler', express.errorHandler( { dumpExceptions: true, showStack: true } ) );

	app.set( 'dbHost', process.env.MONGO_HOST || 'localhost' );
	app.set( 'dbUri', 'mongodb://' + app.set( 'dbHost' ) + '/fc' );

	app.set( 'awsAccessKey', process.env.AWS_ACCESS_KEY_ID );
	app.set( 'awsSecretKey', process.env.AWS_SECRET_ACCESS_KEY );

	if ( !serverPort ) {
		serverPort = 3000;
	}	 
});

app.configure( 'production', function() {
	app.set( 'errorHandler', express.errorHandler( { dumpExceptions: true, showStack: true } ) );

	// XXX Disable view caching temp
	app.disable( 'view cache' )

	app.set( 'dbHost', process.env.MONGO_HOST || 'localhost' );
	app.set( 'dbUri', 'mongodb://' + app.set( 'dbHost' ) + '/fc' );

	app.set( 'awsAccessKey', process.env.AWS_ACCESS_KEY_ID );
	app.set( 'awsSecretKey', process.env.AWS_SECRET_ACCESS_KEY );

	if ( !serverPort ) {
		serverPort = 80;
	}	
});

app.configure(function(){
	app.set( 'views', __dirname + '/views' );
	app.set( 'view engine', 'jade' );
	app.use( express.bodyParser() );

	app.use( express.cookieParser() );

	// sessions
	app.set( 'sessionStore', new mongoStore( {
		'url' : app.set( 'dbUri' )
	}));

	app.use( express.session( {
		'secret'	: 'finalsclub',
		'maxAge'	: new Date(Date.now() + (60 * 60 * 24 * 30 * 1000)),
		'store'		: app.set( 'sessionStore' )
	}));

	app.use( express.methodOverride() );
	app.use( app.router );
	app.use( express.static( __dirname + '/public' ) );

	// use the error handler defined earlier
	var errorHandler = app.set( 'errorHandler' );

	app.use( errorHandler );
});

// Mailers

function sendUserActivation( user ) {
	var message = {
		'to'				: user.email,

		'subject'		: 'Activate your FinalsClub.org Account',

		'template'	: 'userActivation',
		'locals'		: {
			'user'				: user,
			'serverHost'	: serverHost
		}
	};

	mailer.send( message, function( err, result ) {
		if( err ) {
			// XXX: Add route to resend this email

			console.log( 'Error sending user activation email\nError Message: '+err.Message );
		} else {
			console.log( 'Successfully sent user activation email.' );
		}
	});
}

function sendUserWelcome( user, school ) {
  var template = school ? 'userWelcome' : 'userWelcomeNoSchool';
	var message = {
		'to'				: user.email,

		'subject'		: 'Welcome to FinalsClub',

		'template'	: template,
		'locals'		: {
			'user'				: user,
			'serverHost'	: serverHost
		}
	};

	mailer.send( message, function( err, result ) {
		if( err ) {
			// XXX: Add route to resend this email

			console.log( 'Error sending user welcome email\nError Message: '+err.Message );
		} else {
			console.log( 'Successfully sent user welcome email.' );
		}
	});
}
// Middleware

function loggedIn( req, res, next ) {
	if( req.user ) {
		next();
	} else {
		req.flash( 'error', 'You must be logged in to access that feature!' );

		res.redirect( '/' );
	}
}

function loadUser( req, res, next ) {
	var sid = req.sessionID;

	console.log( 'got request from session ID: %s', sid );

	User.findOne( { session : sid }, function( err, user ) {

		log3(err);
		log3(user);

		if( user ) {
			req.user = user;

			req.user.loggedIn = true;

			log3( 'authenticated user: '+req.user._id+' / '+req.user.email+'');

      if( req.user.activated ) {
				// is the user's profile complete? if not, redirect to their profile
				if( ! req.user.isComplete ) {
					if( url.parse( req.url ).pathname != '/profile' ) {
						req.flash( 'info', 'Your profile is incomplete. Please complete your profile to fully activate your account.' );

						res.redirect( '/profile' );
					} else {
						next();
					}
				} else {
        	next();
				}
      } else {
				req.flash( 'info', 'This account has not been activated. Check your email for the activation URL.' );

				res.redirect( '/' );
      }
		} else {
			// stash the original request so we can redirect
			var path = url.parse( req.url ).pathname;
			req.session.redirect = path;

			req.user = {};

			next();
		}
	});
}

function loadSchool( req, res, next ) {
	var user			= req.user;
	var schoolId	= req.params.id;

	School.findById( schoolId, function( err, school ) {
		if( school ) {
			req.school = school;

			school.authorize( user, function( authorized ){
				req.school.authorized = authorized;
				next();
			});
		} else {
			req.flash( 'error', 'Invalid school specified!' );

			res.redirect( '/' );
		}
	});
}

function loadCourse( req, res, next ) {
	var user			= req.user;
	var courseId	= req.params.id;

	Course.findById( courseId, function( err, course ) {
		if( course ) {
			req.course = course;

			course.authorize( user, function( authorized )  {
				req.course.authorized = authorized;

				next();
			});
		} else {
			req.flash( 'error', 'Invalid course specified!' );

			res.redirect( '/' );
		}
	});
}

function loadLecture( req, res, next ) {
	var user			= req.user;
	var lectureId	= req.params.id;

	Lecture.findById( lectureId, function( err, lecture ) {
		if( lecture ) {
			req.lecture = lecture;

			lecture.authorize( user, function( authorized ) {
				req.lecture.authorized = authorized;

				next();
			});
		} else {
			req.flash( 'error', 'Invalid lecture specified!' );

			res.redirect( '/' );
		}
	});
}

function loadNote( req, res, next ) {
	var user	 = req.user ? req.user : false;
	var noteId = req.params.id;

	Note.findById( noteId, function( err, note ) {
		if( note && user ) {
			note.authorize( user, function( auth ) {
				if( auth ) {
					req.note = note;

					next();
				} else if ( note.public ) {
					req.RO = true;
					req.note = note;

					next();
				} else {
					req.flash( 'error', 'You do not have permission to access that note.' );

					res.redirect( '/' );
				}
			})
		} else if ( note && note.public ) {
			req.note = note;
			req.RO = true;

			next();
		} else if ( note && !note.public ) {
			req.session.redirect = '/note/' + note._id;
			req.flash( 'error', 'You must be logged in to view that note.' );
			res.redirect( '/login' );
		} else {
			req.flash( 'error', 'Invalid note specified!' );

			res.redirect( '/login' );
		}
	});
}

app.dynamicHelpers( {
	// flash messages from express-messages
	'messages' : require( 'express-messages' ),

	'user' : function( req, res ) {
		return req.user;
	},

	'session' : function( req, res ) {
		return req.session;
	}
});

// Routes

app.get( '/', loadUser, function( req, res ) {
	log3("get / page");

	res.render( 'index' );
});

app.get( '/schools', loadUser, function( req, res ) {
	var user = req.user;

	// mongoose's documentation on sort is extremely poor, tread carefully
	School.find( {} ).sort( 'name', '1' ).run( function( err, schools ) {
		if( schools ) {
			async.forEach(
				schools,
				function( school, callback ) {
					school.authorize( user, function( authorized ) {
						school.authorized = authorized;

						Course.find( { 'school' : school._id } ).sort( 'name', '1' ).run( function( err, courses ) {
										if( courses.length > 0 ) {
														school.courses = courses;
										} else {
														school.courses = [];
										}
										callback();
						});
					});
				},
				function( err ) {
					res.render( 'schools', { 'schools' : schools } );
				}
			);
		} else {
			res.render( 'schools', { 'schools' : [] } );
		}
	});
});

app.get( '/:id/course/new', loadUser, loadSchool, function( req, res ) {
	var school = req.school;

	if( ( ! school ) || ( ! school.authorized ) ) {
		return res.redirect( '/schools' );
	}

	res.render( 'course/new', { 'school': school } );
});

app.post( '/:id/course/new', loadUser, loadSchool, function( req, res ) {
	var school = req.school;
	var course = new Course;
	var instructorEmail = req.body.email.toLowerCase();
	var instructorName = req.body.instructorName;

	if( ( ! school ) || ( ! school.authorized ) ) {
		res.redirect( '/schools' );
	}

  if ( !instructorEmail || !instructorName ) {
    req.flash( 'error', 'Invalid parameters!' )
    return res.render( 'course/new' );
  }

	course.number				= req.body.number;
	course.name					= req.body.name;
	course.description	= req.body.description;
	course.school				= school._id;
  course.creator      = req.user._id;
  course.subject      = req.body.subject;
  course.department   = req.body.department;

	// find our instructor or invite them if necessary
  User.findOne( { 'email' : instructorEmail }, function( err, user ) {
    if ( !user ) {
      var user          = new User;

			user.name					= instructorName
      user.email        = instructorEmail;
			user.affil        = 'Instructor';
      user.school       = school.name;

      user.activated    = false;
      
			if ( ( user.email === '' ) || ( !isValidEmail( user.email ) ) ) {
				req.flash( 'error', 'Please enter a valid email' );
				return res.redirect( '/register' );
			}
      user.save(function( err ) {
        if ( err ) {
          req.flash( 'error', 'Invalid parameters!' )
          return res.render( 'course/new' );
        } else {
					var message = {
						to					: user.email,

						'subject'		: 'A non-profit open education initiative',
	
						'template'	: 'instructorInvite',
						'locals'		: {
							'course'			: course,
							'school'			: school,
							'user'				: user,
							'serverHost'	: serverHost
						}
					};

					mailer.send( message, function( err, result ) {
						if( err ) {
							console.log( 'Error inviting instructor to course!' );
						} else {
							console.log( 'Successfully invited instructor to course.' );
						}
					});

          course.instructor = user._id;
					course.save( function( err ) {
						if( err ) {
							// XXX: better validation
							req.flash( 'error', 'Invalid parameters!' );

							return res.render( 'course/new' );
						} else {
							var message = {
								to					: ADMIN_EMAIL,

								'subject'		: school.name+' has a new course: '+course.name,
					
								'template'	: 'newCourse',
								'locals'		: {
									'course'			: course,
                  'instructor'  : user,
									'user'				: req.user,
									'serverHost'	: serverHost
								}
							};

							mailer.send( message, function( err, result ) {
								if ( err ) {
									console.log( 'Error sending new course email to info@finalsclub.org' )
								} else {
									console.log( 'Successfully invited instructor to course')
								}
							})
							res.redirect( '/schools' );
						}
					});
				}
			})
		} else {
			if (user.affil === 'Instructor') {
        course.instructor = user._id;
				course.save( function( err ) {
					if( err ) {
						// XXX: better validation
						req.flash( 'error', 'Invalid parameters!' );

						return res.render( 'course/new' );
					} else {
						var message = {
							to					: ADMIN_EMAIL,

							'subject'		: school.name+' has a new course: '+course.name,
					
							'template'	: 'newCourse',
							'locals'		: {
								'course'			: course,
                'instructor'  : user,
								'user'				: req.user,
								'serverHost'	: serverHost
							}
						};

						mailer.send( message, function( err, result ) {
							if ( err ) {
								console.log( 'Error sending new course email to info@finalsclub.org' )
							} else {
								console.log( 'Successfully invited instructor to course')
							}
						})
						res.redirect( '/schools' );
					}
				});
			} else {
				req.flash( 'error', 'The existing user\'s email you entered is not an instructor' );
				res.render( 'course/new' );
			}
		}
	})
});

app.get( '/course/:id', loadUser, loadCourse, function( req, res ) {
	var userId = req.user._id;
	var course = req.course;

	// are we subscribed to this course?
	var subscribed = course.subscribed( userId );

	// pull out our lectures
	Lecture.find( { 'course' : course._id } ).sort( 'name', '1' ).run( function( err, lectures ) {
    User.findById( course.instructor, function( err, instructor ) {
      res.render( 'course/index', { 'course' : course, 'instructor': instructor, 'subscribed' : subscribed, 'lectures' : lectures } );
    })
	});
});

app.get( '/course/:id/delete', loadUser, loadCourse, function( req, res) {
	var course = req.course;
	var user = req.user;

	if ( user.admin ) {
		course.delete(function( err ) {
      if ( err ) req.flash( 'info', 'There was a problem removing course: ' + err )
      else req.flash( 'info', 'Successfully removed course' )
      res.redirect( '/schools' );
    });
	} else {
		req.flash( 'error', 'You don\'t have permission to do that' )
		res.redirect( '/schools' );
	}
})

// subscribe and unsubscribe to course networks
app.get( '/course/:id/subscribe', loadUser, loadCourse, function( req, res ) {
	var course = req.course;
	var userId = req.user._id;

	course.subscribe( userId, function( err ) {
		if( err ) {
			req.flash( 'error', 'Error subscribing to course!' );
		}

		res.redirect( '/course/' + course._id );
	});
});

app.get( '/course/:id/unsubscribe', loadUser, loadCourse, function( req, res ) {
	var course = req.course;
	var userId = req.user._id;

	course.unsubscribe( userId, function( err ) {
		if( err ) {
			req.flash( 'error', 'Error unsubscribing from course!' );
		}

		res.redirect( '/course/' + course._id );
	});
});

app.get( '/course/:id/lecture/new', loadUser, loadCourse, function( req, res ) {
	var courseId	= req.params.id;
	var course		= req.course;
	var lecture		= {};

	if( ( ! course ) || ( ! course.authorized ) ) {
		return res.redirect( '/course/' + courseId );
	}

	res.render( 'lecture/new', { 'lecture' : lecture } );
});

app.post( '/course/:id/lecture/new', loadUser, loadCourse, function( req, res ) {
	var courseId	= req.params.id;
	var course		= req.course;
	var lecture		= new Lecture;

	if( ( ! course ) || ( ! course.authorized ) ) {
		res.redirect( '/course/' + courseId );

		return;
	}

	lecture.name		= req.body.name;
	lecture.date		= req.body.date;
	lecture.course	= course._id;
  lecture.creator = req.user._id;

	lecture.save( function( err ) {
		if( err ) {
			// XXX: better validation
			req.flash( 'error', 'Invalid parameters!' );

			res.render( 'lecture/new', { 'lecture' : lecture } );
		} else {
			res.redirect( '/course/' + course._id );
		}
	});
});

// lecture

app.get( '/lecture/:id', loadUser, loadLecture, function( req, res ) {
	var lecture	= req.lecture;

	// grab the associated course (this should be done with DBRefs eventually )
	Course.findById( lecture.course, function( err, course ) {
		if( course ) {
      User.findById( course.instructor, function( err, instructor ) {
        // pull out our notes
        Note.find( { 'lecture' : lecture._id } ).sort( 'name', '1' ).run( function( err, notes ) {
          if ( !req.user.loggedIn || !req.lecture.authorized ) {
            notes = notes.filter(function( note ) {
              if ( note.public ) return note;
            })
          }
          res.render( 'lecture/index', {
            'lecture'			: lecture,
            'course'			: course,
            'instructor'  : instructor,
            'notes'				: notes,
            'counts'			: counts,

            'javascripts'	: [ 'counts.js' ]
          });
        });
      })
		} else {
			// with DBRefs we will be able to reassign orphaned courses/lecture/pads

			req.flash( 'error', 'That lecture is orphaned!' );

			res.redirect( '/' );
		}
	});
});

app.get( '/lecture/:id/notes/new', loadUser, loadLecture, function( req, res ) {
	var lectureId	= req.params.id;
	var lecture		= req.lecture;
	var note			= {};

	if( ( ! lecture ) || ( ! lecture.authorized ) ) {
		res.redirect( '/lecture/' + lectureId );

		return;
	}

	res.render( 'notes/new', { 'note' : note } );
});

app.post( '/lecture/:id/notes/new', loadUser, loadLecture, function( req, res ) {
	var lectureId	= req.params.id;
	var lecture		= req.lecture;

	if( ( ! lecture ) || ( ! lecture.authorized ) ) {
		res.redirect( '/lecture/' + lectureId );

		return;
	}

	var note		= new Note;

	note.name			= req.body.name;
	note.date			= req.body.date;
	note.lecture	= lecture._id;
	note.public		= req.body.private ? false : true;
  note.creator  = req.user._id;

	note.save( function( err ) {
		if( err ) {
			// XXX: better validation
			req.flash( 'error', 'Invalid parameters!' );

			res.render( 'notes/new', { 'note' : note } );
		} else {
			res.redirect( '/lecture/' + lecture._id );
		}
	});
});

// notes

app.get( '/note/:id', loadUser, loadNote, function( req, res ) {
	var note = req.note;
	var roID = note.roID || false;

	var lectureId = note.lecture;

	if ( req.session.visited ) {
			if ( req.session.visited.indexOf( note._id.toString() ) == -1 ) {
					req.session.visited.push( note._id );
					note.addVisit();
			}
	} else {
		req.session.visited = [];
		req.session.visited.push( note._id );
		note.addVisit();
	}

	if (roID) {
		processReq();
	} else {
		db.open('mongodb://' + app.set( 'dbHost' ) + '/etherpad/etherpad', function( err, epl ) {
			epl.findOne( { key: 'pad2readonly:' + note._id }, function(err, record) {
				if ( record ) {
					roID = record.value.replace(/"/g, '');
				} else {
					roID = false;
				}
				processReq();
			})
		})
	}

	function processReq() {
		Lecture.findById( lectureId, function( err, lecture ) {
			if( ! lecture ) {
				req.flash( 'error', 'That notes page is orphaned!' );

				res.redirect( '/' );
			}
			Note.find( { 'lecture' : lecture._id }, function( err, otherNotes ) {
				if( !req.RO ) {
					// XXX User is logged in and sees full notepad

					res.render( 'notes/index', {
						'layout'			: 'noteLayout',
						'host'				: serverHost,
						'note'				: note,
						'lecture'			: lecture,
						'otherNotes'	: otherNotes,
						'RO'					: false,
						'roID'				: roID,
						'stylesheets' : [ 'dropdown.css', 'fc2.css' ],
						'javascripts'	: [ 'dropdown.js', 'counts.js', 'backchannel.js', 'jquery.tmpl.min.js' ]
					});
				} else {
					// XXX User is not logged in and sees notepad that is public
					res.render( 'notes/public', {
						'layout'			: 'noteLayout',
						'host'				: serverHost,
						'note'				: note,
						'otherNotes'	: otherNotes,
						'roID'				: roID,
						'lecture'			: lecture,
						'stylesheets' : [ 'dropdown.css', 'fc2.css' ],
						'javascripts'	: [ 'dropdown.js', 'counts.js', 'backchannel.js', 'jquery.tmpl.min.js' ]
					});
				}
			});
		});
	}
});

// static pages

app.get( '/about', loadUser, function( req, res ) {
  res.redirect( 'http://blog.finalsclub.org/about.html' );
  //res.render( 'static/about' );
});

app.get( '/press', loadUser, function( req, res ) {
  res.render( 'static/press' );
});

app.get( '/conduct', loadUser, function( req, res ) {
  res.render( 'static/conduct' );
});

app.get( '/legal', loadUser, function( req, res ) {
  res.redirect( 'http://blog.finalsclub.org/legal.html' );
  //res.render( 'static/legal' );
});

app.get( '/contact', loadUser, function( req, res ) {
  res.redirect( 'http://blog.finalsclub.org/contact.html' );
	//res.render( 'static/contact' );
});

app.get( '/privacy', loadUser, function( req, res ) {
	res.render( 'static/privacy' );
});

// authentication

app.get( '/login', function( req, res ) {
	log3("get login page")

	res.render( 'login' );	
});

app.post( '/login', function( req, res ) {
	var email		 = req.body.email;
	var password = req.body.password;
	log3("post login ...")

	User.findOne( { 'email' : email.toLowerCase() }, function( err, user ) {
		log3(err) 
		log3(user) 

		if( user ) {
			if( ! user.activated ) {
				// (undocumented) markdown-esque link functionality in req.flash
				req.flash( 'error', 'This account isn\'t activated. Check your inbox or [click here](/resendActivation) to resend the activation email.' );

				req.session.activateCode = user._id;

				res.render( 'login' );
			} else {
				if( user.authenticate( password ) ) {
					log3("pass ok") 

					var sid = req.sessionID;

					user.session = sid;

					user.save( function() {
						var redirect = req.session.redirect;
	
						// login complete, remember the user's email for next time
						req.session.email = email;

						// alert the successful login
						req.flash( 'info', 'Successfully logged in!' );

						// redirect to profile if we don't have a stashed request
						res.redirect( redirect || '/profile' );
					});
				} else {
					req.flash( 'error', 'Invalid login!' );

					res.render( 'login' );
				}
			}
		} else {
			log3("bad login")
			req.flash( 'error', 'Invalid login!' );

			res.render( 'login' );
		}
	});
});

app.get( '/resetpw', function( req, res ) {
	log3("get resetpw page");
	res.render( 'resetpw' );
});
app.get( '/resetpw/:id', function( req, res ) {
	var resetPassCode = req.params.id
	res.render( 'resetpw', { 'verify': true, 'resetPassCode' : resetPassCode } );
});

app.post( '/resetpw', function( req, res ) {
	log3("post resetpw");
	var email = req.body.email


	User.findOne( { 'email' : email.toLowerCase() }, function( err, user ) {
		if( user ) {

			var resetPassCode = hat(64);
			user.setResetPassCode(resetPassCode);

			var resetPassUrl = 'http://' + serverHost + ((app.address().port != 80)? ':'+app.address().port: '') + '/resetpw/' + resetPassCode;

			user.save( function( err ) {
				log3('save '+user.email);

				var message = {
					'to'				: user.email,

					'subject'		: 'Your FinalsClub.org Password has been Reset!',

					'template'	: 'userPasswordReset',
						'locals'		: {
							'resetPassCode'		: resetPassCode,
							'resetPassUrl'		: resetPassUrl
					}
				};

				mailer.send( message, function( err, result ) {
					if( err ) {
						// XXX: Add route to resend this email

						console.log( 'Error sending user password reset email!' );
					} else {
						console.log( 'Successfully sent user password reset email.' );
					}

				}); 

				res.render( 'resetpw-success', { 'email' : email } );
			});			
		} else {
			res.render( 'resetpw-error', { 'email' : email } );
		}
	});
});
app.post( '/resetpw/:id', function( req, res ) {
	log3("post resetpw.code");
	var resetPassCode = req.params.id
	var email = req.body.email
	var pass1 = req.body.pass1
	var pass2 = req.body.pass2

	User.findOne( { 'email' : email.toLowerCase() }, function( err, user ) {
		var valid = false;
		if( user ) {
			var valid = user.resetPassword(resetPassCode, pass1, pass2);
			if (valid) {
				user.save( function( err ) {
					res.render( 'resetpw-success', { 'verify' : true, 'email' : email, 'resetPassCode' : resetPassCode } );		
				});			
			}
		} 

		if (!valid) {
			res.render( 'resetpw-error', { 'verify' : true, 'email' : email } );
		}
	});
});

app.get( '/register', function( req, res ) {
	log3("get reg page");

	School.find( {} ).sort( 'name', '1' ).run( function( err, schools ) {
		res.render( 'register', { 'schools' : schools } );
	})
});

app.post( '/register', function( req, res ) {
	var sid = req.sessionId;

	var user = new User;
  
	user.email        = req.body.email.toLowerCase();
	user.password     = req.body.password;
	user.session      = sid;
	user.school				= req.body.school === 'Other' ? req.body.otherSchool : req.body.school;
  user.name         = req.body.name;
  user.affil        = req.body.affil;
  user.activated    = false;

	if ( ( user.email === '' ) || ( !isValidEmail( user.email ) ) ) {
		req.flash( 'error', 'Please enter a valid email' );
		return res.redirect( '/register' );
	}

	if ( req.body.password.length < 6 ) {
		req.flash( 'error', 'Please enter a password longer than eight characters' );
		return res.redirect( '/register' );
	}

	var hostname = user.email.split( '@' ).pop();

	if( /^(finalsclub.org|sleepless.com)$/.test( hostname ) ) {
		user.admin = true;
	}

	user.save( function( err ) {
		if ( err ) {
			if( /dup key/.test( err.message ) ) {
				// attempting to register an existing address
					User.findOne({ 'email' : user.email }, function(err, result ) {
						if (result.activated) {
							req.flash( 'error', 'There is already someone registered with this email, if this is in error contact info@finalsclub.org for help' )
							return res.redirect( '/register' )
						} else {
							req.flash( 'error', 'There is already someone registered with this email, if this is you, please check your email for the activation code' )
							return res.redirect( '/resendActivation' )
						}
					});
			} else {
				req.flash( 'error', 'An error occurred during registration.' );

				return res.redirect( '/register' );
			}
		} else {
			// send user activation email
			sendUserActivation( user );

			School.findOne( { 'hostnames' : hostname }, function( err, school ) {
				if( school ) {
          sendUserWelcome( user, true );
					log3('school recognized '+school.name);
					if (!school.users) school.users = [];
					school.users.push( user._id );

					school.save( function( err ) {
						log3('school.save() done');
						req.flash( 'info', 'You have automatically been added to the ' + school.name + ' network. Please check your email for the activation link' );
						res.redirect( '/' );
					});
					var message = {
						'to'       : ADMIN_EMAIL,

						'subject'  : 'FC User Registration : User added to ' + school.name,

						'template' : 'userSchool',
						'locals'   : {
							'user'   : user
						}
					}
				} else {
          sendUserWelcome( user, false );
					req.flash( 'info', 'Your account has been created, please check your email for the activation link' )
					res.redirect( '/' );
					var message = {
						'to'       : ADMIN_EMAIL,

						'subject'  : 'FC User Registration : Email did not match any schools',

						'template' : 'userNoSchool',
						'locals'   : {
							'user'   : user
						}
					}
				}
					mailer.send( message, function( err, result ) {
						if ( err ) {
					
							console.log( 'Error sending user has no school email to admin\nError Message: '+err.Message );
						} else {
							console.log( 'Successfully sent user has no school email to admin.' );
						}
					})

			});
		}

	});
});

app.get( '/resendActivation', function( req, res ) {
	var activateCode = req.session.activateCode;

	User.findById( activateCode, function( err, user ) {
		if( ( ! user ) || ( user.activated ) ) {
			res.redirect( '/' );
		} else {
			sendUserActivation( user );

			req.flash( 'info', 'Your activation code has been resent.' );

			res.redirect( '/login' );
		}
	});
});

app.get( '/activate/:code', function( req, res ) {
	var code = req.params.code;

	// could break this out into a middleware
	if( ! code ) {
		res.redirect( '/' );
	}

	User.findById( code, function( err, user ) {
		if( err || ! user ) {
			req.flash( 'error', 'Invalid activation code!' );

			res.redirect( '/' );
		} else {
			user.activated = true;

			// regenerate our session and log in as the new user
			req.session.regenerate( function() {
				user.session = req.sessionID;

				user.save( function( err ) {
					if( err ) {
						req.flash( 'error', 'Unable to activate account.' );

						res.redirect( '/' );
					} else {
						req.flash( 'info', 'Account successfully activated. Please complete your profile.' );

						res.redirect( '/profile' );
					}
				});
			});
		}
	});
});

app.get( '/logout', function( req, res ) {
	var sid = req.sessionID;

	User.findOne( { 'session' : sid }, function( err, user ) {
		if( user ) {
			user.session = '';

			user.save( function( err ) {
				res.redirect( '/' );
			});
		} else {
			res.redirect( '/' );
		}
	});
});

app.get( '/profile', loadUser, loggedIn, function( req, res ) {
	var user = req.user;
	
	res.render( 'profile/index', { 'user' : user } );
});

app.post( '/profile', loadUser, loggedIn, function( req, res ) {
	var user		= req.user;
	var fields	= req.body;

	var error				= false;
	var wasComplete	= user.isComplete;

	if( ! fields.name ) {
		req.flash( 'error', 'Please enter a valid name!' );

		error = true;
	} else {
		user.name = fields.name;
	}

	if( [ 'Student', 'Teachers Assistant' ].indexOf( fields.affiliation ) == -1 ) {
		req.flash( 'error', 'Please select a valid affiliation!' );

		error = true;
	} else {
		user.affil = fields.affiliation;
	}

	if( fields.existingPassword || fields.newPassword || fields.newPasswordConfirm ) {
		// changing password
		if( ( ! user.hashed ) || user.authenticate( fields.existingPassword ) ) {
			if( fields.newPassword === fields.newPasswordConfirm ) {
				// test password strength?

				user.password = fields.newPassword;
			} else {
				req.flash( 'error', 'Mismatch in new password!' );

				error = true;
			}
		} else {
			req.flash( 'error', 'Please supply your existing password.' );

			error = true;
		}
	}

	user.major		= fields.major;
	user.bio			= fields.bio;

	user.showName	= ( fields.showName ? true : false );

	if( ! error ) {
		user.save( function( err ) {
			if( err ) {
				req.flash( 'error', 'Unable to save user profile!' );
			} else {
				if( ( user.isComplete ) && ( ! wasComplete ) ) {
					req.flash( 'info', 'Your account is now fully activated. Thank you for joining FinalsClub!' );

					res.redirect( '/' );
				} else {
					res.render( 'info', 'Your profile was successfully updated!' );

					res.render( 'profile/index', { 'user' : user } );
				}
			}
		});
	} else {
		res.render( 'profile/index', { 'user' : user } );
	}
});


// Old Notes

function loadSubject( req, res, next ) {
  if( url.parse( req.url ).pathname.match(/subject/) ) {
    ArchivedSubject.findOne({id: req.params.id }, function(err, subject) {
      if ( err ) {
        req.flash( 'error', 'Subject with this ID does not exist' )
        res.redirect( '/archive' );
      } else {
        req.subject = subject;
        next()
      }
    })
  } else {
    next()
  } 
}

function loadOldCourse( req, res, next ) {
  if( url.parse( req.url ).pathname.match(/course/) ) {
    ArchivedCourse.findOne({id: req.params.id }, function(err, course) {
      if ( err ) {
        req.flash( 'error', 'Course with this ID does not exist' )
        res.redirect( '/archive' );
      } else {
        req.course = course;
        next()
      }
    })
  } else {
    next()
  } 
}

var featuredCourses = [
	{name: 'The Human Mind', 'id': 1563},
	{name: 'Justice', 'id': 797},
	{name: 'Protest Literature', 'id': 1681},
	{name: 'Animal Cognition', 'id': 681},
	{name: 'Positive Psychology', 'id': 1793},
	{name: 'Social Psychology', 'id': 660},
	{name: 'The Book from Gutenberg to the Internet', 'id': 1439},
	{name: 'Cyberspace in Court', 'id': 1446},
	{name: 'Nazi Cinema', 'id': 2586},
	{name: 'Media and the American Mind', 'id': 2583},
	{name: 'Social Thought in Modern America', 'id': 2585},
	{name: 'Major British Writers II', 'id': 869},
	{name: 'Civil Procedure', 'id': 2589},
	{name: 'Evidence', 'id': 2590},
	{name: 'Management of Industrial and Nonprofit Organizations', 'id': 2591},
];

app.get( '/learn', loadUser, function( req, res ) {
	res.render( 'archive/learn', { 'courses' : featuredCourses } );
})

app.get( '/learn/random', loadUser, function( req, res ) {
	res.redirect( '/archive/course/'+ featuredCourses[Math.floor(Math.random()*featuredCourses.length)].id);
})

app.get( '/archive', loadUser, function( req, res ) {
  ArchivedSubject.find({}).sort( 'name', '1' ).run( function( err, subjects ) {
    if ( err ) {
      req.flash( 'error', 'There was a problem gathering the archived courses, please try again later.' );
      res.redirect( '/' );
    } else {
      res.render( 'archive/index', { 'subjects' : subjects } );
    }
  })
})

app.get( '/archive/subject/:id', loadUser, loadSubject, function( req, res ) {
  ArchivedCourse.find({subject_id: req.params.id}).sort('name', '1').run(function(err, courses) {
    if ( err ) {
      req.flash( 'error', 'There are no archived courses' );
      res.redirect( '/' );
    } else {
      res.render( 'archive/courses', { 'courses' : courses, 'subject': req.subject } );
    }
  })
})

app.get( '/archive/course/:id', loadUser, loadOldCourse, function( req, res ) {
  ArchivedNote.find({course_id: req.params.id}).sort('name', '1').run(function(err, notes) {
    if ( err ) {
      req.flash( 'error', 'There are no notes in this course' );
      res.redirect( '/archive' );
    } else {
      res.render( 'archive/notes', { 'notes' : notes, 'course' : req.course } );
    }
  })
})

app.get( '/archive/note/:id', loadUser, function( req, res ) {
  ArchivedNote.findById(req.params.id, function(err, note) {
    if ( err ) {
      req.flash( 'error', 'This is not a valid id for a note' );
      res.redirect( '/archive' );
    } else {
      ArchivedCourse.findOne({id: note.course_id}, function(err, course) {
        if ( err ) {
          req.flash( 'error', 'There is no course for this note' )
          res.redirect( '/archive' )
        } else {
          res.render( 'archive/note', { 'layout' : 'notesLayout', 'note' : note, 'course': course } );
        }
      })
    }
  })
})

// socket.io server

var io = require( 'socket.io' ).listen( app );

var Post = mongoose.model( 'Post' );

io.set('authorization', function ( handshake, next ) {
	var rawCookie = handshake.headers.cookie;
	if (rawCookie) {
		handshake.cookie = parseCookie(rawCookie);
		handshake.sid = handshake.cookie['connect.sid'];

		if ( handshake.sid ) {
			app.set( 'sessionStore' ).get( handshake.sid, function( err, session ) {
				if( err ) {
					handshake.user = false;
					return next(null, true);
				} else {
					// bake a new session object for full r/w
					handshake.session = new Session( handshake, session );

					User.findOne( { session : handshake.sid }, function( err, user ) {
						if( user ) {
							handshake.user = user;
							return next(null, true);
						} else {
							handshake.user = false;
							return next(null, true);
						}
					});
				}
			})
		}
	} else {
		data.user = false;
		return next(null, true);
	}
});


var backchannel = io
	.of( '/backchannel' )
	.on( 'connection', function( socket ) {

		socket.on('subscribe', function(lecture, cb) {
			socket.join(lecture);
			Post.find({'lecture': lecture}, function(err, posts) {
				if (socket.handshake.user) {
					cb(posts);
				} else {
					var posts = posts.filter(
						function(post) {
						if (post.public)
							return post;
					}
					)
					cb(posts)
				}
			});
		});

		socket.on('post', function(res) {
			var post = new Post;
			var _post = res.post;
			var lecture = res.lecture;
			post.lecture = lecture;
			if ( _post.anonymous ) {
				post.userid		= 0;
				post.userName	= 'Anonymous';
				post.userAffil = 'N/A';
			} else {
				post.userName = _post.userName;
				post.userAffil = _post.userAffil;
			}

			post.public = _post.public;
			post.date = new Date();
			post.body = _post.body;
			post.votes = [];
			post.reports = [];
			post.save(function(err) {
				if (err) {
					// XXX some error handling
					console.log(err);
				} else {
					if (post.public) {
						backchannel.in(lecture).emit('post', post);
					} else {
						privateEmit(lecture, 'post', post);
					}
				}
			});
		});

		socket.on('vote', function(res) {
			var vote = res.vote;
			var lecture = res.lecture;
			Post.findById(vote.parentid, function( err, post ) {
				if (!err) {
					if (post.votes.indexOf(vote.userid) == -1) {
						post.votes.push(vote.userid);
						post.save(function(err) {
							if (err) {
								// XXX error handling
							} else {
								if (post.public) {
									backchannel.in(lecture).emit('vote', vote);
								} else {
									privteEmit(lecture, 'vote', vote);
								}
							}
						});
					}
				}
			})
		});

		socket.on('report', function(res) {
			var report = res.report;
			var lecture = res.lecture;
			Post.findById(report.parentid, function( err, post ){
				if (!err) {
					if (post.reports.indexOf(report.userid) == -1) {
						post.reports.push(report.userid);
						post.save(function(err) {
							if (err) {
								// XXX error handling
							} else {
								if (post.public) {
									backchannel.in(lecture).emit('report', report);
								} else {
									privateEmit(lecture, 'report', report);
								}
							}
						});
					}
				}
			})
		});

		socket.on('comment', function(res) {
			var comment = res.comment;
			var lecture = res.lecture;
			console.log('anon', comment.anonymous);
			if ( comment.anonymous ) {
				comment.userid		= 0;
				comment.userName	= 'Anonymous';
				comment.userAffil = 'N/A';
			}
			Post.findById(comment.parentid, function( err, post ) {
				if (!err) {
					post.comments.push(comment);
					post.date = new Date();
					post.save(function(err) {
						if (err) {
							console.log(err);
						} else {
							if (post.public) {
								backchannel.in(lecture).emit('comment', comment);
							} else {
								privateEmit(lecture, 'comment', comment);
							}
						}
					})
				}
			})
		});

		function privateEmit(lecture, event, data) {
			backchannel.clients(lecture).forEach(function(socket) {
				if (socket.handshake.user)
					socket.emit(event, data);
			})
		}

		socket.on('disconnect', function() {
			//delete clients[socket.id];
		});
	});


var counters = {};

var counts = io
.of( '/counts' )
.on( 'connection', function( socket ) {
	// pull out user/session information etc.
	var handshake = socket.handshake;
	var userID		= handshake.user._id;

	var watched		= [];
	var noteID		= null;

	var timer			= null;

	socket.on( 'join', function( note ) {
		if (handshake.user === false) {
			noteID			= note;
			// XXX: replace by addToSet (once it's implemented in mongoose)
			Note.findById( noteID, function( err, note ) {
				if( note ) {
					if( note.collaborators.indexOf( userID ) == -1 ) {
						note.collaborators.push( userID );
						note.save();
					}
				}
			});
		}
	});

	socket.on( 'watch', function( l ) {
		var sendCounts = function() {
			var send = {};

			Note.find( { '_id' : { '$in' : watched } }, function( err, notes ) {
				async.forEach(
					notes,
					function( note, callback ) {
						var id		= note._id;
						var count	= note.collaborators.length;

						send[ id ] = count;

						callback();
					}, function() {
						socket.emit( 'counts', send );

						timer = setTimeout( sendCounts, 5000 );
					}
				);
			});
		}

		Note.find( { 'lecture' : l }, [ '_id' ], function( err, notes ) {
			notes.forEach( function( note ) {
				watched.push( note._id );
			});
		});

		sendCounts();
	});

	socket.on( 'disconnect', function() {
		clearTimeout( timer );

		if (handshake.user === false) {
			// XXX: replace with $pull once it's available
			if( noteID ) {
				Note.findById( noteID, function( err, note ) {
					if( note ) {
						var index = note.collaborators.indexOf( userID );

						if( index != -1 ) {
							note.collaborators.splice( index, 1 );
						}

						note.save();
					}
				});
			}
		}
	});
});

// Exception Catch-All

process.on('uncaughtException', function (e) {
	console.log("!!!!!! UNCAUGHT EXCEPTION\n" + e.stack);
});


// Launch

mongoose.connect( app.set( 'dbUri' ) );
mongoose.connection.db.serverConfig.connection.autoReconnect = true

var mailer = new Mailer( app.set('awsAccessKey'), app.set('awsSecretKey') );

app.listen( serverPort, function() {
	console.log( "Express server listening on port %d in %s mode", app.address().port, app.settings.env );

	// if run as root, downgrade to the owner of this file
	if (process.getuid() === 0) {
		require('fs').stat(__filename, function(err, stats) {
			if (err) { return console.log(err); }
			process.setuid(stats.uid);
		});
	}
});

function isValidEmail(email) {
	var re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	return email.match(re);
}
