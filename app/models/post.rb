class Post < ApplicationItem
  string_attr :id, hash_key: true
  string_attr :created_at, range_key: true
  string_attr :title
  string_attr :body
end
