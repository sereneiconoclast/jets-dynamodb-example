class ApplicationItem
  @dynamodb_config = YAML.load(File.read(
    "#{Jets.root}/config/dynamodb.yml"
  ))
  @dynamodb_endpoint = @dynamodb_config[Jets.env]['endpoint']
  @dynamodb_client = Aws::DynamoDB::Client.new endpoint: @dynamodb_endpoint

  def self.inherited(child_class)
    child_class.include(Aws::Record)

    child_class.configure_client(client: @dynamodb_client)

    # Recommended DynamoDB design: one table for
    # the entire application
    # See https://www.youtube.com/watch?v=HaEPXoXVf2k
    child_class.set_table_name("post-application")
  end

  # ActiveRecord's #all equates to Aws::Record's #scan
  class << self
    def all(*args, &blk)
      scan(*args, &blk)
    end
  end

  # To allow UrlHelper#url_for to work
# def to_model; self end
end
