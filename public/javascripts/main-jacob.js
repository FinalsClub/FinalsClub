
/*

This is the core logic for the main page.
It implements most page transitions by showing and hiding DIV elements
in the page with javascript+jquery

*/


/* Convert a JSON string to an object, or null if unparseable */
function j2o(json) { try { return JSON.parse(json); } catch(e) { return null; } }

/* Convert an object to a JSON string (just easier to type than "JSON.stringify" */
function o2j(obj) { return JSON.stringify(obj); }



function showHome(cb) {
	cb("home");
}



// go to the page that lists the schools
function showSchools(response, cb) {

  var path = window.location.pathname;

	ProtoDiv.reset("PROTO_school");


      var schools = []
      if(typeof response == 'object') {
        schools = response.schools
      }

      ProtoDiv.replicate("PROTO_school", schools);

      cb("schools");

}



// go to the page that lists the courses for a specific school
function showCourses(response, cb) {

  var path = window.location.pathname;


	ProtoDiv.reset("PROTO_course");

		var courses = []
		if(typeof response == 'object') {
			var school = response.school
			$("#school_name").html(school.name);
			courses = school.courses
		}

		ProtoDiv.replicate("PROTO_course", courses);

		cb("courses")
}




// go to the page that lists the lectures for a specific course
function showLectures(response, cb) {

  var path = window.location.pathname;
  

	ProtoDiv.reset("PROTO_lecture");
	
		ProtoDiv.reset("PROTO_lectures_head")
		ProtoDiv.reset("PROTO_lectures_instructor")
		ProtoDiv.reset("PROTO_lecture")

		if(typeof response == 'object') {

			var course = response.course
			if(course)
				ProtoDiv.replicate("PROTO_lectures_head", [course])

			var instructor = response.instructor
			if(instructor)
				ProtoDiv.replicate("PROTO_lectures_instructor", [instructor])

			var lectures = response.lectures
			if(lectures)
				ProtoDiv.replicate("PROTO_lecture", lectures);

		}

		cb("lectures")
}



// go to the page that lists the note taking sessions for a specific lecture
function showNotes(response, cb) {

  var path = window.location.pathname;


	ProtoDiv.reset("PROTO_note");
	
		if(typeof response == 'object') {

			var course = response.course
			//if(course)
			//	ProtoDiv.replicate("PROTO_lectures_head", [course])

			var instructor = response.instructor
			//if(instructor)
			//	ProtoDiv.replicate("PROTO_lectures_instructor", [instructor])

			var lecture = response.lecture
			//if(lecture)
			//	ProtoDiv.replicate("PROTO_lecture", lectures);

			var notes = response.notes
			if(notes)
				ProtoDiv.replicate("PROTO_note", notes);

		}

		cb("notes")
}


// go to the page that lists the archived subject names
function showArchiveSubjects(response, cb) {

  var path = window.location.pathname;

	ProtoDiv.reset("PROTO_archive_subject")

		var subjects = response.subjects

		ProtoDiv.replicate("PROTO_archive_subject", subjects)

	cb("archive_subjects")
}



function showArchiveCourses(response, cb) {

  var path = window.location.pathname;


	ProtoDiv.reset("PROTO_archive_course")

		var courses = response.courses

		ProtoDiv.replicate("PROTO_archive_course", courses)

	cb("archive_courses")
}



function showArchiveNotes(response, cb) {

  var path = window.location.pathname;


	ProtoDiv.reset("PROTO_archive_note")

		var notes = response.notes
		$.each(notes, function(i, note) {
			if(!note.topic)
				note.topic = note._id//note.text.substr(0, 15)+" ..."
		})

		ProtoDiv.replicate("PROTO_archive_note", notes)

	cb("archive_notes")
}



function showArchiveNote(response, cb) {

  var path = window.location.pathname;


	ProtoDiv.reset("PROTO_archive_note_display")

		var note = response.note
note = { text: "Hi <i>Mom!</i>", topic: "21st Century Greetings" }
		if(!note.topic)
			note.topic = note.text.substr(0, 15)+" ..."

		ProtoDiv.replicate("PROTO_archive_note_display", note)

	cb("archive_note_display")
}



// go to the account registration page
function showRegister(response, cb) {
	// xxx clear fields?
	// xxx change FORM to use AJAX
	cb("register");
}


function showLogin(response, cb) {
	cb("login");
}




