#!/bin/bash

## this is the nightly restart script.
## it should be used by cron, just makes sure we're in the correct path 
## and env vars are set before restarting
## cron example (pick different times for each server)
## ## this does a staggerd restart of the server each night
## 15 1 * * * /home/ec2-user/fc/util/nightly-restart.sh > /tmp/cron.nightly-restart.log


## save of the current path
pushd .

cd ~/fc

## make sure to load the env vars
source ~/.bashrc

## restart the server using the normal restart script
./restart

## restore the previous path
popd
