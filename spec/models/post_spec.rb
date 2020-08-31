describe Post do
  it "does CRUD operations" do
    post = Post.new(title: "my title", body: "my body")
    post.generate_id
    post.generate_creation_timestamp
    id = post.id
    created_at = post.created_at
    expect(post.to_h).to eq(title: "my title", body: "my body", id: id, created_at: created_at)
    expect(post.save).to be true

    created_at = created_at.to_i # this comes back as an integer

    load_post = Post.find id: post.id, created_at: post.created_at
    expect(load_post.to_h).to eq(title: "my title", body: "my body", id: id, created_at: created_at)

    expect(load_post.update(title: "my title2")).to be true
    expect(load_post.to_h).to eq(title: "my title2", body: "my body", id: id, created_at: created_at)

    load_post = Post.find id: post.id, created_at: post.created_at
    expect(load_post.to_h).to eq(title: "my title2", body: "my body", id: id, created_at: created_at)

    expect(load_post.destroy).to be true

    load_post = Post.find id: post.id, created_at: post.created_at
    expect(load_post).to be nil
  end
end
