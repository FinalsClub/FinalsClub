#!/bin/bash

## cron example 
## ## this script handles the daily rotating mongodb backup task for the finalsclub project
## 30 0 * * * /home/ec2-user/fc/fcbackups/fc_rotating_db_backup.sh > /home/ec2-user/fc/fcbackups/cron_log.txt

## this script is dependent on the cp2s3 script
## http://devblog.famundo.com/articles/2007/03/12/cp2s3-a-command-line-smart-copy-script-into-s3
## assumes you've installed ruby and ruby gems.  
## sudo yum install ruby
## sudo yum install rubygems
## Installing cp2se requires the installation of the AWS::S3 Ruby library, easiers done with
## sudo gem install aws-s3
## sudo cp cp2s3.rb /usr/bin/cp2s3
## exampe usage
## cp2s3 -v -b finalsclub.org_db_backups -r test.txt


## save the current working dir
pushd .
cd ~/fc/fcbackups

## this scripts expects these vars to be set
## export AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
## export AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
if test -e .fcbackup.env ; then
	source .fcbackup.env
fi


bucket="finalsclub.org_db_backups"
curdate=`date +"%Y-%m-%d"`
yearlydate=`date +"%Y-__-__"`
monthlydate=`date +"____-%m-__"`
dailydate=`date +"____-__-%d"`
mongodump=/usr/local/bin/mongodump

bakdir=db-backups/$curdate



## create temp backup/dump dir
mkdir -p $bakdir 
cd $bakdir

## do the db dump into the temp date dir
$mongodump --host localhost

## create an archive from the dump dir
cd ../
tar czf db-dump_$curdate.tgz $curdate/dump

## clean up by deleting the temp dir
rm -rf $curdate

## rename and copy the latest dump archive up to s3, using the yeary, weekly and daily naming conventions
mv db-dump_$curdate.tgz db-dump_$yearlydate.tgz
cp2s3 -v -b $bucket/yearly -r db-dump_$yearlydate.tgz

mv db-dump_$yearlydate.tgz db-dump_$monthlydate.tgz
cp2s3 -v -b $bucket/monthly -r db-dump_$monthlydate.tgz

mv db-dump_$monthlydate.tgz db-dump_$dailydate.tgz
cp2s3 -v -b $bucket/daily -r db-dump_$dailydate.tgz
## NOTE: we are keeping the last 31 daily backups on disk.

## restore previous working dir
popd

