
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

	$.get("/schools", {}, function(response) {

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

	$.get("/school/"+schoolId, {}, function(response) {

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
var lectures = []
function goLectures(courseId) {
	ProtoDiv.reset("PROTO_lecture");
	hideAllPages();
	$.get("/course/"+courseId, {}, function(response) {

response = {
	course: {
		name: "FooCourse",
		lectures: [
			{ _id: 1, name: "lecture 1" },
			{ _id: 2, name: "lecture 2" },
		]
	}
}
		lectures = []
		if(typeof response == 'object') {
			var course = response.course
			$("#course_name").html(course.name);
			lectures = course.lectures
		}
		ProtoDiv.replicate("PROTO_lecture", lectures);
		goPage("lectures")
	});
}




// go to the page that lists the lectures for a specific course
var pads = []
function goPads(lectureId) {
	ProtoDiv.reset("PROTO_pad");
	hideAllPages();
	$.get("/lecture/"+lectureId, {}, function(response) {

response = {
	lecture: {
		name: "Foo Lecture",
		pads: [
			{ _id: 1, name: "pad 1" },
			{ _id: 2, name: "pad 2" },
		]
	}
}
		pads = []
		if(typeof response == 'object') {
			var lecture = response.lecture
			$("#lecture_name").html(lecture.name);
			pads = course.pads
		}
		ProtoDiv.replicate("PROTO_pad", lectures);
		goPage("pads")
	});
}




var archivedSubjects = []

// go to the page that lists the archived subject names
function showArchive(matches, cb) {

	// xxx fake data
	archivedSubjects = [
		{ id: 83, title: "Anthropology" },
		{ id: 44, title: "CORE-Foreign Cultures" },
		{ id: 80, title: "CORE-Historical Study" }
	]

	ProtoDiv.reset("PROTO_archived_subjects")
	ProtoDiv.replicate("PROTO_archived_subjects", archivedSubjects)

	cb("archive")
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




function hideAllPages() {

	$(".page").fadeOut(100);

}


var pageVectors = [
	{ regex: /^\/(index.html)?$/, func: showHome },
	{ regex: /^\/schools/, func: showSchools },
	{ regex: /^\/school\/([a-f0-9]{24})/, func: showCourses },
	{ regex: /^\/login/, func: showLogin },
	{ regex: /^\/register/, func: showRegister },
	{ regex: /^\/press/, func: showPress },
	{ regex: /^\/archive/, func: showArchive },
	{ regex: /^\/conduct/, func: showConduct },
];


/* Do and show the appropriate thing, based on the pages current URL */
function showPage(y) {

	var path = document.location.pathname

	$(".page").fadeOut(100);		// hide all pseudo pages

	for(var i = 0; i < pageVectors.length; i++) {
		var vector = pageVectors[i]
		var matches = path.match(vector.regex)
		if(matches) {
			vector.func(matches, function(pageId) {

				$("#pg_"+pageId).fadeIn(100);

				//alert(backTop)
				//if(!backFlag)
					//$('html, body').animate({ scrollTop: backTop }, 100);
				//if(y !== undefined)
					window.scroll(0, y)
				//backFlag = false

			})
			break
		}
	}

	if(i == pageVectors.length) {
		$("#pg_notfound").fadeIn(100);
		$('html, body').animate({ scrollTop: 0 }, 100);
	}
	// scroll to top of page (as if we'd done a real page fetch)
	//$('html, body').animate({ scrollTop: 0 }, 100);
	/*$('html, body').animate({
		scrollTop: $("#topofcontent").offset().top
	}, 100);*/

}




/* Simulates a page load.
	'path' is something like "/schools", etc.
	A page fetch doesn't really happen.
	Based on what path looks like, an appropriate DIV is shown, and action taken
*/
function goPage(path) {
	var y = 0 + window.pageYOffset
	var o = {py:(path+"|"+y)}
	history.pushState(o, path, path);
	showPage(0);
}


/* Simulates a "back" browser navigation.  */
var backTop = 0
function goBack(event) {
	// alert("pop: "+o2j(event.state));
	//backTop = window.pageYOffset; //$("html, body").offset().top
	showPage( event.state ? event.state.y : 0 )
}


$(document).ready(function() {

	// This code executes after the page has been fully loaded

	window.onpopstate = goBack

})





