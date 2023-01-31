FROM ruby:2.7.5-bullseye

# We need Node.js for the `execjs` gem, used by `_plugins/tokenize.rb`
# Since it is a (sufficiently) standalone binary, we can just copy it from the node image.
# Note that both the ruby and node docker images are based off buildpack-deps so they have
# essentially the same base.
COPY --from=node:18.14-bullseye /usr/local/bin/node /usr/local/bin/node

RUN gem install bundler:2.3.10

WORKDIR /srv/jekyll

COPY Gemfile .
COPY Gemfile.lock .

RUN bundle install

# jekyll serve will listen to port 4000
EXPOSE 4000

# declare volumes for jekyll output
# Unfortunately jekyll 3.x isn't sufficiently configurable to not write to the
# output directory.
#
# The docker-compose file will ro mount the sources to /srv/jekyll,
# and then (implicitly) create anonymous volumes at these locations.
#
# A better approach (for jekyll 4.x) would be to set
# --destination to a different location and also set
# --disable-disk-cache to avoid creating .asset-cache.
VOLUME ["/srv/jekyll/.asset-cache", "/srv/jekyll/_site"]

CMD ["bundle", "exec", "jekyll", "serve", "--watch", "--host=0.0.0.0"]
