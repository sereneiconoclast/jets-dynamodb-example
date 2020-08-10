Jets.application.routes.draw do
  get  'posts', to: 'posts#index'

  # The below does not work...
  #
  # get  'posts/:id/:created_at', to: 'posts#show'
  #
  # ...due to this code in Jets::Router::MethodCreator::Show:
  #
  # def meth_name
  #   path_items = @path.to_s.split('/')
  #   if method_name_leaf && path_items.size != 2
  #     nil # fallback: do not define url method
  #
  # Therefore we must artificially combine the hash and range portions of the key,
  # and artificially split them apart
  get  'posts/:compound_key', to: 'posts#show'

  get  'posts/new', to: 'posts#new'

# get  'posts/:id/:created_at/edit', to: 'posts#edit'
  get  'posts/:compound_key/edit', to: 'posts#edit'

  post 'posts', to: 'posts#create'
  put  'posts/:compound_key', to: 'posts#update'
  delete  'posts', to: 'posts#delete'

  # The jets/public#show controller can serve static utf8 content out of the public folder.
  # Note, as part of the deploy process Jets uploads files in the public folder to s3
  # and serves them out of s3 directly. S3 is well suited to serve static assets.
  # More info here: http://rubyonjets.com/docs/assets-serving/
  any "*catchall", to: "jets/public#show"
# root "jets/public#show"
end
