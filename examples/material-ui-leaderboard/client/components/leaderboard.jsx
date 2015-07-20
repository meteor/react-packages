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
    let self = this;

    return <List>{
      this.props.players.map((player) => {
        let style = {};
        if (this.props.selectedPlayerId === player._id) {
          style["backgroundColor"] = "#eee";
        }

        return [
          <ListItem key={ player._id }
            primaryText={ player.name }
            onClick={ self.selectPlayer.bind(self, player._id) }
            leftAvatar={ <Avatar src={ "/" + player.name + ".png" }/> }
            secondaryText={ "Current score: " + player.score }
            style={style}/>,
          <ListDivider/>
        ]
      })
    }</List>
  }
});
