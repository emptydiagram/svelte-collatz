#!/bin/sh

npm run build
rm -rf docs
cp -r public docs
