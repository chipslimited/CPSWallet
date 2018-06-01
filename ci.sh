#!/bin/sh
rm dist/*.js
yarn build

echo "Please edit index.html and index_m.html to include updated app app_m manifest and vendor files."
