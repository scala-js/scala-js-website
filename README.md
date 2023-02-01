# Website for Scala.js

This is the source code for the Scala.js website at
[http://www.scala-js.org/](http://www.scala-js.org/).

If you intended to look at the Scala.js source code itself,
you can find it here: [github.com/scala-js/scala-js](https://github.com/scala-js/scala-js).

# Contributing

The key to contributing is being able to edit and
preview your content. [Your pull requests are welcome](https://github.com/scala-js/scala-js-website/compare)!

## Set up

### With Docker

You need to have [Docker Engine](https://docs.docker.com/engine/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.
Under Mac OS (Intel or Apple silicon), instead of installing [Docker Desktop](https://docs.docker.com/desktop/) you can also use [HomeBrew](https://brew.sh/) with [Colima](https://github.com/abiosoft/colima): `brew install colima docker docker-compose`.
UID and GID environment variables are needed to avoid docker from writing files as root in your directory.

```
env UID="$(id -u)" GID="$(id -g)" docker-compose up
```

On Linux you may have to prefix that command with `sudo`, depending on your Docker setup.

The generated site is available at `http://localhost:4000`.

When the website dependencies change (the content of the `Gemfile`), you have to re-build the Docker image:

```
env UID="$(id -u)" GID="$(id -g)" docker-compose up --build
```

If you have problems with the Docker image or want to force the rebuild of the Docker image:

```
env UID="$(id -u)" GID="$(id -g)" docker-compose build --no-cache
```

### Manually with Ruby tooling

As this website is built with [Jekyll](http://jekyllrb.com/),
we will need to set up some Ruby tooling.

First, install RVM (Ruby Version Manager): https://rvm.io/rvm/install
Then run the following commands:
```bash
$ rvm use 2.7.5 --install

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

#### Editing live

This is what you would do after the initial installation:
```bash
$ bundle exec jekyll serve --watch
```
