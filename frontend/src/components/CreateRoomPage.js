import React, { Component } from 'react'

import {Button, Grid, Typography, TextField, FormHelperText, 
  FormControl, Radio, RadioGroup, FormControlLabel } from '@material-ui/core'
import {Link, useNavigate} from 'react-router-dom'

function withNavigate(Component) {
  return props => <Component {...props} navigate={useNavigate()} />;
}


 class CreateRoomPage extends Component {
  defaultVotes = 2

  constructor(props){
        super(props);
        this.state = {
          guest_pause: true,
          votes_to_skip: this.defaultVotes,
        };
        this.handleGuestPauseChange = this.handleGuestPauseChange.bind(this)
        this.handleVotesChange = this.handleVotesChange.bind(this)
        this.handleCreateRoomButtonPressed = this.handleCreateRoomButtonPressed.bind(this)
    }
  
    handleVotesChange(e){
      this.setState({
        votes_to_skip:e.target.value
      });
    }

    handleGuestPauseChange(e){
      this.setState({
        guest_pause:e.target.value === true? true:false
      });
    }

    handleCreateRoomButtonPressed(){
      const requestOptions = {
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          votes_to_skip:this.state.votes_to_skip,
          guest_pause:this.state.guest_pause
        }),
      };
      fetch("/api/create" , requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.navigate(`/room/${data.code}`)) 
    }
    

  render() {
    return (
        <Grid container spacing={1}>
          <Grid item xs={12} align='center'>
            <Typography componment='h3' variant='h3'>
              Create a Room
              </Typography>
            </Grid>

            <Grid item xs={12} align='center'>
            <FormControl component='fieldset' >
              <FormHelperText>
                <div align='center'>Guest Control of Playback State</div>
              </FormHelperText>
              <RadioGroup row defaultValue='true' onChange={this.handleGuestPauseChange} >
                <FormControlLabel
                  value='true'
                  control={< Radio color='primary' />}
                  label='Play'
                  labelPlacement='bottom'
                />
                <FormControlLabel
                  value='false'
                  control={< Radio color='secondary' />}
                  label='Pause'
                  labelPlacement='bottom'
                />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} align='center'>
            <FormControl component='fieldset' >
              <TextField
                required={true}
                type='number'
                defaultValue={this.defaultVotes}
                onChange={this.handleVotesChange}
                inputProps={{
                  min:1,
                  style:{textAlign:'center'}
                }}
              />
              </FormControl>
              <FormHelperText>
                <div align='center'>Votes required to skip songs</div>
              </FormHelperText>
            </Grid>

            <Grid item xs={12} align='center'>
            <Button
              color='primary'
              variant='contained'
              onClick={this.handleCreateRoomButtonPressed}
            >
              Create A Room
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

export default withNavigate(CreateRoomPage)