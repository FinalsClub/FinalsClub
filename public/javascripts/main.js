
/*

This is the core logic for the main page.
It implements most page transitions by showing and hiding DIV elements
in the page with javascript+jquery

*/


/* Convert a JSON string to an object, or null if unparseable */
function j2o(json) { try { return JSON.parse(json); } catch(e) { return null; } }

/* Convert an object to a JSON string (just easier to type than "JSON.stringify" */
function o2j(obj) { return JSON.stringify(obj); }


// hide all page divs, then show just the one with the given id
function hideAllPages() {
	$(".page").fadeOut(100);
}
function showPage(id) {
	//alert("showPage "+id);
	$("#pg_"+id).fadeIn(100);

	$('html, body').animate({ scrollTop: 0 }, 10);
	/*$('html, body').animate({
		scrollTop: $("#topofcontent").offset().top
	}, 100);*/

}

function goPage(id) {

	showPage(id)

	//if(id == 'home')
	//	id = 'index.html'
	//history.pushState({prev:document.location.pathname.substr(1)}, "Page "+id, "/"+id);
	history.pushState({prev:id}, "Page "+id, "/"+id);

}




// go to the page that lists the schools
var schools = []
function goSchools() {
	ProtoDiv.reset("PROTO_school");
	hideAllPages();
	$.get("/schools", {}, function(response) {
		if(typeof response == 'object') {
			schools = response.schools
		}
		ProtoDiv.replicate("PROTO_school", schools);
		goPage("schools")
	});
}



// go to the page that lists the courses for a specific school
var courses = []
function goCourses(schoolName, schoolId, a) {
	ProtoDiv.reset("PROTO_course");
	hideAllPages();
	$.get("/school/"+schoolId, {}, function(response) {
		courses = []
		if(typeof response == 'object') {
			var school = response.school
			$("#school_name").html(school.name);
			courses = school.courses
		}
		ProtoDiv.replicate("PROTO_course", courses);
		goPage("courses", "/courses/"+schoolId)
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
function goArchivedSubjects() {
	hideAllPages();

	// fake data
	archivedSubjects = [
		{ id: 83, title: "Anthropology" },
		{ id: 44, title: "CORE-Foreign Cultures" },
		{ id: 80, title: "CORE-Historical Study" }
	]

	ProtoDiv.reset("PROTO_archived_subjects");
	ProtoDiv.replicate("PROTO_archived_subjects", archivedSubjects);

	goPage("archive");
}



// go to the account registration page
function goRegister() {
	hideAllPages();
	// xxx clear fields?
	// xxx change FORM to use AJAX
	goPage("register");
}


// go to the press articles page
function goPress() {
	hideAllPages();
	goPage("press");
}


// go to the "code of conduct" page
function goConduct() {
	hideAllPages();
	goPage("conduct");
}



$(document).ready(function() {
	// This executes after the page has been fully loaded

	window.onpopstate = function(event) {  

		var state = event.state
		//alert("pop: "+o2j(state));

		hideAllPages();

		if(!state) {

			history.replaceState(null, "", "/index.html");
			showPage("home");

		}
		else {
			//alert("location: " + document.location + ", state: " + JSON.stringify(event.state));  
			//history.replaceState(null, "", state.prev);
			showPage(state.prev);
			// showPage(state.prev);
			//alert("location: " + document.location + ", state: " + JSON.stringify(event.state));  
		}
	}; 

	//showPage("home");
})





