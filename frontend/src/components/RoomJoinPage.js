import React, { Component } from 'react'

import {Button, Grid, Typography, TextField } from '@material-ui/core'
import {Link, useNavigate} from 'react-router-dom'

function withNavigate(Component) {
  return props => <Component {...props} navigate={useNavigate()} />;
}

 class RoomJoinPage extends Component {
    constructor(props){
        super(props);
        this.state = {
          roomcode: "",
          error: '',
        }
        this.handleEnterRoomButtonPressed = this.handleEnterRoomButtonPressed.bind(this)
        this.handleTextInput = this.handleTextInput.bind(this)
    }

    handleTextInput(e){
      this.setState({
        roomcode:e.target.value
      })
    }

    handleEnterRoomButtonPressed(){
      console.log('this.state.roomcode', this.state.roomcode)
      const requestOptions = {
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          code:this.state.roomcode,
        }),
      };
      fetch("/api/join-room" , requestOptions)
      .then((response) => {
        console.log('response.ok', response.ok)
        if (response.ok) {
          this.props.navigate(`/room/${this.state.roomcode}`);
          console.log('Go to room ', this.state.roomcode )  // ???
        } else {
          this.setState({
            error: 'Room Not Found 404'
          })
        }
      })
      .catch((error)=> console.log('error', error))
      
    }

  render() {
    return (
      <Grid container spacing={1}>
          <Grid item xs={12} align='center'>
            <Typography componment='h3' variant='h3'>
              Join a Room
              </Typography>
            </Grid>

            <Grid item xs={12} align='center'>
            <TextField
              error={!!this.state.error}
              label='Code'
              placeholder='Enter Your Room Code'
              value={this.state.roomcode}
              helperText={this.state.error}
              variant='outlined'
              onChange={this.handleTextInput}
            />
            </Grid>

            <Grid item xs={12} align='center'>
            <Button
              color='primary'
              variant='contained'
              onClick={this.handleEnterRoomButtonPressed}
            >
              Enter Room
              </Button>
            </Grid>
            <Grid item xs={12} align='center'>
            <Button
              color='secondary'
              variant='contained'
              to='/'
              component={Link}
            >
              Back
              </Button>
            </Grid>
      </Grid>
    )
  }
}

export default withNavigate(RoomJoinPage);