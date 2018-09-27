test:
	@./node_modules/.bin/mocha test.js

lint:
	./node_modules/.bin/eslint *.js
	./node_modules/.bin/prettier *.js -l


lint-fix:
	./node_modules/.bin/eslint *.js --fix
	./node_modules/.bin/prettier *.js --write


.PHONY: test