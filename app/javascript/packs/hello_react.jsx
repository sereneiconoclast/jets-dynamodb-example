import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// https://www.npmjs.com/package/react-time-ago
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
// import ru from 'javascript-time-ago/locale/ru'
TimeAgo.addDefaultLocale(en)
// TimeAgo.addLocale(ru)
import ReactTimeAgo from 'react-time-ago'

const thisPageUrl = window.location.href;
const standardPostHeaders = {
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json'
}

function Post(post, onEdit, onDelete) {
  const createdAt = new Date();
  createdAt.setTime(post.created_at * 1000);
  return (
    <div className="post">
      <p>
        <strong>{post.title}</strong> {' '}
        (created <ReactTimeAgo date={createdAt} locale="en-US"/> {' '}
        at {createdAt.toISOString()}) {' '}
        <button onClick={onEdit}>Edit</button> {' '}
        <button onClick={onDelete}>Delete</button>
      </p>
      <pre>{post.body}
      </pre>
    </div>
  );
}

class ComposePost extends React.Component {
  constructor(props) {
    super(props);
    const postPath = props.editingPostKey ? ('/' + props.editingPostKey) : '';
    this.state = {
      title: (props.title || ''),
      body: (props.body || ''),
      editingPostKey: props.editingPostKey,
      postUrl: thisPageUrl + postPath + '?xhr=true',
      postMethod: (props.editingPostKey ? 'PUT' : 'POST'),
      onClose: props.onClose,
      onRefresh: props.onRefresh
    };
  }

  handlePost() {
    const post = {post: {title: this.state.title, body: this.state.body}};
    console.log(this.state.postMethod + ' ' + JSON.stringify(post, null, 4) + ' to ' + this.state.postUrl);

    fetch(this.state.postUrl, {
      method: this.state.postMethod,
      headers: standardPostHeaders,
      body: JSON.stringify(post)
    }).then(res => res.json())
      .then(
        (result) => {
          console.log(this.state.postMethod + ' response: ' + JSON.stringify(result, null, 4));
          this.setState({title: '', body: ''});
          this.state.onClose();
          this.state.onRefresh();
        },
        (error) => {
          alert(this.state.postMethod + ' failed: ' + error);
        }
      );
  }

  render() {
    const { title, body } = this.state;
    return (
      <div className="newPost">
        <p><input id="newPostTitle" type="text" value={this.state.title} onInput={(e) => {this.setState({title: e.target.value})}} /></p>
        <p><textarea id="newPostBody" value={this.state.body} onInput={(e) => {this.setState({body: e.target.value})}} /></p>
        <p>Preview:</p>
        <p><strong>{this.state.title}</strong></p>
        <pre>{this.state.body}
        </pre>
        <button onClick={() => {this.handlePost()}}>Post</button> {' '}
        <button onClick={() => {this.state.onClose()}}>Cancel</button>
      </div>
    );
  }
}

class PostApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      posts: [],
      composingPost: false,
      editingPostKey: null
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.setState({isLoaded: false});
    fetch(thisPageUrl + '?xhr=true')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({isLoaded: true, posts: result.posts});
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({isLoaded: true, error});
        }
      )
  }

  deletePostRequest(post) {
    var sure = confirm("Delete post with title '" + post.title + "'?");
    if (sure) {
      fetch(thisPageUrl + '/' + post.compound_key + '?xhr=true', {
        method: 'DELETE',
        headers: standardPostHeaders,
        body: JSON.stringify(post)
      }).then(res => res.json())
        .then(
          (result) => {
            console.log('Delete post response: ' + JSON.stringify(result, null, 4));
            this.hidePost(post.compound_key);
          },
          (error) => {
            alert('Post deletion failed: ' + error);
          }
        );
    } else {
      console.log('Deletion cancelled');
    }
  }

  hidePost(postKey) {
    const newPosts = this.state.posts.slice(); // i.e. dup
    const index = newPosts.findIndex(element => element.compound_key == postKey);

    if (index == -1) {
      alert('Unexpected: We have no post with ID ' + postKey);
    } else {
      newPosts.splice(index, 1); // remove 1 element
      this.setState({posts: newPosts});
    }
  }

  render() {
    const { error, isLoaded, posts } = this.state;
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    }

    const postComponents = posts.map(post => {
      const editingThis = post.compound_key == this.state.editingPostKey;

      const listElement = editingThis ?
        <ComposePost
          title={post.title}
          body={post.body}
          editingPostKey={post.compound_key}
          onClose={() => {this.setState({editingPostKey: null})}}
          onRefresh={() => {this.refresh()}}/> :
        Post(post, e => {this.setState({editingPostKey: post.compound_key})}, e => {this.deletePostRequest(post)});

      const liKey = (editingThis ? 'edit ' : 'show ') + post.compound_key;

      return(<li key={liKey}>{listElement}</li>);
    });

    const newPostComponent = this.state.composingPost ?
      <ComposePost onClose={() => {this.setState({composingPost: false})}} onRefresh={() => {this.refresh()}} /> :
      <button onClick={() => {this.setState({composingPost: true})}}>Compose new post</button>;

    return (
      <div className="PostApp">
        <ul>{postComponents}</ul>
        {newPostComponent} {' '}
        <button onClick={() => {this.refresh()}}>Refresh</button>
      </div>
    );
  }
}


// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded kicks into high gear');
  ReactDOM.render(
    <PostApp/>,
    document.getElementById('react-root')
  );
  console.log('DOMContentLoaded goes to sleep for another century');
})
