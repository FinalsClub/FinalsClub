/* vim: set ts=2: */

// DEPENDENCIES

var crypto = require( 'crypto' );

var mongoose	= require( 'mongoose' );

var Schema		= mongoose.Schema;
var ObjectId	= mongoose.SchemaTypes.ObjectId;

// SUPPORT FUNCTIONS

function salt() {
	return Math.round( ( new Date().valueOf() * Math.random() ) ).toString();
}

// MODELS

// user

var UserSchema = new Schema( {
	email						: { type : String, require: true, index : { unique : true } },
	school					: String,
	name						: String,
	affil						: String,
  created         : { type : Date, default : Date.now },
	hashed					: String,
	activated				: Boolean,
	activateCode		: String,
	resetPassCode		: String,
	resetPassDate		: Date,
	salt						: String,
	session					: String,
	showName				: { 'type' : Boolean, 'default' : true },
	admin						: { 'type' : Boolean, 'default' : false }
});

UserSchema.virtual( 'sanitized' ).get(function() {
  var user = {
    email: this.email,
    name: this.name,
    affil: this.affil,
    showName: this.showName,
    admin: this.admin
  }

  return user;
});

UserSchema.virtual( 'displayName' )
	.get( function() {
		if( this.showName ) {
			return this.name;
		} else {
			return this.email;
		}
	});

UserSchema.virtual( 'password' )
	.set( function( password ) {
		this.salt				= salt();
		this.hashed			= this.encrypt( password );
	});

UserSchema.virtual( 'isComplete' )
	.get( function() {
		// build on this as the schema develops

		return ( this.name && this.affil && this.hashed );
	});

UserSchema.method( 'encrypt', function( password ) {
	var hmac = crypto.createHmac( 'sha1', this.salt );

	return hmac.update( password ).digest( 'hex' );
});

UserSchema.method( 'authenticate', function( plaintext ) {
	return ( this.encrypt( plaintext ) === this.hashed );
});

UserSchema.method('genRandomPassword', function () {
	// this function generates the random password, it does not keep or save it.
	var plaintext = '';

	var len = 8;
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		plaintext += charSet.substring(randomPoz, randomPoz + 1);
	}

	return plaintext;
});

UserSchema.method( 'setResetPassCode', function ( code ) {
	this.resetPassCode = code;
	this.resetPassDate = new Date();
	return this.resetPassCode;
});

UserSchema.method( 'canResetPassword', function ( code ) {
	// ensure the passCode is valid, matches and the date has not yet expired, lets say 2 weeks for good measure.
	var value = false;

	var expDate = new Date();
	expDate.setDate(expDate.getDate() - 14);

	// we have a valid code and date
	if (this.resetPassCode != null && this.resetPassDate != null && this.resetPassDate >= expDate && this.resetPassCode == code) {
		value = true;
	}

	return value;
});

UserSchema.method( 'resetPassword', function ( code, newPass1,  newPass2) {
	// ensure the date has not expired, lets say 2 weeks for good measure.

	var success = false;
	if (this.canResetPassword(code) && newPass1 != null && newPass1.length > 0 && newPass1 == newPass2) {
		this.password = newPass1;
		this.resetPassCode = null;
		this.resetPassDate = null;
		success = true;
	}

	return success;
});

var User = mongoose.model( 'User', UserSchema );

// schools

var SchoolSchema = new Schema( {
	name				: { type : String, required : true },
	description	: String,
	url					: String,

  created       : { type : Date, default : Date.now },
  hostnames     : Array,

  users         : Array,

  slug          : String
});
// slug is the url version of a school

SchoolSchema.virtual( 'sanitized' ).get(function() {
  var school = {
    _id: this._id,
    name: this.name,
    description: this.description,
    url: this.url,
    slug: this.slug
  }

  return school;
})

SchoolSchema.method( 'authorize', function( user, cb ) {
	return cb(user.admin || ( this.users.indexOf( user._id ) !== -1 ));
});

var School = mongoose.model( 'School', SchoolSchema );

// harvardcourses

var HarvardCourses = new Schema( {
    cat_num         : Number,   // Catalog numb, unique_togther w/ term
    term            : String,   // FALL or SPRING
    bracketed       : Boolean,
    field           : String,   // TODO: Add docs
    number          : Number,   // string, int, float, intStringFloat
    title           : String,
    faculty         : String,   // hash fk to faculty table
    description     : String,
    prerequisites   : String,
    notes           : String,
    meetings        : String,   // TODO: try to auto parse this
    building        : String,   // FIXME: Most == '', this is why we have to update
    room            : String
});

HarvardCourses.virtual( 'sanitized' ).get(function() {
    var hcourse = {
        _id     : this._id,
        title   : this.name,
        field   : this.field,
        number  : this.number,
        desc    : this.description,
        meetings: this.meetings,
        building: this.building,
        room    : this.room,
        faculty : this.faculty
        }
    return hcourse
})

// courses

var CourseSchema = new Schema( {
	name				: { type : String, required : true },
	number			: String,
	description	: String,
  instructor  : ObjectId,
  subject     : String,
  department  : String,
	// courses are tied to one school
	school			: ObjectId,

	// XXX: room for additional resources
  created     : { type : Date, default : Date.now },
  creator     : ObjectId,
  deleted     : Boolean,

	// many users may subscribe to a course
	users				: Array
});

CourseSchema.virtual( 'sanitized' ).get(function() {
  var course = {
    _id: this._id,
    name: this.name,
    number: this.number || 'None',
    description: this.description || 'None',
    subject: this.subject || 'None',
    department: this.department || 'None'
  }

  return course;
});

