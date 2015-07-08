// @jsx React.DOM

PlayerList = React.createClass({
  propTypes: {
    players: React.PropTypes.array.isRequired
  },

  setSelectedPlayer(id) {
    Session.set("selectedPlayer", id);
  },

  getSelectedPlayer() {
    return Session.get("selectedPlayer");
  },

  render() {
    return (
     <ul className="leaderboard">
       {
         this.props.players.map((player) => {
           return (
             <PlayerItem
               key={ player._id }
               getSelectedPlayer={ this.getSelectedPlayer }
               setSelectedPlayer={ this.setSelectedPlayer }
               player={player} />
           );
         })
       }
     </ul>
    );
  }
});


PlayerItem = React.createClass({
  handleClick() {
    var playerId = this.props.player._id;
    this.props.setSelectedPlayer(playerId);
  },

  getClassName() {
    var selectedId = this.props.getSelectedPlayer();
    var playerId = this.props.player._id;

    return (selectedId === playerId) ? 'player selected' : 'player';
  },

  render() {
    var player = this.props.player;

    return (
      <li className={ this.getClassName() } onClick={ this.handleClick }>
        <span className="name">{ player.name }</span>
        <span className="score">{ player.score }</span>
      </li>
    );
  }
});

