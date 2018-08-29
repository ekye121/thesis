import React from 'react';
import { Button, ProgressBar, Image } from 'react-bootstrap';
import { Query, Mutation } from 'react-apollo';

import { CREATE_MATCH } from '../apollo/mutations.js';
import { GET_ALL_USERS } from '../apollo/queries.js';
import CreateChallengeModal from './CreateChallengeModal.jsx';
import { matchmakeByElo, calcProbabilityOfWin} from '../../dist/js/index';
import SearchUsers from './SearchUsers.jsx';

class RecommendedOpponents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchedUsers: [],
      showMatch: false,
      matchClickUser: null,
      startTime: new Date(),
      location: null,
    };

    this.handleMatchClick = this.handleMatchClick.bind(this);
    this.handleSendChallenge = this.handleSendChallenge.bind(this);
    this.handleHideMatch = this.handleHideMatch.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  componentDidMount () {
    let newMatches = matchmakeByElo( this.props.playerData.elo, this.props.users );
    let filtered = this.getMatchedUsers(newMatches);
    this.setState({
      matchedUsers: filtered
    });
  }

  getMatchedUsers (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  handleMatchClick ( user ) {
    this.setState({
      showMatch: true,
      matchClickUser: user
    });
  }

  handleHideMatch () {
    this.setState({ showMatch: false });
  }

  handleDateChange ( e ) {
    this.setState({ startTime: e._d });
  }

  handleSendChallenge () {
    if ( this.state.startTime && this.state.location ) {
      let index = this.state.matchedUsers.indexOf( this.state.matchClickUser );
      this.state.matchedUsers.splice( index, 1 );
      this.setState({ 
        matchedUsers: this.state.matchedUsers,
        showMatch: false, 
        startTime: '',
        location: null
      });
    } else {
      window.alert( 'Fill in Date and Location' );
    }
  }

  handleLocationChange( location ) {
    this.setState({ location });
  }

  getWinProbability(elo1, elo2) {
    return Math.floor( calcProbabilityOfWin( elo1, elo2 ) * 100 ) || 1;
  }

  render () {
    return (
      <div className="matches-container">
        <h2>Recommended Opponents</h2>

        <div className="scrolling-wrapper scrolling-wrapper-flexbox">
          { this.state.matchedUsers.slice( 0, 10 ).map( matchedUser => {
            let winPercent = this.getWinProbability( this.props.playerData.elo, matchedUser.elo );
            return (
              <div className="card" key={ matchedUser.id }>
                <Image src={ matchedUser.image } className="image-opacity"/>
                <Image src={ matchedUser.image } className="profile-pic-card pic-shadow" circle/>
                <div className="card-container text-center">
                  <h4 className="username"><b>{ matchedUser.name }</b></h4> 
                  W: { matchedUser.wins } L: { matchedUser.losses }
                  <br/>
                  <br/>
                  Win %
                  <ProgressBar
                    bsStyle="success"
                    now={ winPercent }
                    label={ `${winPercent}%` } />
                  <Button 
                    bsStyle="primary"
                    className="card-button"
                    onClick={ () => this.handleMatchClick( matchedUser )}>
                    Challenge
                  </Button>
                </div>
              </div>
            );
          })
          }
        </div>

        <br/>
        <br/>

        <Query query={ GET_ALL_USERS }>
          {({ loading, error, data }) => {
            if ( loading ) { return <p>Loading...</p>; }
            if ( error ) { console.error( error ); }
            return (
              <SearchUsers
                handleMatchClick={ this.handleMatchClick }
                loggedInUser={ this.props.playerData.email }
                allUsers={ data.getAllUsers }/>
            );
          }}
        </Query>

        { this.state.showMatch
          ? <Mutation
            mutation={ CREATE_MATCH }
            update={ this.handleSendChallenge }
            variables={{
              input: {
                challenger: this.props.playerData.email,
                opponent: this.state.matchClickUser.email,
                startTime: this.state.startTime,
                location: this.state.location
              }
            }}>
            { createMatch => (
              <CreateChallengeModal 
                showMatch={ this.state.showMatch }
                handleHideMatch={ this.handleHideMatch }
                matchClickUser={ this.state.matchClickUser }
                handleDateChange={ this.handleDateChange }
                startTime={ this.state.startTime }
                handleLocationChange={ this.handleLocationChange }
                location={ this.state.location }
                createMatch={ createMatch }
              />
            )}
          </Mutation>
          : null }
      </div>
    );
  }
}

export default RecommendedOpponents;
