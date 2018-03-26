#!/bin/sh

yarn build && yarn predeploy &&  electron-packager . CPSWallet --asar=true  --platform=win32,darwin,linux --arch=x64  --overwrite --out=./outapp/ --no-prune  --icon CPSWALLETLOGO

cd outapp/
rm *.zip
zip -r  CPSWallet-linux-x64.zip CPSWallet-linux-x64
zip -r  CPSWallet-darwin-x64.zip CPSWallet-darwin-x64
cd ..

npm run setup

python upload.py outapp/installers/CPSWallet-0.0.1-setup.exe  CPSWallet-0.0.1-setup.exe
python upload.py outapp/CPSWallet-linux-x64.zip  CPSWallet-linux-x64.zip
python upload.py outapp/CPSWallet-darwin-x64.zip  CPSWallet-darwin-x64.zip