// go to the press articles page
function showPress(response, cb) {
	cb("press");
}


// go to the "code of conduct" page
function showConduct(response, cb) {
	cb("conduct");
}




var pageVectors = [
	{ regex: /^\/(index.html)?$/, func: showHome },
	{ regex: /^\/schools/, func: showSchools },
	{ regex: /^\/school\/([a-f0-9]{24})/, func: showCourses },
	{ regex: /^\/course\/([a-f0-9]{24})/, func: showLectures },
	{ regex: /^\/lecture\/([a-f0-9]{24})/, func: showNotes },
	{ regex: /^\/archive\/?$/, func: showArchiveSubjects },
	{ regex: /^\/archive\/subject\/([0-9]+)/, func: showArchiveCourses },
	{ regex: /^\/archive\/course\/([0-9]+)/, func: showArchiveNotes },
	{ regex: /^\/archive\/note\/([0-9]+)/, func: showArchiveNote },
	{ regex: /^\/login/, func: showLogin },
	{ regex: /^\/register/, func: showRegister },
	{ regex: /^\/press/, func: showPress },
	{ regex: /^\/conduct/, func: showConduct },
];

var testVectors = {
  schools: showSchools,
  school: showCourses,
  course: showLectures,
  lecture: showNotes,
  archive: showArchiveSubjects,
  archivesubject: showArchiveCourses,
  archivecourse: showArchiveNotes,
  archivenote: showArchiveNote,
  login: showLogin,
  press: showPress,
  conduct: showConduct
}

/* Do and show the appropriate thing, based on the pages current URL */
function showPage(y) {

	var path = document.location.pathname

  var mainSlug = path.match(/((?:[a-z][a-z]+))/) ? path.match(/((?:[a-z][a-z]+))/)[1].toLowerCase() : '';
  if (mainSlug === 'archive') {
    var archiveSlugs = path.match(/((?:[a-z][a-z]+))\/((?:[a-z][a-z0-9_]*))/);
    if (archiveSlugs) {
      mainSlug = mainSlug + archiveSlugs[2];
    }
  }

	$(".page").hide(); //(100);		// hide all pseudo pages

  if (testVectors[mainSlug]) {
    return $.get(path, { cache: false }, function(response) {
      if (response.status === 'error') {
        console.log(response.message)
        $("#pg_notfound").fadeIn(100);
        window.scroll(0, 0)
        return;
      }
      testVectors[mainSlug](response, function(pageId) {
        $("#pg_"+pageId).fadeIn(100);
        window.scroll(0, y)
      })
    });
  } else if (path === '/') {
    return showHome(function(pageId) {
      $("#pg_"+pageId).fadeIn(100);
      window.scroll(0, y)
    })
  }

  $("#pg_notfound").fadeIn(100);
  window.scroll(0, 0)
  /*
	for(var i = 0; i < pageVectors.length; i++) {
		var vector = pageVectors[i]
		var matches = path.match(vector.regex)
		if(matches) {
			vector.func(function(pageId) {

				$("#pg_"+pageId).fadeIn(100);

				window.scroll(0, y)

			})
			break
		}
	}
  

	if(i == pageVectors.length) {
	}
	// scroll to top of page (as if we'd done a real page fetch)
	/*$('html, body').animate({
		scrollTop: $("#topofcontent").offset().top
	}, 100);*/

}




/* Simulates a page load.
	'path' is something like "/schools", etc.
	A page fetch doesn't really happen.
	Based on what path looks like, an appropriate DIV is shown, and action taken
*/
var topQueue = [0]
function goPage(path) {
	var y = 0 + window.pageYOffset
	topQueue.push(y)
	history.pushState({}, path, path);
	showPage(0);
}


/* Simulates a "back" browser navigation.  */
function goBack(event) {
	var y = topQueue.pop()
	showPage( y );
}


	window.onpopstate = goBack

  $('a[href^=/]').live('click', function(e) {
    var path = e.target.pathname || '/';
    var checkNote = path.match(/((?:[a-z][a-z]+))/);
    if (checkNote && checkNote[1] == 'note') {
      return true;
    } else {
      goPage(path)
      return false;
    }
  })
$(document).ready(function() {

	// This code executes after the page has been fully loaded


	// xxx older FF browsers don't fire a page load/reload - deal with it somehow.
	// showPage( 0 );		// needed for some older browsers, redundant for chrome

})





