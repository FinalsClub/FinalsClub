
/*

This is the core logic for the main page.
It implements most page transitions by showing and hiding DIV elements
in the page with javascript+jquery

*/


/* Convert a JSON string to an object, or null if unparseable */
function j2o(json) { try { return JSON.parse(json); } catch(e) { return null; } }

/* Convert an object to a JSON string (just easier to type than "JSON.stringify" */
function o2j(obj) { return JSON.stringify(obj); }



function showHome(matches, cb) {
	cb("home");
}



// go to the page that lists the schools
function showSchools(matches, cb) {

	ProtoDiv.reset("PROTO_school");

	$.get("/schools", { cache: false }, function(response) {

		var schools = []
		if(typeof response == 'object') {
			schools = response.schools
		}

		ProtoDiv.replicate("PROTO_school", schools);

		cb("schools");

	});

}



// go to the page that lists the courses for a specific school
function showCourses(matches, cb) {

	var schoolId = matches[1]

	ProtoDiv.reset("PROTO_course");

	$.get("/school/"+schoolId, { cache: false }, function(response) {

		var courses = []
		if(typeof response == 'object') {
			var school = response.school
			$("#school_name").html(school.name);
			courses = school.courses
		}

		ProtoDiv.replicate("PROTO_course", courses);

		cb("courses")

	});
}




// go to the page that lists the lectures for a specific course
function showLectures(matches, cb) {

	var courseId = matches[1]

	ProtoDiv.reset("PROTO_lecture");
	
	$.get("/course/"+courseId, { cache: false }, function(response) {

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
	});
}



// go to the page that lists the note taking sessions for a specific lecture
function showNotes(matches, cb) {

	var lectureId = matches[1]

	ProtoDiv.reset("PROTO_note");
	
	$.get("/lecture/"+lectureId, { cache: false }, function(response) {

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
	});
}





// go to the page that lists the archived subject names
function showArchiveSubjects(matches, cb) {

	ProtoDiv.reset("PROTO_archive_subject")

	$.get("/archive", { cache: false }, function(response) {

		var subjects = response.subjects

		ProtoDiv.replicate("PROTO_archive_subject", subjects)

	})

	cb("archive_subjects")
}



function showArchiveCourses(matches, cb) {

	var subjectId = parseInt(matches[1])

	ProtoDiv.reset("PROTO_archive_course")

	$.get("/archive/subject/"+subjectId, { cache: false }, function(response) {

		var courses = response.courses

		ProtoDiv.replicate("PROTO_archive_course", courses)

	})

	cb("archive_courses")
}



function showArchiveNotes(matches, cb) {

	var courseId = parseInt(matches[1])

	ProtoDiv.reset("PROTO_archive_note")

	$.get("/archive/course/"+courseId, { cache: false }, function(response) {

		var notes = response.notes
		$.each(notes, function(i, note) {
			if(!note.topic)
				note.topic = note.text.substr(0, 15)+" ..."
		})

		ProtoDiv.replicate("PROTO_archive_note", notes)

	})

	cb("archive_notes")
}



function showArchiveNote(matches, cb) {

	var noteId = parseInt(matches[1])

	ProtoDiv.reset("PROTO_archive_note_display")

	$.get("/archive/note/"+noteId, { cache: false }, function(response) {

		var note = response.note
note = { text: "Hi <i>Mom!</i>", topic: "21st Century Greetings" }
		if(!note.topic)
			note.topic = note.text.substr(0, 15)+" ..."

		ProtoDiv.replicate("PROTO_archive_note_display", note)

	})

	cb("archive_note_display")
}



// go to the account registration page
function showRegister(matches, cb) {
	// xxx clear fields?
	// xxx change FORM to use AJAX
	cb("register");
}


function showLogin(matches, cb) {
	cb("login");
}




// go to the press articles page
function showPress(matches, cb) {
	cb("press");
}


// go to the "code of conduct" page
function showConduct(matches, cb) {
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


/* Do and show the appropriate thing, based on the pages current URL */
function showPage(y) {

	var path = document.location.pathname

	$(".page").hide(); //(100);		// hide all pseudo pages

	for(var i = 0; i < pageVectors.length; i++) {
		var vector = pageVectors[i]
		var matches = path.match(vector.regex)
		if(matches) {
			vector.func(matches, function(pageId) {

				$("#pg_"+pageId).fadeIn(100);

				window.scroll(0, y)

			})
			break
		}
	}

	if(i == pageVectors.length) {
		$("#pg_notfound").fadeIn(100);
		window.scroll(0, 0)
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


$(document).ready(function() {

	// This code executes after the page has been fully loaded

	window.onpopstate = goBack

	// xxx older FF browsers don't fire a page load/reload - deal with it somehow.
	// showPage( 0 );		// needed for some older browsers, redundant for chrome

})





