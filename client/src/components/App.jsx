import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ApolloProvider, Query } from 'react-apollo';

import NavBar from './NavBar.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Profile from './Profile.jsx';
import Matchmaking from './Matchmaking.jsx';
import RecommendedMatches from './RecommendedMatches.jsx';
import Stats from './Stats.jsx';
import { CHECK_EMAIL_IS_UNIQUE } from '../apollo/queries.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      googleUserData: null,
      userProfile: null,
      playerData: null
    };

    this.authListener = this.authListener.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.googleSignOut = this.googleSignOut.bind(this);
    this.mapGoogleDataToProfile = this.mapGoogleDataToProfile.bind(this);
  }

  componentDidMount() {
    this.authListener();
  }

  /* --- GOOGLE AUTH FUNCTIONS --- */
  authListener() {
    firebase.auth().onAuthStateChanged( (user) => {
      if (user) {
        this.setState({
          googleUserData: Object.assign( {}, user.providerData[0] )
        });
        console.log('Session found for user: ', user.providerData[0]);
      } else {
        this.setState({
          googleUserData: null
        });
        console.log('Session ended for user.');
      }
    });
  }
  googleSignIn () {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup( provider )
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log('Error signing in: ', err);
      });
  }
  googleSignOut () {
    this.setState({ googleUserData: null });
    firebase.auth().signOut()
      .then(() => {
        return;
      })
      .catch( ( err ) => {
        console.log( 'Error logging out from google: ', err );
      });
  }

  /* --- ACCOUNT CREATION --- */
  mapGoogleDataToProfile () {
    return () => {
      this.setState({
        userProfile: {
          fullName: this.state.googleUserData.displayName,
          email: this.state.googleUserData.email,
          phoneNumber: this.state.googleUserData.phoneNumber
        }
      });
    };
  }

  render () {
    return (
      <ApolloProvider client={ this.props.client }>
        <NavBar
          googleSignOut={ this.googleSignOut }
          googleSignIn={ this.googleSignIn }
          googleUserData={ this.state.googleUserData }
        />
        <Switch>
          <Route exact path="/" render={ () => {
            if ( this.state.googleUserData ) {
              return <Redirect to="/matchmaker" />;
            } else {
              return <Redirect to="/login" />;
            }
          }} />
          <Route path="/login" render={ () => {
            if ( this.state.googleUserData ) {
              return <Redirect to="/matchmaker"/>;
            } else {
              return <Login
                googleSignIn={ this.googleSignIn }
              />;
            }
          }} />
          <Route path="/signup" render={() =>
            <Signup
              googleUserData={ this.state.googleUserData }
              mapGoogleDataToProfile={ this.mapGoogleDataToProfile }
            />} 
          />
          <Route path="/matchmaker" render={ () => {
            { if (this.state.googleUserData !== null) {
              return (
                <Query query={ CHECK_EMAIL_IS_UNIQUE }
                  variables={{ email: this.state.googleUserData.email }}
                  fetchPolicy='no-cache'>
                  {({ loading, error, data }) => {
                    if ( loading ) { return <p>Loading...</p>; }
                    if ( error ) { return <p>Error! ${error}</p>; }
                    let result = data.checkEmailIsUnique || false;
                    if ( result === false ) {
                      console.log('Welcome back!');
                      return <Matchmaking mapGoogleDataToProfile={ this.mapGoogleDataToProfile } userData={ this.state.googleUserData } />;
                    }
                    return null;
                  }}
                </Query>
              );
            } else {
              return null;
            } }
          }}/>
          <Route path="/profile" render={ () => <Profile/> }/>
          <Route path="/stats" render={ () => <Stats/> }/>
        </Switch>
      </ApolloProvider>
    );
  }
}

export default App;