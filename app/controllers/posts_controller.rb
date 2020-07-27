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

#   if @post.save
    if @post.replace

      if request.xhr?
        render json: {success: true, location: url_for(@post)}
      else
        redirect_to post_path(@post)
      end
    else
      render :new
    end
  end

  def update
    if @post.update(post_params)
      if request.xhr?
        render json: {success: true, location: url_for(@post)}
      else
        redirect_to post_path(@post)
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
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title)
  end
end
