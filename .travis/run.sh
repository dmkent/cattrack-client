#!/bin/bash
#
# Runs tests depending on OS

if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
    npm test
else
    npm run tests.all
    npm run build.prod
    npm run gulp build.prod.tar
fi
