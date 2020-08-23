# Example DynamoDB Project with Aws::Record

[![BoltOps Badge](https://img.boltops.com/boltops/badges/boltops-badge.png)](https://www.boltops.com)

Fork of tongueroo/jets-dynamodb-example, an example project in answer to this question: [Running rspec over dynomite model with local dynamodb instance results in MissingCredentialsError](https://community.rubyonjets.com/t/running-rspec-over-dynomite-model-with-local-dynamodb-instance-results-in-missingcredentialserror/31/2)

This fork uses [Aws::Record](https://github.com/aws/aws-sdk-ruby-record) instead of Dynomite.

## Some Tips (unchanged from tongueroo's upstream repository)

Recommend creating a `dynamodb-local` IAM user. The tools like https://github.com/aaronshaf/dynamodb-admin assume you have `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` setup. For the IAM User permission give it *nothing*, it doesn't need any actual IAM permissions. Looks like Jets is calling out to get the AWS account id in some cases too. Know it's a little silly to create an IAM user for this, but dynamodb-local creates a DB on your filesystem that includes the AWS_ACCESS_KEY_ID in the DB name. It looks something like this.

    $ ls /usr/local/Caskroom/dynamodb-local/latest/*.db
    /usr/local/Caskroom/dynamodb-local/latest/your-aws-secret-access-key_us-west-2.db
    $

Make sure as you are creating the dynamodb tables both in `JETS_ENV=development` and `JETS_ENV=test` that it's writing to the same `your-aws-secret-access-key_us-west-2.db` file.

## Another tip (new)

I'm setting the database name to `Jets.project_namespace`, producing a table name like "demo-dev", a concatenation of the project name and the Jets environment name. There should only be one table, according to recommendations from AWS, with everything in it. Different types of objects should be distinguished by different primary keys.

I'm not a DynamoDB expert, but I once watched a [YouTube Video](https://www.youtube.com/watch?v=HaEPXoXVf2k) of a talk given by one.

## A mild warning

I created this fork by crashing around in the code until everything appeared to work. Correctness has not been proven. It appears to allow creates, updates, and deletes through the UI.

## TODO

Get the unit test to pass again.
