import React, { Component } from 'react'

import {Button, Grid, Typography, TextField, FormHelperText, 
  FormControl, Radio, RadioGroup, FormControlLabel, Collapse } from '@material-ui/core'
import {Link, useNavigate} from 'react-router-dom'

import {Alert} from '@material-ui/lab'
function withNavigate(Component) {
  return props => <Component {...props} navigate={useNavigate()} />;
}


 class CreateRoomPage extends Component {
    static defaultProps = {
      update: false,
      votes_to_skip: 2,
      guest_pause:true,
      roomcode:null,
      updateCallback: () => {}, 
    }

  constructor(props){
        super(props);
        this.state = {
          guest_pause: true,
          votes_to_skip: this.defaultVotes,
          SuccessMsg:'',
          ErrorMsg:'',
        };
        this.handleGuestPauseChange = this.handleGuestPauseChange.bind(this)
        this.handleVotesChange = this.handleVotesChange.bind(this)
        this.handleCreateRoomButtonPressed = this.handleCreateRoomButtonPressed.bind(this)
        this.handleUpdateRoomButtonPressed = this.handleUpdateRoomButtonPressed.bind(this)
        this.renderCreateButtons = this.renderCreateButtons.bind(this)
        this.renderUpdateButtons = this.renderUpdateButtons.bind(this)
        this.renderAlert =this.renderAlert.bind(this)
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

    handleUpdateRoomButtonPressed(){
      const requestOptions = {
        method:'PATCH',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          votes_to_skip:this.state.votes_to_skip,
          guest_pause:this.state.guest_pause,
          code:this.props.roomcode,
        }),
      };
      fetch("/api/update-room" , requestOptions)
      .then((response) => {
        if (response.ok){
          this.setState({
            SuccessMsg: 'Room info updated successfully!'
          })
        } else{
          this.setState({
            ErrorMsg: 'Room info updated error!'
          })
        }
        this.props.updateCallback()
      })
       
    }


    renderCreateButtons(){
      return (
        <Grid container spacing={1}>

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

    renderUpdateButtons(){
      return (
        <Grid container spacing={1}>
          <Grid item xs={12} align='center'>
              <Button
                color='primary'
                variant='contained'
                onClick={this.handleUpdateRoomButtonPressed}
              >
                Update Room
                </Button>
          </Grid>
        </Grid>
      )
    }

    renderAlert(){
      return (
        <Grid item xs={12} align='center'>
        <Collapse in={!!this.state.ErrorMsg|| !!this.state.SuccessMsg}>
          {this.state.SuccessMsg?
          (
          <Alert severity='success'onClose={()=>{
              this.setState({SuccessMsg:''})}}
          >
            {this.state.SuccessMsg}
          </Alert>
          ):(
            <Alert severity='error'onClose={()=>{
              this.setState({ErrorMsg:''})}}
          >
            {this.state.ErrorMsg}
          </Alert>
          )}
        </Collapse>  
        </Grid>
      )
    }
    

  render() {
    const title = this.props.update ? "Update Room" : "Create a Room";

    return (
        <Grid container spacing={1} className='container'>
          {this.renderAlert()}
          
          <Grid item xs={12} align='center'>
            <Typography componment='h3' variant='h3'>
              {title}
              </Typography>
          </Grid>

          <Grid item xs={12} align='center'>
            <FormControl component='fieldset' >
              <FormHelperText>
                <div align='center'>Guest Control of Playback State</div>
              </FormHelperText>
              <RadioGroup row defaultValue={this.props.guest_pause.toString()} onChange={this.handleGuestPauseChange} >
                <FormControlLabel
                  value='true'
                  control={< Radio color='primary' />}
                  label='Play/Pause'
                  labelPlacement='bottom'
                />
                <FormControlLabel
                  value='false'
                  control={< Radio color='secondary' />}
                  label='No control'
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
                defaultValue={this.props.votes_to_skip}
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
          {this.props.update? this.renderUpdateButtons() : this.renderCreateButtons()}
        </Grid>
    )
  }
}

export default withNavigate(CreateRoomPage)