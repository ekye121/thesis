import React from 'react';
import { Table, Modal, Button, Form, FormGroup, FormControl, Col } from 'react-bootstrap';
import Datetime from 'react-datetime';

import matchmakeByElo from '../../../workers/matchmaking.js';

class RecommendedMatches extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchedUsers: [],
      showMatch: false,
      matchClickUser: null,
      calendarDate: '',
      location: ''
    };

    this.handleMatchClick = this.handleMatchClick.bind(this);
    this.handleSendChallenge = this.handleSendChallenge.bind(this);
    this.handleHideMatch = this.handleHideMatch.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  componentDidMount() {
    let newMatches = matchmakeByElo(2000, this.props.users);
    this.setState({
      matchedUsers: newMatches
    });
  }

  handleMatchClick(user) {
    console.log('CLICKED??', user);
    this.setState({
      showMatch: true,
      matchClickUser: user
    });
  }

  handleHideMatch() {
    this.setState({ showMatch: false });
  }

  handleDateChange(e) {
    console.log('calendar change--', e._d);
    this.setState({ calendarDate: e._d });
  }

  handleSendChallenge() {
    this.setState({ 
      showMatch: false, 
      calendarDate: '',
      location: ''
    });
    
  }

  handleLocationChange(e) {
    this.setState({ location: e.target.value });
  }

  render() {
    var yesterday = Datetime.moment().subtract(1, 'day');
    var valid = ( current ) => {
      return current.isAfter( yesterday );
    };

    return (
      <div className='matches-container'>
        <h2>Recommended Matches</h2>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>User</th>
              <th>Number</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            { this.state.matchedUsers.slice(0, 5).map( matchedUser => (
              <tr className='match-row' key={ matchedUser.id } onClick={ () => this.handleMatchClick( matchedUser ) }>
                <td>{ matchedUser.name }</td>
                <td>{ matchedUser.phoneNumber }</td>
                <td>{ matchedUser.email }</td>
              </tr>
            ))}
          </tbody>
        </Table>

        { this.state.showMatch
          ? <Modal
            show={ this.state.showMatch }
            onHide={ this.handleHideMatch }
            className="challenge-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title">
                { this.state.matchClickUser.name }
                <div>
                  {/* Profile Pic
                  <br/>
                  <br/> */}
                  W: { this.state.matchClickUser.wins } L: {this.state.matchClickUser.losses }
                  <br/>
                  Trophies:
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <Datetime 
                isValidDate={ valid } 
                className="form-width" 
                closeOnSelect={ true } 
                inputProps={{ placeholder: 'Select Date' }}
                onChange={ this.handleDateChange }
                value={ this.state.calendarDate }
              />
              
              <br/> 

              <Form horizontal className="form-width">
                <FormGroup controlId="formHorizontalEmail">
                  <Col sm={12}>
                    <FormControl placeholder="Location" onChange={ this.handleLocationChange } value={ this.state.location }/>
                  </Col>
                </FormGroup>
              </Form>

            </Modal.Body>
            <Modal.Footer>
              <Button onClick={ this.handleHideMatch }>Cancel</Button>
              <Button bsStyle="primary" onClick={ this.handleSendChallenge }>Send Challenge</Button>
            </Modal.Footer>
          </Modal>
          : null }

      </div>
    );
  }
}


export default RecommendedMatches;