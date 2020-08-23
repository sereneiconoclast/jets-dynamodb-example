source "https://rubygems.org"

gem "jets"
#gem "dynomite"
gem 'aws-record', '~> 2.0' # https://github.com/aws/aws-sdk-ruby-record

# Include mysql2 gem if you are using ActiveRecord, remove if you are not
# gem "mysql2", "~> 0.5.2"

gem 'jetpacker' # https://github.com/tongueroo/jetpacker
# gem 'webpacker-jets'
# gem 'webpacker', git: 'https://github.com/tongueroo/webpacker.git'
# yarn add https://github.com/tongueroo/webpacker.git

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'pry'
  gem 'pry-byebug'
  gem 'shotgun'
  gem 'rack'
end

group :test do
  gem 'rspec' # rspec test group only or we get the "irb: warn: can't alias context from irb_context warning" when starting jets console
  gem 'launchy'
  gem 'capybara'
end
