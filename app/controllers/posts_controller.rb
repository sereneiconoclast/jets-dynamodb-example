require 'rack/request'
$original_rack_request_xhr ||= Rack::Request::Helpers.instance_method(:xhr?)

# This is required because it's difficult to get CloudFront to pass the HTTP_X_REQUESTED_WITH
# header through. Trying to do this seems always to lead to 403 errors: "This distribution is not
# configured to allow the HTTP request method that was used for this request. The distribution
# supports only cachable requests." My workaround is to change the AJAX calls in crud.js to
# pass xhr=true in the query string. Configure CloudFront with an Origin Request Policy that
# allows the query string to pass through to API Gateway.

module Rack::Request::Helpers
  def xhr?
    original_result = $original_rack_request_xhr.bind(self).call
    return original_result || (params['xhr'] == 'true')
  end
end

# Some Jets code paths hit #add_stage_name without the actual_host. This does not allow us to
# distinguish whether we're hitting the API Gateway directly (requiring the stage prefix to be
# added) or through CloudFront (requiring NO stage prefix be added, since CloudFront will do
# that).

require 'jets/controller/rendering'

module Jets::Controller::Rendering
  def add_stage_name(url)
    Jets::Controller::Stage.add(@actual_host, url)
  end
end

require 'jets/overrides/rails/common_methods'

module Jets::CommonMethods
  def add_stage_name(url)
    Jets::Controller::Stage.add(@actual_host, url)
  end
end

class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :delete]
  before_action :set_actual_host

  def index
    @posts = Post.all.to_a
    if request.xhr?
      render json: {posts: @posts.map(&:to_json)}
    end
  end

  def show
    if request.xhr?
      render json: {post: @post.to_json}
    end
  end

  def new
    @post = Post.new
  end

  def edit
  end

  def create
    @post = Post.new(post_params)
    @post.generate_id
    @post.generate_creation_timestamp
    @its_post_path = post_path(@post)

    if @post.save
      if request.xhr? # Currently never happens; no handleCreate in crud.js
        render json: {success: true, location: add_stage_name(@its_post_path)}
      else
        redirect_to @its_post_path
      end
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      # Whether we add the stage name or not depends on the code path...
      if request.xhr?
        # Here we must call add_stage_name ourselves
        render json: {success: true, location: add_stage_name(@its_post_path)}
      else
        # redirect_to invokes add_stage_name itself!
        redirect_to @its_post_path
      end
    else
      render :edit
    end
  end

  def delete
    @post.destroy
    if request.xhr?
      render json: {success: true}
    else
      redirect_to posts_path
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_post
    # For DynamoDB, the key must be a Hash describing the DynamoDB key,
    # which includes a hash string and a range. Due to routing limitations,
    # only one key can be passed, so we artificially combine the two parts
    # of the key, and separate them again here.
    compound_key = params[:compound_key]
    id, created_at = ApplicationItem.split_compound_key(compound_key)
    @post = Post.find(id: id, created_at: created_at)
    @its_post_path = post_path(@post)
  end

  # Ensure the view has access to the same value we do
  def set_actual_host
    @actual_host = actual_host
  end

  def post_params
    params.require(:post).permit(:title, :body)
  end
end
