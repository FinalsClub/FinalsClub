#!/bin/bash

# Finals Club collaborative real-time editor
# deployment script. (c) 2011 Finals Club Foundation
# This script is licensed under the terms of the GPL
# v3. To view this license, please see the COPYING
# file in the src root.


haproxy=/usr/sbin/haproxy

#get / install dependencies

apt-get update
apt-get install git-core
apt-get install make
apt-get install g++
apt-get install sqlite
apt-get install curl

# get src

git clone git://github.com/finalsclubdev/FinalsClub.git

cd etherpad-lite

git clone git://github.com/chapel/etherpad-lite.git

cd ..

# install node
nodever="v0.4.10"
if test ! -e node-$nodever ; then
		curl http://nodejs.org/dist/node-v0.4.10.tar.gz > node-v0.4.10.tar.gz
		tar xzvf node-$nodever.tar.gz
		cd node-$nodever
		./configure
		make
		make install
fi

# install npm
if test ! -e npm ; then
		git clone http://github.com/isaacs/npm.git
		cd npm
		sudo make install
		cd ..
fi

npm install nodemon -g
npm install forever -g

## make it easier for root to run node
cd /usr/bin
ln -sf /usr/local/bin/node .
ln -sf /usr/local/bin/forever .


rm /data/db/mongod.lock
/usr/local/bin/mongod -v --rest --replSet finalsclubset &> /var/log/mongod.log &

