test:
	./node_modules/.bin/mocha --recursive test --reporter spec

bail:
	./node_modules/.bin/mocha --recursive test --bail --reporter spec

ci:
	./node_modules/.bin/mocha --recursive --watch test

docs-clean:
	rm -rf docs

docs: docs-clean
	./node_modules/.bin/dox-foundation --source lib --target docs --title Kanban

publish-docs: docs
	git stash	
	rm -rf /tmp/kanban-docs
	cp -R docs /tmp/kanban-docs
	git checkout gh-pages
	git pull origin gh-pages
	rm -rf docs
	cp -R /tmp/kanban-docs docs
	git add docs
	git add -u
	git commit -m "Updated docs"
	git push origin
	git checkout master
	git stash apply

jshint:
	find lib -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jshint
	find test -name "*.js" -print0 | xargs -0 ./node_modules/.bin/jshint

install-pre-commit:
	ln -s precommit.sh .git/hooks/pre-commit

.PHONY: test
