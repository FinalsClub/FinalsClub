#!/bin/bash

## cron example 
## ## this script checks if EPL is up and running. if not, it sends an alert email
5,20,35,50 * * * * /home/ec2-user/fc/util/fc_monitor_epl_cron.sh > /home/ec2-user/fc/util/fc_monitor_epl_cron.log.txt


## save the current working dir
pushd .
cd ~/fc/fcbackups

## this scripts expects these vars to be set
## export AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
## export AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
if test -e .fcbackup.env ; then
	source .fcbackup.env
fi

cd ~/fc
node fc_monitor_epl.js
popd

