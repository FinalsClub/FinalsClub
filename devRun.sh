#!/bin/bash

# Start Script for running app.js and Etherpad-lite in development mode
# TODO Merge with start as an argument option


# Kill all node instances
echo "FinalsClub, NOT doing a killall node, do it yourself if you need it"

echo ""
export NODE_PATH="`pwd`/etherpad-lite/node_modules:`pwd`/node_modules:$NODE_PATH"
echo $NODE_PATH


# Set Env. Vars.
#export NODE_PATH=/home/risci_atom/fc/node_modules/:/home/risci_atom/fc/etherpad-lite/node_modules:$NODE_PATH
export MONGO_HOST_URI=mongodb://localhost/fc
export MONGO_HOST=localhost
export SERVER_HOST=localhost
export SERVER_PORT=3000
export NODE_ENV=development


echo "starting etherpad-lite"
cd etherpad-lite
./bin/run.sh &> ../epl.log &

echo "starting fc"
cd ../
node ./app.js &> app.log &
