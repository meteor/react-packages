const {
  RaisedButton,
  Styles
} = mui;
const ThemeManager = Styles.ThemeManager;

App = React.createClass({
  mixins: [ReactMeteorData],
  getInitialState: function () {
    return {
      selectedPlayerId: null  
    };
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getMuiTheme(Styles.LightRawTheme)
    };
  },
  getMeteorData() {
    return {
      players: Players.find({}, { sort: { score: -1, name: 1 } }).fetch(),
      selectedPlayer: Players.findOne(this.state.selectedPlayerId)
    }
  },
  selectPlayer(playerId) {
    this.setState({
      selectedPlayerId: playerId
    });
  },
  addPointsToPlayer(playerId) {
    Players.update(playerId, {$inc: {score: 5}});
  },
  getBottomBar() {
    return this.state.selectedPlayerId
      ? (
        <div className="details">
          <div className="name">{this.data.selectedPlayer.name}</div>
          <RaisedButton
            onClick={this.addPointsToPlayer.bind(
              this, this.state.selectedPlayerId)}
            style={{float: "right"}}
            label="Add 5 points"
            primary={true}/>
        </div>
        )
      : <div className="message">Click a player to select</div>;
  },
  render() {
    return (
      <div className="outer">
        <div className="logo"></div>
        <h1 className="title">Leaderboard</h1>
        <div className="subtitle">Select a scientist to give them points</div>
        <Leaderboard players={this.data.players}
          selectedPlayerId={this.state.selectedPlayerId}
          onPlayerSelected={this.selectPlayer} />
        {this.getBottomBar()}
      </div>
    )
  }
});
