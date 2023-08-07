#!/bin/bash

npm run build

rm -rf ./ut/web/
mkdir -p ./ut/web/
cp -r ./dist/* ./ut/web/

cd ./ut

CLICKABLE_FRAMEWORK=ubuntu-sdk-20.04 clickable desktop