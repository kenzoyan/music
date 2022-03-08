import React, { Component } from 'react'
import {useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from "@material-ui/core";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

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
            song:{},
        };
        //console.log( this.props)
        this.roomcode = this.props.params.roomcode
        this.handleLeaveButton = this.handleLeaveButton.bind(this)
        this.renderSettingButton = this.renderSettingButton.bind(this)
        this.renderSetting = this.renderSetting.bind(this)
        this.updateShowSetting = this.updateShowSetting.bind(this)
        this.authSpotify = this.authSpotify.bind(this)
        this.getRoomDetails = this.getRoomDetails.bind(this)
        this.getCurrentSong = this.getCurrentSong.bind(this)
        this.getRoomDetails();
        this.getCurrentSong();
  
    }
    
    componentDidMount(){
      this.interval = setInterval(this.getCurrentSong,5000)
    }

    componentWillUnmount(){
      clearInterval(this.interval)
    }

    getRoomDetails(){
        fetch('/api/get-room' + "?code=" + this.roomcode)
        .then((response) => {
            if (!response.ok) {
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

    getCurrentSong(){
      fetch('/spotify/current-song')
      .then((response) =>{
        if (!response.ok){
          return {'error':'resposne error'}
        } else {
          return response.json();
        }
      }).then((data)=>{
        this,this.setState({
          song:data
        })
        console.log('Current Song: ', data)
      })
    }

    handleLeaveButton(){
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          };
          fetch("/api/leave-room", requestOptions).then((_response) => {
            console.log('Go to homepage',)
            this.props.navigate("/");
          });
    }
    renderSetting(){
      return (
        <Grid container spacing={1} className='container'>
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
        <Grid item xs={12} align="center" className='container'>
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
          <Grid container spacing={1} className='container' >
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4" className='title'>
              {this.roomcode}
            </Typography>

          <MusicPlayer {...this.state.song} />
          </Grid>

          <Grid item xs={12} align="center">
            <Typography variant="h6" component="h4" className='title'>
              Guest Control  {this.state.guest_pause? <CheckBoxIcon />: <CheckBoxOutlineBlankIcon/>}
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
