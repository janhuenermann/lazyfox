mkdir tmp

rollup -c
uglifyjs lazyfox.js -o lazyfox.min.js

npx postcss css/lazyfox.css --config css/ -d tmp/
cleancss -o css/lazyfox.min.css tmp/lazyfox.css

rm -rf tmp