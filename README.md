# Example DynamoDB Project with Aws::Record

[![BoltOps Badge](https://img.boltops.com/boltops/badges/boltops-badge.png)](https://www.boltops.com)

Fork of tongueroo/jets-dynamodb-example, an example project in answer to this question: [Running rspec over dynomite model with local dynamodb instance results in MissingCredentialsError](https://community.rubyonjets.com/t/running-rspec-over-dynomite-model-with-local-dynamodb-instance-results-in-missingcredentialserror/31/2)

This fork uses [Aws::Record](https://github.com/aws/aws-sdk-ruby-record) instead of Dynomite. The aim is to make the model object ActiveModel compatible, so it will behave like ActiveRecord objects do under Rails.

## Recommended setup

First, get yourself an EC2 box and try it out locally. Install DynamoDB-Local. See the [Amazon AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) and the [Jets docs](https://github.com/tongueroo/jets/wiki/Dynamodb-Local-Setup-Walkthrough) on this. I start up the server with this short script:

```
#!/bin/bash
cd $HOME/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

You can test it like this: `aws dynamodb list-tables --endpoint-url http://localhost:8000` To start with, of course, this will be an empty list.

Now create the DynamoDB table:

```
DYNAMODB_ENDPOINT=http://localhost:8000 jets dynamodb:migrate dynamodb/migrate/20190106175741-create_posts_migration.rb
```

It should now show up in the list of tables in DynamoDB-Local.

I'm setting the database name to `Jets.project_namespace`, producing a table name like "demo-dev", a concatenation of the project name and the Jets environment name. There should only be one table, according to recommendations from AWS, with everything in it. Different types of objects should be distinguished by different primary keys. I'm not a DynamoDB expert, but I once watched a [YouTube Video](https://www.youtube.com/watch?v=HaEPXoXVf2k) of a talk given by one.

Here's the script I use to start the local Jets server:

```
#!/bin/bash
cd $HOME/jets/jets-dynamodb-example
bundle exec jets webpacker:compile
DYNAMODB_ENDPOINT=http://localhost:8000 bundle exec jets server --host 0.0.0.0
```

(These startup scripts are meant to be run under a console multiplexer such as `screen` or `tmux`, but if you direct the output to a file, they can instead be placed in `/var/lib/cloud/scripts/per-boot/` on an EC2 box to run them automatically on startup.)

If you're running this on an EC2 box, remember that you'll need to modify the security group to allow inbound TCP connections on port 8888. Then try accessing the server via its IP address, like: `http://111.222.333.444:8888/posts` You should be able to create, modify, and delete posts.

To get this running in AWS proper, select a region as your default in `~/.aws/config`. Optionally select a regional endpoint for DynamoDB in the `production` section of `config/dynamodb.yml`. Then rerun the `dynamodb:migrate` command from before, but without the `DYNAMODB_ENDPOINT` variable. This should create the table in the real DynamoDB, which you can confirm via the AWS Console. You can also use the AWS CLI to confirm it, as before: `aws dynamodb list-tables`

Next, run `jets deploy`. You can follow along with its progress in the CloudFormation console. When it's finished, you should have new resources in S3 (note the bucket name), Lambda, and API Gateway. It should be possible to access an API Gateway URL associated with the "dev" stage, like `https://abcdef1234.execute-api.us-west-2.amazonaws.com/dev/posts`, and again, it should be possible to create, update, and delete posts.

When you're ready to use a custom domain, first establish it through Route53, and create a certificate in Certificate Manager to use on the site. Then create a CloudFront Distribution via the Console UI, filling in Alternate Domain Names (CNAMEs) and the SSL Certificate. Specify the Default Root Object as `index.html`. Establish two Origins:

* The S3 bucket, with Origin Path `/jets/public`
* The API Gateway, with:
  * Origin Domain Name `https://abcdef1234.execute-api.us-east-1.amazonaws.com` (supply your own)
  * Origin Path `/dev`
  * An Origin Custom Header "origin" whose value is the custom domain name

Create _three_ Behaviors:

1. `posts`
1. `posts/*`
1. `*`

This ensures that hitting either `.../posts` or `.../posts/` will work. Hitting the root of the domain (no path) should render `/jets/public/index.html` from the S3 bucket.

For the two API Gateway behaviors, ensure "Allowed HTTP Methods" is set to permit PUT / POST / PATCH / DELETE. Select Cache Policy "Managed-CachingDisabled", and for Origin Request Policy, create a new one called "Include-query-string" with Headers=None, Cookies=None, and Query Strings=All. It should again be possible to list, create, update, and delete posts, this time via the custom domain (with no /dev prefix).

**Note:** I spent some time fighting with CloudFront, trying to get it to forward various headers to the API Gateway... especially `HTTP_X_REQUESTED_WITH`, as the Jets code expects AJAX requests to arrive with `HTTP_X_REQUESTED_WITH=XMLHttpRequest`. I kept running into 403 errors: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests." Unable to find the magic configuration that would make CloudFront pass everything through transparently, I eventually worked around it in `crud.js` by adding `?xhr=true` to the AJAX requests, and tweaking `Rack::Request::Helpers#xhr?` to look for this. Hence the need to pass query strings through.

## Some Tips (unchanged from tongueroo's upstream repository)

Recommend creating a `dynamodb-local` IAM user. The tools like https://github.com/aaronshaf/dynamodb-admin assume you have `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` setup. For the IAM User permission give it *nothing*, it doesn't need any actual IAM permissions. Looks like Jets is calling out to get the AWS account id in some cases too. Know it's a little silly to create an IAM user for this, but dynamodb-local creates a DB on your filesystem that includes the AWS_ACCESS_KEY_ID in the DB name. It looks something like this.

    $ ls /usr/local/Caskroom/dynamodb-local/latest/*.db
    /usr/local/Caskroom/dynamodb-local/latest/your-aws-secret-access-key_us-west-2.db
    $

Make sure as you are creating the dynamodb tables both in `JETS_ENV=development` and `JETS_ENV=test` that it's writing to the same `your-aws-secret-access-key_us-west-2.db` file.

## A mild warning

I created this fork by crashing around in the code until everything appeared to work. Correctness has not been proven. It appears to allow creates, updates, and deletes through the UI. This works when talking directly to the API Gateway, and when going through the custom domain.

The challenge has been ensuring that the stage prefix ('/dev' by default) is added to any URL, exactly once, in any code path which assembles a URL. Deciding whether to add the stage or not is based on the host name: If it contains "amazonaws.com" then `Jets::Controller::Stage` concludes it must add the stage. Not all code paths had access to `actual_host`, so I had to ensure this information was passed from the controller to the view.

## TODO

Solutions to the issues that required me to monkey-patch Jets code.

More sophisticated example, with a table containing two data types. Note, this should be cleaner to implement now that we have [this feature](https://github.com/aws/aws-sdk-ruby-record/pull/108).
