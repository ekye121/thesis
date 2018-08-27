import React from 'react';
import { Table, Button } from 'react-bootstrap';
import moment from 'moment';

import ResultsModal from './ResultsModal.jsx';

class ScheduledMatches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matches: [],
      resultsModalOpen: false,
      matchClicked: '',
      selectedWinner: 'test'
    };

    this.handleMatchClick = this.handleMatchClick.bind(this);
    // this.handleSubmission = this.handleSubmission.bind(this);
    this.hideResultsModal = this.hideResultsModal.bind(this);
  }

  componentDidMount () {
    // let {pendingMatches, completedMatches } = this.props.playerData;
    // let matches = pendingMatches.concat(completedMatches);

    // this.setState({
    //   matches
    // });
  }

  handleMatchClick ( match, index ) {
    //Track the index of which match in the array the user 
    //will mutate with the ResultsModal
    // let tempMatch = Object.assign( {}, match );
    // tempMatch.index = index;
    this.setState({
      resultsModalOpen: true,
      matchClicked: match
    });
  }

  // handleSubmission ( winner ) {
  //   //Update state to reflect mutation of database
  //   let matches = this.state.matches.slice();
  //   let clickIndex = this.state.matchClicked.index;
  //   let tempMatch = Object.assign( {}, matches[clickIndex]);

  //   tempMatch.completed = true;
  //   tempMatch.winner = winner;

  //   matches[clickIndex] = tempMatch;

  //   this.setState({ 
  //     matches,
  //     resultsModalOpen: false
  //   });
  // }

  hideResultsModal () {
    this.setState({ 
      resultsModalOpen: false
    });
  }

  render () {
    let combinedMatches = this.props.scheduledMatches.pendingMatches
      .concat(this.props.scheduledMatches.completedMatches);
    return (
      <div className="matches-container">
        <h2>Scheduled Matches</h2>
        <Table striped bordered condensed hover>

          <thead>
            <tr>
              <th>Opponent</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Winner</th>
            </tr>
          </thead>
  
          <tbody>
            { combinedMatches.map(( match, index ) => {
              return (
                <tr className="match-row" key={ match.id }>
                  <td>{ match.opponent }</td>
                  <td>{ moment( new Date(match.startTime)).calendar() }</td>
                  <td>{ match.location }</td>
                  <td>{ match.completed ? 'Complete' : 'Scheduled'}</td>
                  <td>
                    { match.completed ?
                      match.winner
                      :
                      <Button 
                        bsStyle="primary" 
                        value={ index }
                        onClick={ ( e ) => this.handleMatchClick( match, e.target.value )}
                      >
                        Add Results
                      </Button>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
  
        </Table>

        <ResultsModal
          match={ this.state.matchClicked }
          resultsModalOpen={ this.state.resultsModalOpen }
          hideResultsModal={ this.hideResultsModal }
          matchClicked={ this.state.matchClicked }
          handleSubmission = { this.handleSubmission }
        />
    
      </div>
    );
  }
}

export default ScheduledMatches;
