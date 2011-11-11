
# Finals Club (FC)

This is the source code repository for [finalsclub.org](http://finalsclub.org/).

FC is a 501(c)(3) non-profit open education project dedicated to
helping college students collaborate, learn, and share their knowledge freely online.


# Infrastructure

The FC servers run in the cloud on Linux servers, using Amazon Web Services (AWS).
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


# Source Code

The source code for the website itself consists of these main parts:

- The collaborative, real-time editor
- The back channel
- The surrounding website

These 3 pieces are written in Javascript for Node.js.

## The Collaborative Real-time Editor 

The real-time editor is an embedded editor called
[Etherpad-Lite](https://github.com/Pita/etherpad-lite) (EPL).
It provides the ability for multiple people to simultaneously edit a single document.
The documents in FC are the notes for a specific lecture.


## The Back Channel (BC)

The back channel portion of FC is called ["BC"](https://github.com/FinalsClubDev/BC).
BC allows the note takers, or anyone else who is just observing,
to suggest questions for the lecturer, and vote on each other's questions.
It also allows people to post commentary.


## The Surrounding Website

This is the FC website, which brings together the other two elements into
a single website that serves it's stated purpose (above).
This would be the home page, privacy policy page, the page that lists the participating
schools, the sub pages containing lists of lectures and note taking sessions, and the
core page where EPL and BC are both found along side each other. 






