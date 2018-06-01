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



It may take a while. When it is done, you will see executables in ./outapp/ directory.

# Package and distribution

Install prerequisite
```bash
yarn add --dev 
```

Package webpage distribution

```bash
./ci.sh
```
then modify index.html and index_m.html to reflect the newly generated hash file names.

