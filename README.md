# Website for Scala.js

This is the source code for the Scala.js website at
[http://www.scala-js.org/](http://www.scala-js.org/).

If you intended to look at the Scala.js source code itself,
you can find it here: [github.com/scala-js/scala-js](https://github.com/scala-js/scala-js).

# Contributing

The key to contributing is being able to edit and
preview your content. [Your pull requests are welcome](https://github.com/scala-js/scala-js-website/compare)!

## Set up
As this website is built with [Jekyll](http://jekyllrb.com/),
we will need to set up some Ruby tooling.

First, install RVM (Ruby Version Manager): https://rvm.io/rvm/install
Then run the following commands:
```bash
$ rvm use 2.4.4 --install

# Set up Bundler, a Ruby package manager
# It downloads dependencies specified in a Gemfile
# but into a local path unlike gem 
$ gem install bundler
 # and if this fails, try installing libffi first (distro-specific):
 # sudo apt install libffi-dev

# Install dependencies such as Jekyll and its plugins:
$ bundle install

# Do a full build:
$ bundle exec jekyll build
```

## Editing live
This is what you would do after initial installation:
```bash
$ bundle exec jekyll serve --watch
```
