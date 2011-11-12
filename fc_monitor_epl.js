// monitor EPL and send an email if unreachable


// Prerequisites
var http = require('http');
var Mailer = require('./mailer.js');

// globals
var mailto = ['info@finalsclub.org', 'snow@sleepless.com'];

var msgs = [];
function dlog(msg) {
	msgs.push(msg);
	console.log(msg);
}


function main() {

	var numRetries = 2;
	var fc1Opts = {
		host: 'finalsclub.org',
		port: 9001,
		path: '/',
		method: 'GET',
		timeout: 15 * 1000
	};

	var errs = [];

	var date = new Date().toString();
	var url = 'http://' + fc1Opts.host + ':' + fc1Opts.port + fc1Opts.path;
	dlog('FinalsClub EPL health check monitor');
	dlog('date: ' + date);
	dlog('url: ' + url);
	dlog('');

	checkAlive(fc1Opts, numRetries, function (success, errMsg) {
		var url = fc1Opts.host + ':' + fc1Opts.port + fc1Opts.path;
		if (success) {
			dlog('host is alive');
			dlog('');
		} else {
			dlog('FAILED');
			dlog('host is dead - final error: ' + errMsg);
			dlog('');

			sendEmailAlert(url, msgs, date);
		}
	});
}

function checkAlive(httpOptions, retries, cb) {
	var errs = [];
	checkAlive2(httpOptions, retries, errs, cb);
}

function checkAlive2(httpOptions, retries, errs, cb) {
	checkAliveWorker(httpOptions, function (success, errMsg) {
		if (success || retries <= 0) {
			cb(success, errMsg);
		} else {
			dlog('Error: ' + errMsg + '\n\nretrying...');
			checkAlive2(httpOptions, retries - 1, errs, cb);
		}
	});
}

function checkAliveWorker(httpOptions, cb) {

	var timeoutDelayMS = httpOptions.timeout || 30 * 1000;

	// declare req var before using it's reference in timeout handler
	var req = null;

	// init request timeout handler
	var timeoutId = setTimeout(function () {
		clearTimeout(timeoutId);
		
		if (cb) {
			cb(false, 'timeout');
			cb = null;
		}
		req.abort();
	}, timeoutDelayMS);

	// init request now
	req = http.request(httpOptions, function (res) {
		// console.log('STATUS: ' + res.statusCode);
		// console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			// console.log('BODY: ' + chunk);
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}

			if (cb) { cb(true, null); }
			cb = null;
		});

		if (res.statusCode != 200) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}

			var msg = ['invalid response code',
						'status: ' + res.statusCode,
						'headers: ' + JSON.stringify(res.headers)];

			if (cb) { cb(false, msg.join('\n')); }
			cb = null;
		}
	});

	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		if (cb) { cb(false, e.message); }
		cb = null;
	});

	// close the request
	req.end();
}


function sendEmailAlert(url, msgs, date) {
	var awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
	var awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
	var mailer = new Mailer(awsAccessKey, awsSecretKey);

	for (var i in mailto) {
		var email = mailto[i];
		dlog('sending email alert to: ' + email);
		var details = msgs.join('\n');	
		var message = {
			'to': email,
			'subject': 'FinalsClub.org EPL Monitor Warning',
			'template': 'systemEPLMonitorFailed',
			'locals': {
				'url': url,
				'msgs': details,
				'date': date
			}
		};

	
		mailer.send(message, function (err, result) {
			if (err) {
				dlog('Error sending email\nError Message: ' + err.Message);
			} else {
				dlog('Successfully sent email.');
			}
		});
	}
};

main();