CourseSchema.virtual( 'displayName' )
	.get( function() {
		if( this.number ) {
			return this.number + ': ' + this.name;
		} else {
			return this.name;
		}
	});

CourseSchema.method( 'authorize', function( user, cb ) {
	School.findById( this.school, function( err, school ) {
		if ( school ) {
			school.authorize( user, function( result ) {
							return cb( result );
			})
		}
	});
});

CourseSchema.method( 'subscribed', function( user ) {
	return ( this.users.indexOf( user ) > -1 ) ;
});

CourseSchema.method( 'subscribe', function( user, callback ) {
	var id = this._id;

	// mongoose issue #404
	Course.collection.update( { '_id' : id }, { '$addToSet' : { 'users' : user } }, function( err ) {
		callback( err );
	});
});

CourseSchema.method( 'unsubscribe', function( user, callback ) {
	var id = this._id;

	// mongoose issue #404
	Course.collection.update( { '_id' : id }, { '$pull' : { 'users' : user } }, function( err ) {
		callback( err );
	});
});

CourseSchema.method( 'delete', function( callback ) {
  var id = this._id;

  Course.collection.update( { '_id' : id }, { '$set' : { 'deleted' : true } }, function( err ) {
    if (callback) callback( err );
    Lecture.find( { course: id }, function( err, lectures) {
      if (lectures.length > 0) {
        lectures.forEach(function(lecture) {
          lecture.delete();
        })
      }
    })
  })
});

var Course = mongoose.model( 'Course', CourseSchema );

// lectures

var LectureSchema	= new Schema( {
	name					: { type : String, required : true },
	date					: { type : Date, default: Date.now },
	live					: Boolean,
  creator       : ObjectId,
  deleted       : Boolean,

	course				: ObjectId
});

LectureSchema.virtual( 'sanitized' ).get(function() {
  var lecture = {
    _id: this._id,
    name: this.name,
    date: this.date,
    live: this.live
  }

  return lecture;
})

LectureSchema.method( 'authorize', function( user, cb ) {
	Course.findById( this.course, function( err, course ) {
		if (course) {
			course.authorize( user, function( res ) {
				return cb( res );
			})
		} else {
		 return cb( false );
		}
	});
});

LectureSchema.method( 'delete', function( callback ) {
  var id = this._id;

  Lecture.collection.update( { '_id' : id }, { '$set' : { 'deleted' : true } }, function( err ) {
    if (callback) callback( err );
    Note.find( { lecture : id }, function(err, notes) {
      notes.forEach(function(note) {
        note.delete();
      })
    })
    Post.find( { lecture : id }, function(err, posts) {
      posts.forEach(function(post) {
        post.delete();
      })
    })
  })
});

var Lecture = mongoose.model( 'Lecture', LectureSchema );

// notes

var NoteSchema = new Schema( {
	name					: { type : String, required : true },
	path					: String,
  public        : Boolean,
  roID          : String,
	visits				: Number,
  created         : { type : Date, default : Date.now },
  creator       : ObjectId,
  deleted       : Boolean,

	lecture				: ObjectId,

	collaborators : [String]
});

NoteSchema.virtual( 'sanitized').get(function() {
  var note = {
    _id: this._id,
    name: this.name,
    path: this.path,
    public: this.public,
    roID: this.roID,
    visits: this.visits
  }

  return note;
});

NoteSchema.method( 'authorize', function( user, cb ) {
	Lecture.findById( this.lecture, function( err, lecture ) {
		if (lecture) {
			lecture.authorize( user, function( res ) {
				return cb( res );
			})
		} else {
			return cb( false );
		}
	});
});

NoteSchema.method( 'addVisit', function() {
	var id = this._id;

	Note.collection.update( { '_id' : id }, { '$inc' : { 'visits' : 1 } } );
});

NoteSchema.method( 'delete', function( callback ) {
  var id = this._id;

  Note.collection.update( { '_id' : id }, { '$set' : { 'deleted' : true } }, function( err ) {
    if (callback) callback( err );
  })
});

var Note = mongoose.model( 'Note', NoteSchema );

// comments

var PostSchema = new Schema({
  date      : { type : Date, default : Date.now },
  body      : String,
  votes     : [String],
  reports   : [String],
  public    : Boolean,

  userid    : String, // ObjectId,
  userName  : String,
  userAffil : String,

  comments   : Array,

  lecture   : String, // ObjectId
  deleted   : Boolean
})

PostSchema.method( 'delete', function( callback ) {
  var id = this._id;

  Post.collection.update( { '_id' : id }, { '$set' : { 'deleted' : true } }, function( err ) {
    if (callback) callback( err );
  })
});

mongoose.model( 'Post', PostSchema );

var ArchivedCourse = new Schema({
  id: Number,
  instructor: String,
  section: String,
  name: String,
  description: String,
  subject_id: Number
})

mongoose.model( 'ArchivedCourse', ArchivedCourse )

var ArchivedNote = new Schema({
  course_id: Number,
  topic: String,
  text: String
})

ArchivedNote.virtual( 'sanitized' ).get(function() {
  var note = {
    _id: this._id,
    topic: this.topic === '' ? (this.text.replace(/(<(.|\n)*?>)|[\r\n\t]*/g, '')).substr(0, 15) + '...' : this.topic
  }
  return note;
})

mongoose.model( 'ArchivedNote', ArchivedNote )

var ArchivedSubject = new Schema({
  id: Number,
  name: String
})

mongoose.model( 'ArchivedSubject', ArchivedSubject )

module.exports.mongoose = mongoose;
