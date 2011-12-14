#!/bin/bash

export PATH="/usr/local/bin:$PATH"

## this script assumes it is running as root
rm /data/db/mongod.lock
/usr/local/bin/mongod -v --rest --replSet finalsclubset &> /var/log/mongod.log &

## optional, if arbiter db is running on this machine
## rm /data/arbiterdb/mongod.lock
## /usr/local/bin/mongod -v --dbpath /data/arbiterdb --port 27021 --rest --replSet finalsclubset &> /var/log/mongod-arbiter.log &

pushd .
cd /home/ec2-user/fc

## start the node apps
./restart

## run the EPL monitor 
./util/start-fc-epl-monitor.sh &

popd


