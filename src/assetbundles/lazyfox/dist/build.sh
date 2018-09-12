mkdir tmp

cd js
rollup -c
uglifyjs js/lazyfox.js -o js/lazyfox.min.js
cd ..

npx postcss css/lazyfox.css --config css/ -d tmp/
cleancss -o css/lazyfox.min.css tmp/lazyfox.css

rm -rf tmp