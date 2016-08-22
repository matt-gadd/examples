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
	echo "fixing package.json: $PKG"
	sed -i '' 's/"main": "index.js"/"main": "main.js"/g' $PKG
	sed -i '' "s/\"typings\": \"\.\/dist\/umd\/$D\.d\.ts\"/\"typings\": \"$D.d.ts\"/g" $PKG
	for F in `find $D -name '*.js' -type f`
	do
		echo "fixing imports: $F"
		sed -i '' 's/maquette\/maquette/maquette/g' $F
		sed -i '' 's/immutable\/immutable/immutable/g' $F
	done
done
