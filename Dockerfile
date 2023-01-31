FROM ruby:2.7.5

# We need Node.js for the `execjs` gem, used by `_plugins/tokenize.rb`
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs

RUN gem install bundler:2.3.10

WORKDIR /srv/jekyll

COPY Gemfile .
COPY Gemfile.lock .

RUN chmod u+s /bin/chown
RUN bundle install
