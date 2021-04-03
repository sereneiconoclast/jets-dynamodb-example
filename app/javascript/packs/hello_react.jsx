import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      post_id: props.post_id,
      post: null,
    };
  }

  componentDidMount() {
    fetch("http://toy.infinitequack.net:8888/posts/" + this.state.post_id + "?xhr=true")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            post: result.object
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
    const { error, isLoaded, post } = this.state;
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div>Error: {error.message}</div>;
    } else {
      const createdAt = new Date();
      createdAt.setTime(post.created_at * 1000);
      return (
	<div>
	  <p>
	    <strong>Title:</strong> {post.title} (created {createdAt.toISOString()})
	  </p>
	  <pre>{post.body}
	  </pre>
	  <pre>{JSON.stringify(post, null, 4)}
	  </pre>
	</div>
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
    <Post post_id={"5fd12341-cee0-4dbd-8e5e-576918920fc8_1616983908"}/>,
    document.getElementById('react-root')
  );
  console.log("DOMContentLoaded goes to sleep for another century");
})
