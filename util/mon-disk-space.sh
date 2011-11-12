#!/usr/bin/env bash
## Author: Joseph Snow (snow@sleepless.com) 11/10/2011
## script to check local disk space and submit data to AWS cloudwatch

## VARS
export FC_HOME=~/fc
export AWS_CLOUDWATCH_HOME=$FC_HOME/util/CloudWatch-1.0.12.1
export PATH=$AWS_CLOUDWATCH_HOME/bin:$PATH
export JAVA_HOME=/usr/lib/jvm/jre


## cron example 
## ## this script updates custom disk space stats to AWS cloudwatch. this script should be run every 5 minutes
## */5 * * * * /home/ec2-user/fc/util/mon-disk-space.sh

## this scripts expects these vars to be set
## export AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
## export AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
if test -e "$FC_HOME/fcbackups/.fcbackup.env" ; then
	source "$FC_HOME/fcbackups/.fcbackup.env"
fi


path='/'
if [ -n "$1" ]; then
	path=$1
fi

# get ec2 instance id
instanceid=`wget -q -O - http://169.254.169.254/latest/meta-data/instance-id`

freespace=`df --local --block-size=1M $path | grep $path | tr -s ' ' | cut -d ' ' -f 4`
usedpercent=`df --local $path | grep $path | tr -s ' ' | cut -d ' ' -f 5 | grep -o "[0-9]*"`

echo "mon-disk-space AWS cloudwatch custom diskspace monitor"
echo "instanceid: $instanceid"
echo "freespace: $freespace"
echo "usedpercent: $usedpercent"

# send the stats to AWS cloudwatch using the CloudWatch tools
mon-put-data --I $AWS_ACCESS_KEY_ID --S $AWS_SECRET_ACCESS_KEY --region "$EC2_REGION" --metric-name "FreeSpaceMBytes" --namespace "System/Linux" --dimensions "InstanceId=$instanceid,Path=$path" --value "$freespace" --unit "Megabytes"
mon-put-data --I $AWS_ACCESS_KEY_ID --S $AWS_SECRET_ACCESS_KEY --metric-name "UsedSpacePercent" --namespace "System/Linux" --dimensions "InstanceId=$instanceid,Path=$path" --value "$usedpercent" --unit "Percent"

echo "done"


