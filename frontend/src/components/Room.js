import React, { Component } from 'react'
import {useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from "@material-ui/core";

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
        };
        //console.log( this.props)
        this.roomcode = this.props.params.roomcode
        this.getRoomDetails();
        this.handleLeaveButton = this.handleLeaveButton.bind(this)
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
        });
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

    render() {
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

export default withParamsAndNavigate(Room);
