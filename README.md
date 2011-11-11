
# Finals Club (FC)

This is the source code repository for [finalsclub.org](http://finalsclub.org/).

FC is a 501(c)(3) non-profit open education project dedicated to
helping college students collaborate, learn, and share their knowledge freely online.


# Installing

Requirements:

- Linux server (circa 2011)
- Node.js (Version 0.4.10 or later) (More ...)[http://nodejs.org]
- MongoDB (Version  1.8.2 or later) (More ...)[http://mongodb.org]

## Quick start for a single server installation

	$ pwd
	/home/you
	$ git clone git@github.com:/finalsclubdev/FinalsClub fc
	$ cd fc
	$ git submodule init
	$ git submodule update

	[[ flesh this out with correct commands - reference util scripts - fix util scripts ]]


# Resources

[[ discussion groups, chat rooms, etc. related to FC and FC sources ]]


# Database

The database is MongoDB.
MongoDB is not a relational database, but rather a noSQL or "document/object" database.
Data is stored as structured objects versus tables and rows.
(More about MongoDB)[http://mongodb.org].

## Collections in the database

- archivedcourses
	[[ schema needed ]]
- archivednotes
	[[ schema needed ]]
- archivedsubjects
	[[ schema needed ]]
- courses
	[[ schema needed ]]
- lectures
	[[ schema needed ]]
- notes
	[[ schema needed ]]
- posts
	[[ schema needed ]]
- schools
	[[ schema needed ]]
- sessions
	[[ schema needed ]]
- users
	[[ schema needed ]]


## [[ stuff ]]

[[ notes about scaling/replication/etc. ]]


# Source Code

The source code for the website itself consists of these main parts:

- The collaborative, real-time editor
- The back channel
- The surrounding website

These pieces are written in Javascript for Node.js.


## The Collaborative Real-time Editor 

The real-time editor is an embedded editor called
[Etherpad-Lite](https://github.com/Pita/etherpad-lite) (EPL).
It provides the ability for multiple people to simultaneously edit a single document.
The documents in FC are the notes for a specific lecture.

EPL is installed as a git submodule to the main FC source tree with the name "etherpad-lite".


## The Back Channel (BC)

The back channel portion of FC is implemented with ["BC"](https://github.com/FinalsClubDev/bc).
BC allows the note takers, or anyone else who is just observing,
to suggest questions for the lecturer, and vote on each other's questions.
It also allows people to post commentary.

Although the actual BC code was written for FC, it has been extracted from the original
FC source and turned into an independent open source project.

BC is installed as a git submodule to the main FC source tree with the name "bc".


## The Surrounding Website

This is the FC website, which brings together the other two elements into
a single website that serves it's stated purpose (above).
This would be the home page, privacy policy page, the page that lists the participating
schools, the sub pages containing lists of lectures and note taking sessions, and the
core page where EPL and BC are both found along side each other. 

Several node modules are leveraged to to make the basic website work:

- (async)[http:npmjs.org]
- (aws-lib)[http:npmjs.org]
- (connect)[http:npmjs.org]
- (connect-mongo)[http:npmjs.org]
- (ejs)[http:npmjs.org]
- (express)[http:npmjs.org]
- (express-messages)[http:npmjs.org]
- (hat)[http:npmjs.org]
- (hooks)[http:npmjs.org]
- (init)[http:npmjs.org]
- (jade)[http:npmjs.org]
- (mongodb)[http:npmjs.org]
- (mongoose)[http:npmjs.org]
- (socket.io)[http:npmjs.org]


[[ more detail about website generally, then defer to src comments ]]


# AWS Infrastructure

The actual finalsclub.org servers run in the cloud on Linux servers, using Amazon Web Services (AWS).
Scaling is accomplished by adding additional servers to a load balancer.

NOTE: The scaling system is automatic; new servers have to be added manually, but it it's very easy.
NOTE: Automatic fail-over of the database is not yet in place.

NOTE: There are currently 2 running server instances.  One for the live server and one for testing.

Data is stored in a MongoDB server running on the same AWS instance as the website.
Data is backed up daily to the durable AWS S3 system.
One backup of the database is kept for the most recent 30 days, one for each of the most
recent 12 months, and one for every year.

AWS Cloudwatch is used to monitor the servers.
When the configured conditions warrant attention, notices are sent to "info@finalsclub.org".

NOTE: There are currently 2 monitors set up:

- available disk space
- CPU utilization

NOTE: We still have an ongoing issue with the EPL server hanging up.  This is being worked on.




