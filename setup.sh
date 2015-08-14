#!/bin/bash

echo "Hey! I'm going to install a bunch of stuff."
for p in async intel-hex crc bufferpack avrgirl-chips-json git://github.com/noopkat/avrgirl-ispmkii
do
  echo "npm installing $p..."
  npm install $p
done
echo "npm installed the things."
echo "installing and rebuilding usb for nw use..."
cd node_modules/avrgirl-ispmkii/node_modules/usb
node-pre-gyp configure --runtime=node-webkit --target=0.12.3
node-pre-gyp build --runtime=node-webkit --target=0.12.3
echo "all done."
