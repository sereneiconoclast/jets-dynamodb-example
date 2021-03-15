Jets.application.configure do
  config.project_name = "demo"
  config.mode = "api"

  config.prewarm.enable = true # default is true
  # config.prewarm.rate = '30 minutes' # default is '30 minutes'
  # config.prewarm.concurrency = 2 # default is 2
  # config.prewarm.public_ratio = 3 # default is 3

  # config.env_extra = 2 # can also set this with JETS_ENV_EXTRA
  # config.extra_autoload_paths = []
  config.autoload_paths = []
  # config.asset_base_url = 'https://cloudfront.domain.com/assets' # example

  # config.cors = true # for '*'' # defaults to true
  # config.cors = '*.mydomain.com' # for specific domain

  # config.function.timeout = 30 # defaults to 30
  # config.function.role = "arn:aws:iam::#{Jets.aws.account}:role/service-role/pre-created"
  # config.function.memory_size = 1536

  # config.api.endpoint_type = 'PRIVATE' # Default is 'EDGE' (https://docs.aws.amazon.com/apigateway/api-reference/link-relation/restapi-create/#endpointConfiguration)

  # config.function.environment = {
  #   global_app_key1: "global_app_value1",
  #   global_app_key2: "global_app_value2",
  # }
  # More examples:
  # config.function.dead_letter_queue = { target_arn: "arn" }
  # config.function.vpc_config = {
  #   security_group_ids: [ "sg-1", "sg-2" ],
  #   subnet_ids: [ "subnet-1", "subnet-2" ]
  # }
  # The config.function settings to the CloudFormation Lambda Function properties.
  # http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lambda-function.html
  # Underscored format can be used for keys to make it look more ruby-ish.

  # Assets settings
  # The config.assets.folders are folders within the public folder that will be set
  # to public-read on s3 and served directly. IE: public/assets public/images public/packs
  # config.assets.folders = %w[assets images packs]
  # config.assets.max_age = 3600 # when to expire assets
  # config.assets.cache_control = nil # IE: "public, max-age=3600" # override max_age for more fine-grain control.
  # config.assets.base_url = nil # IE: https://cloudfront.com/my/base/path, defaults to the s3 bucket url
  #                                IE: https://s3-us-west-2.amazonaws.com/demo-dev-s3bucket-1inlzkvujq8zb

  # config.api.endpoint_type = 'PRIVATE' # Default is 'EDGE' https://amzn.to/2r0Iu2L
  # config.api.authorization_type = "AWS_IAM" # default is 'NONE' https://amzn.to/2qZ7zLh

  config.domain.hosted_zone_name = "my-cool-domain-name.com"
  config.domain.name = "#{config.project_name}.#{config.domain.hosted_zone_name}"

  # This should not be required if the "origin" custom header is supplied by CloudFront
  # Look for "Origin Custom Header" in the Origin's definition, and define Header Name 'origin'
  # config.app.domain = config.domain.name

  # us-west-2 REGIONAL endpoint
  # config.domain.cert_arn = "arn:aws:acm:us-west-2:112233445566:certificate/8d8919ce-a710-4050-976b-b33da991e123"
  # us-east-1 EDGE endpoint
  # config.domain.cert_arn = "arn:aws:acm:us-east-1:112233445566:certificate/d68472ba-04f8-45ba-b9db-14f839d57123"
  # config.domain.endpoint_type = "EDGE"

  # Jets tries to populate the CNAME #{config.domain.name}
  # If pointing this CNAME at CloudFront, Jets knows nothing about that
  config.domain.route53 = false # Prevent Route53 from being managed by Jets

  dynamodb = config.dynamodb = ActiveSupport::OrderedOptions.new
  dynamodb.yaml = YAML.load(
    ERB.new(
      File.read("#{Jets.root}/config/dynamodb.yml")
    ).result(binding)
  )
  dynamodb.endpoint = ENV['DYNAMODB_ENDPOINT'] ||
    dynamodb.yaml[Jets.env]&.fetch('endpoint')
  dynamodb.client = if dynamodb.endpoint
    Aws::DynamoDB::Client.new endpoint: dynamodb.endpoint
  else
    Aws::DynamoDB::Client.new
  end

  # Recommended DynamoDB design: one table for
  # the entire application
  # See https://www.youtube.com/watch?v=HaEPXoXVf2k
  #  or https://www.youtube.com/watch?v=6yqfmXiZTlM
  dynamodb.table_name = Jets.project_namespace

  config.iam_policy = [
    Jets::Application.default_iam_policy,
    {
      action: ["dynamodb:*"],
      effect: "Allow",
      resource: "arn:aws:dynamodb:#{Jets.aws.region}:#{Jets.aws.account}:table/#{dynamodb.table_name}",
    }
  ]
  config.controllers.default_protect_from_forgery = false
end
