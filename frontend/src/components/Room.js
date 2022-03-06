import React, { Component } from 'react'
import {useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from './CreateRoomPage';

function withParamsAndNavigate(Component) {
  return props => <Component {...props} params={useParams()} navigate={useNavigate()} />;
}




class Room extends Component {
    constructor(props){
        super(props);
        this.state = {
            guest_pause: true,
            votes_to_skip: this.defaultVotes,
            is_host:false,
            showSetting:false,
            spotifyAuth:false,
        };
        //console.log( this.props)
        this.roomcode = this.props.params.roomcode
        this.handleLeaveButton = this.handleLeaveButton.bind(this)
        this.renderSettingButton = this.renderSettingButton.bind(this)
        this.renderSetting = this.renderSetting.bind(this)
        this.updateShowSetting = this.updateShowSetting.bind(this)
        this.authSpotify = this.authSpotify.bind(this)
        this.getRoomDetails = this.getRoomDetails.bind(this)
        this.getRoomDetails();
    }
  
    getRoomDetails(){
        fetch('/api/get-room' + "?code=" + this.roomcode)
        .then((response) => {
            if (!response.ok) {
                this.props.leaveRoomCallback();
                this.props.navigate("/");
              }
              return response.json();
        })
        .then((data) =>{
            this.setState({
                guest_pause: data.guest_pause,
                votes_to_skip: data.votes_to_skip,
                is_host:data.is_host,
            });
            if (this.state.is_host){
              this.authSpotify();
            }
        });
    }

    authSpotify(){
      fetch('/spotify/is-auth')
      .then((response) => response.json())
      .then((data) =>{
        this.setState({spotifyAuth:data.status});
        console.log("Auth Status: ",data.status)
        if (!data.status){
          fetch('/spotify/get-auth-url')
          .then((response) => response.json())
          .then((data)=>{
            window.location.replace(data.url);
          });
        }
      })
    }

    handleLeaveButton(){
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          };
          fetch("/api/leave-room", requestOptions).then((_response) => {
            this.props.leaveRoomCallback();
            console.log('Go to homepage',)
            this.props.navigate("/");
          });
    }
    renderSetting(){
      return (
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <CreateRoomPage 
              update={true}
              votes_to_skip={this.state.votes_to_skip}
              guest_pause={this.state.guest_pause}
              roomcode={this.roomcode}
              updateCallback={this.getRoomDetails}  
            >
            </CreateRoomPage>
          </Grid>
          <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={()=> this.updateShowSetting(false)}
          >
            Close
          </Button>
          </Grid>
        </Grid>
      )
    }

    updateShowSetting(value){
      this.setState({
        showSetting:value,
      })
    }

    renderSettingButton(){
      return(
        <Grid item xs={12} align="center">
        <Button
            variant="contained"
            color="primary"
            onClick={()=> this.updateShowSetting(true)}
          >
            Settings
          </Button>
        </Grid>
      )
    }

    render() {
      if (this.state.showSetting){
        return this.renderSetting()
      } else {
        return (
          <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">
              Code: {this.roomcode}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography variant="h6" component="h6">
              Votes: {this.state.votes_to_skip}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography variant="h6" component="h6">
              Guest Can Pause: {this.state.guest_pause.toString()}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography variant="h6" component="h6">
              Host: {this.state.is_host.toString()}
            </Typography>
          </Grid>
          {this.state.is_host && this.renderSettingButton()}
          <Grid item xs={12} align="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleLeaveButton}
            >
              Leave Room
            </Button>
          </Grid>
        </Grid>
      )
      }
    
  }
}

export default withParamsAndNavigate(Room);
