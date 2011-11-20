#!/usr/bin/env bash
## Author: Joseph Snow (snow@sleepless.com) 11/10/2011
## script to check local disk space and submit data to AWS cloudwatch

while true ; do
	su -c /home/ec2-user/fc/util/fc_monitor_epl_cron.sh ec2-user 
		
	# wait 15 minutes
	sleep 900
done

