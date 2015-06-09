// @jsx React.DOM

Leaderboard = React.createClass({
  propTypes: {
    selectedPlayerId: React.PropTypes.string,
    players: React.PropTypes.array.isRequired
  },
  render() {
    var self = this;

    return <ul className="leaderboard">{
      this.props.players.map((player) => {
        var className = "player";
        if (this.props.selectedPlayerId === player._id) {
          className += " selected";
        }

        return <li className={ className } key={ player._id } onClick={() => {
          Session.set("selectedPlayer", player._id);
        }}>
          <span className="name">{ player.name }</span>
          <span className="score">{ player.score }</span>
        </li>
      })
    }</ul>
  }
})