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


function Post(post, onDelete) {
  const createdAt = new Date();
  createdAt.setTime(post.created_at * 1000);
  return (
    <div className="post">
      <p>
        <strong>{post.title}</strong> {' '}
        (created <ReactTimeAgo date={createdAt} locale="en-US"/> {' '}
        at {createdAt.toISOString()}) {' '}
        <button onClick={onDelete}>Delete</button>
      </p>
      <pre>{post.body}
      </pre>
    </div>
  );
}

class NewPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app: props.app,
      open: false,
      title: '',
      body: ''
    };
  }

  handlePost() {
    const post = {post: {title: this.state.title, body: this.state.body}};
    console.log("Posting " + JSON.stringify(post, null, 4));

    fetch('http://toy.infinitequack.net:8888/posts?xhr=true', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    }).then(res => res.json())
      .then(
        (result) => {
          console.log('Post response: ' + JSON.stringify(result, null, 4));
          this.setState({open: false, title: '', body: ''});
          this.state.app.refresh();
        },
        (error) => {
          alert("Post failed: " + error);
        }
      );
  }

  newPostOrCancelButton(newIsOpen) {
    const text = newIsOpen ? 'Compose new post' : 'Cancel';
    const onClick = () => {this.setState({open: newIsOpen})}
    return <button onClick={onClick}>{text}</button>;
  }

  render() {
    const { open, title, body } = this.state;
    if (!open) {
      return this.newPostOrCancelButton(true);
    }
    return (
      <div className="newPost">
        <p><input id="newPostTitle" type="text" value={this.state.title} onInput={(e) => {this.setState({title: e.target.value})}} /></p>
        <p><textarea id="newPostBody" value={this.state.body} onInput={(e) => {this.setState({body: e.target.value})}} /></p>
        <p>Preview:</p>
        <p><strong>{this.state.title}</strong></p>
        <pre>{this.state.body}
        </pre>
        <button onClick={() => {this.handlePost()}}>Post</button>
        {this.newPostOrCancelButton(false)}
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
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    this.setState({
      isLoaded: false
    });
    fetch("http://toy.infinitequack.net:8888/posts?xhr=true")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            posts: result.posts
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  deletePostRequest(post) {
    var sure = confirm("Delete post with title '" + post.title + "'?");
    if (sure) {
      fetch('http://toy.infinitequack.net:8888/posts/' + post.compound_key + '?xhr=true', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      }).then(res => res.json())
        .then(
          (result) => {
            console.log('Delete post response: ' + JSON.stringify(result, null, 4));
            this.hidePost(post.compound_key);
          },
          (error) => {
            alert("Post deletion failed: " + error);
          }
        );
    } else {
      console.log("Deletion cancelled");
    }
  }

  hidePost(postKey) {
    alert("Looking to hide post " + postKey);
    const newPosts = this.state.posts.slice(); // i.e. dup
    const index = newPosts.findIndex(element => element.compound_key == postKey);
    if (index == -1) {
      alert("Unexpected: We have no post with ID " + postKey);
    } else {
      alert("Looking to hide post number " + index);
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
    } else {
      const postComponents = posts.map((post) =>
        <li key={post.compound_key}>{Post(post, e =>{this.deletePostRequest(post)})}</li>
      );
      return (
        <div className="PostApp">
          <ul>{postComponents}</ul>
          <NewPost app={this} />
          <button onClick={() => {this.refresh()}}>Refresh</button>
        </div>
      );
    }
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
    };
  }

  handleClick(i) {
    const new_squares = this.state.squares.slice();
    if (calculateWinner(new_squares) || new_squares[i]) {
      return;
    }
    new_squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({squares: new_squares, xIsNext: !this.state.xIsNext});
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  render() {
    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}


// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded kicks into high gear");
  ReactDOM.render(
    <PostApp/>,
    document.getElementById('react-root')
  );
  console.log("DOMContentLoaded goes to sleep for another century");
})
