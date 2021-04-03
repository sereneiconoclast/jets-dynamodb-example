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


function Post(post) {
  const createdAt = new Date();
  createdAt.setTime(post.created_at * 1000);
  return (
    <div className="post">
      <p>
        <strong>{post.title}</strong> {' '}
        (created <ReactTimeAgo date={createdAt} locale="en-US"/> {' '}
        at {createdAt.toISOString()})
      </p>
      <pre>{post.body}
      </pre>
    </div>
  );
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

  render() {
    const { error, isLoaded, posts } = this.state;
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    } else {
      const postComponents = posts.map((post) =>
        <li key={post.id}>{Post(post)}</li>
      );
      return (
        <ul>{postComponents}</ul>
      );
    }
  }
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
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
