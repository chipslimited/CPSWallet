# Single Page Application based on Vue 2.0 and electron

## Build Setup

# Prerequisite

## Install nodejs

Please visit https://nodejs.org/en/download/ to download and install nodejs for Windows and macos.

If you are using Debian and Ubuntu, please follow instructions at https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

## Install Yarn

Please follow instructions at https://yarnpkg.com/lang/en/docs/install/

Windows users should download installer msi from above link.

For macos users with homwbrew
```bash
brew install yarn
```

For Debian/Ubuntu users
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get update && sudo apt-get install yarn
```

# Install dependencies
``` bash
yarn add --dev electron-installer-windows
```
# Serve with hot reload at localhost:8080
``` bash
yarn dev
```
# Launch electron with dev mode
``` bash
yarn start
```
# Package application
``` bash
yarn build && yarn predeploy &&  electron-packager . CPSWallet --asar=true  --platform=win32,darwin,linux --arch=x64  --overwrite --out=./outapp/ --no-prune  --icon CPSWALLETLOGO

```

It may take a while. When it is done, you will see executables in ./outapp/ directory.

# Package and upload to Aliyun OSS

Install prerequisite
```bash
yarn add --dev 
```

Build package and upload
```bash
./ci.sh
```

ci.sh call upload.py to upload files to OSS, you need to change OSS configuration in upload.py so that packaged executables are upload to OSS of your own.
