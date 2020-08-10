require 'active_model'
require 'active_model/validations'

class Post < ApplicationItem
  include ActiveModel::Validations

  string_attr :id, hash_key: true
  epoch_time_attr :created_at, range_key: true
  string_attr :title
  string_attr :body
  validates_presence_of :body
end
