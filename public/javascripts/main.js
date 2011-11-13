
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
	$("#pg_"+id).fadeIn(100);
}



var schools = []

// go to the page that lists the schools
function goSchools() {
	hideAllPages();
	$.get("/schools", {}, function(response) {
		if(typeof response == 'object')
			schools = response.schools
		ProtoDiv.reset("PROTO_school");
		ProtoDiv.replicate("PROTO_school", schools);
		showPage("schools")
	});
}



var courses = []

// go to the page that lists the courses for a specific school
function goCourses(name) {
	hideAllPages();
	$("#school_name").html(name);
//		$.get("/courses", {}, function(response) {
//			if(typeof response == 'object')
//				courses = response.courses
var courses = [
{ id: "4e6d1e9b42bbef522c000a8f", name: "History 12: Introduction to the Middle East" },
{ id: "4e8aa3f62e4b97e67b001f47", name: "ANTH160AC/ISF 160: The Forms of Folklorek" }
]
		ProtoDiv.reset("PROTO_course");
		ProtoDiv.replicate("PROTO_course", courses);
		showPage("courses")
//		});
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

	showPage("archive");
}



// go to the account registration page
function goRegister() {
	hideAllPages();
	// xxx clear fields?
	// xxx change FORM to use AJAX
	showPage("register");
}


// go to the press articles page
function goPress() {
	hideAllPages();
	showPage("press");
}


// go to the "code of conduct" page
function goConduct() {
	hideAllPages();
	showPage("conduct");
}



$(document).ready(function() {
	// This executes after the page has been fully loaded
	showPage("home");
})





