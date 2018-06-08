#!/usr/bin/env bash

currentPath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
packageVersion=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]');
outputFileName=rtmp-flash-renderer-${packageVersion}.swf;

mkdir ${currentPath}/tmp;
wget -O ${currentPath}/tmp/flex_sdk_4.6.zip http://download.macromedia.com/pub/flex/sdk/flex_sdk_4.6.zip;
unzip ${currentPath}/tmp/flex_sdk_4.6.zip -d ${currentPath}/tmp/flex_sdk_4.6;

echo Generating swf file ${outputFileName} from ../src/flash/RtmpFlashRenderer.as file using flex_sdk_4.6;

# Fix bug in flex_sdk_4.6
# https://stackoverflow.com/questions/13302427/mxmlc-in-flex-sdk-4-5-doesnt-work-on-mac-os-10-8
sed -i '' 's/-d32//g' ${currentPath}/tmp/flex_sdk_4.6/bin/mxmlc

${currentPath}/tmp/flex_sdk_4.6/bin/mxmlc -strict=false -compiler.debug=true -warnings=true ${currentPath}/../src/flash/RtmpFlashRenderer.as -o ${currentPath}/../generated/${outputFileName} -library-path+=${currentPath}/tmp/flex_sdk_4.6 $libraries -use-network=true -headless-server -static-link-runtime-shared-libraries;

rm -rf ${currentPath}/tmp;
