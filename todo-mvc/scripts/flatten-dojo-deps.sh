#!/bin/bash
cd node_modules
for D in `find dojo-* -type d -maxdepth 0`
do
	BAK="$D.bak"
	UMD="$BAK/dist/umd/"
	BAKPKG="$BAK/package.json"
	PKG="$D/package.json"

	mv $D $BAK
	mkdir $D
	cp -r $UMD $D
	cp $BAKPKG $PKG
	sed -i '' 's/"main": "index.js"/"main": "main.js"/g' $PKG
done
