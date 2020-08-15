require 'active_model/conversion'
require 'active_model/naming' # ActiveModel::Name
require 'securerandom'

class ApplicationItem
  @dynamodb_config = YAML.load(File.read(
    "#{Jets.root}/config/dynamodb.yml"
  ))
  @dynamodb_endpoint = @dynamodb_config[Jets.env]['endpoint']
  @dynamodb_client = if @dynamodb_endpoint
    Aws::DynamoDB::Client.new endpoint: @dynamodb_endpoint
  else
    Aws::DynamoDB::Client.new
  end

  def self.inherited(child_class)
    child_class.include(Aws::Record)

    child_class.configure_client(client: @dynamodb_client)

    # Recommended DynamoDB design: one table for
    # the entire application
    # See https://www.youtube.com/watch?v=HaEPXoXVf2k
    child_class.set_table_name(Jets.project_namespace)
  end

  # ActiveRecord's #all equates to Aws::Record's #scan
  class << self
    def all(*args, &blk)
      scan(*args, &blk)
    end
  end

  def ==(other)
    return true if equal?(other)
    return false unless self.class == other.class
    to_h == other.to_h
  end

  def hash
    # to_h returns a Hash which we're allowed to modify (it's a copy)
    to_h.tap {|h| h[Class] = self.class}.hash
  end

  def model_name
    ActiveModel::Name.new(self.class)
  end

  def generate_id(field: :id)
    public_send("#{field}=", SecureRandom.uuid)
  end

  def generate_creation_timestamp(field: :created_at)
    public_send("#{field}=", Time.now)
  end

  # This assumes #generate_id won't produce any underscores
  def compound_key
    "#{id}_#{created_at.to_i}"
  end

  def self.split_compound_key(compound_key)
    id, epoch_seconds_str = compound_key.split('_')
    raise "Illegal compound key: #{compound_key}" unless /^\d+$/.match(epoch_seconds_str)
    return id, Time.at(epoch_seconds_str.to_i)
  end

  # To allow UrlHelper#url_for to work
  include ActiveModel::Conversion

  def to_key
    [compound_key]
  end

  def to_param
    compound_key
  end

  def destroy; delete! end
end
