class Post < ApplicationItem
  partition_key "id"
  # sort_key "created_at"

  column :id, :title, :body
end
