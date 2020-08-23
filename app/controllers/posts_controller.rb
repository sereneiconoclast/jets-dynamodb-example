class PostsController < ApplicationController
  before_action :set_post, only: [:show, :edit, :update, :delete]

  def index
    @posts = Post.all
  end

  def show
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

    if @post.save
      if request.xhr?
        render json: {success: true, location: stage_aware_post_path(request)}
      else
        redirect_to stage_aware_post_path(request)
      end
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      if request.xhr?
        render json: {success: true, location: stage_aware_post_path(request)}
      else
        redirect_to stage_aware_post_path(request)
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
  end

  def post_params
    params.require(:post).permit(:title, :body)
  end

  # If the API Gateway stage is now, prepend it
  def stage_aware_post_path request
    leaf_path = post_path(@post)
    stage = request.env['lambda.event']['requestContext']['stage']
    stage ? "/#{stage}#{leaf_path}" : leaf_path
  end
end
