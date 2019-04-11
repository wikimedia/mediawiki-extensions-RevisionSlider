# Selenium tests

For more information see https://www.mediawiki.org/wiki/Selenium/Node.js and
[PATH]/mediawiki/vagrant/mediawiki/tests/selenium/README.md.

## Setup

Set up MediaWiki-Vagrant:

    cd [PATH]/mediawiki/vagrant/mediawiki/extensions/RevisionSlider
    vagrant up
    vagrant roles enable revisionslider
    vagrant provision
    npm install

Chromedriver has to run in one terminal window:

    chromedriver --url-base=wd/hub --port=4444

## Run all specs

In another terminal window:

    npm run selenium-test

## Run specific tests

Filter by file name:

    npm run selenium-test -- --spec tests/selenium/specs/[FILE-NAME].js

Filter by file name and test name:

    npm run selenium-test -- --spec tests/selenium/specs/[FILE-NAME.js] --mochaOpts.grep [TEST-NAME]
