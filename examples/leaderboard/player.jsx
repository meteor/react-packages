// @jsx React.DOM

PlayerList = React.createClass({
  propTypes: {
    selectedPlayerId: React.PropTypes.string,
    players: React.PropTypes.array.isRequired
  },

  setSelectedPlayer(id) {
    Session.set("selectedPlayer", id);
  },

  render() {
    return (
     <ul className="leaderboard">
       {
         this.props.players.map((player) => {
           return (
             <PlayerItem
               key={ player._id }
               selectedPlayerId={ this.props.selectedPlayerId }
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
    var selectedId = this.props.selectedPlayerId;
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

