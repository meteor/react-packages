const {
  List,
  ListItem,
  ListDivider,
  Avatar
} = mui;

Leaderboard = React.createClass({
  propTypes: {
    selectedPlayerId: React.PropTypes.string,
    players: React.PropTypes.array.isRequired,
    onPlayerSelected: React.PropTypes.func
  },
  selectPlayer(playerId) {
    this.props.onPlayerSelected(playerId);
  },
  render() {
    return <List>{
      this.props.players.map((player) => {
        let style = {};
        if (this.props.selectedPlayerId === player._id) {
          style["backgroundColor"] = "#eee";
        }

        return [
          <ListItem key={ player._id }
            primaryText={ player.name }
            onClick={ this.selectPlayer.bind(this, player._id) }
            leftAvatar={ <Avatar src={ "/" + player.name + ".png" }/> }
            secondaryText={ "Current score: " + player.score }
            style={style}/>,
          <ListDivider/>
        ]
      })
    }</List>
  }
});
