#!/bin/bash

# Script to install the FinalsClub fc app once you have:
# * installed appropriate node, npm, and mongo versions
# * checked this repo out on the appropriate server

# TODO: Integrate this (optionally) into setup.sh


echo ""
echo ""
echo ""
echo " = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = "
echo "\t\tWelcome to FinalsClub live collaboration installer"
echo ""
echo " = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = "
echo ""
echo "FC: ..."

echo ""
echo "FC: installing node_modules for the fc app"
echo "FC: ..."
npm install .
echo "FC: Done!"

# Checking out git submodules
echo "FC: checking out submodules"
echo "FC: ..."
git submodule update --init
echo "FC: Done!"
echo ""

# Setting up EPL
echo "FC: Setting up etherpad-lite submodule"
echo "FC: ..."
echo "FC: Installing etherpad-lite npm requirements into local folder"
cd ./etherpad-lite
./bin/installDeps.sh
echo "FC: ..."
echo "FC: Done!"

echo "FC: Should be installed correctly. If you find errors, please email seth@finalsclub.org and/or report it at https://github.com/finalsclubdev/FinalsClub/issues"
