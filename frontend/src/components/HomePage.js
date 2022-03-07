import React, { Component, Fragment } from 'react'

import CreateRoomPage from './CreateRoomPage'
import RoomJoinPage from './RoomJoinPage'
import Room from './Room';
import {Button, Grid, Typography, ButtonGroup } from '@material-ui/core'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
  } from "react-router-dom";




export default class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
          roomcode:null
        }
        this.RenderHomePage = this.RenderHomePage.bind(this)
        this.clearRoomCode = this.clearRoomCode.bind(this)
    }

  async componentDidMount(){
    fetch('api/user-in-room')
    .then((res) => res.json())
      .then((data) => { this.setState({
        roomcode: data.code,
      })
      //console.log(data)
    });
  }

  clearRoomCode(){
    this.setState({
      roomcode:null,
    })
  }

  RenderHomePage(){
    return this.state.roomcode? (<Navigate to= {`/room/${this.state.roomcode}`}/>):
    (
      <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" component="h3">
          House Party
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" to="/join" component={Link}>
            Join Room
          </Button>
          <Button color="secondary" to="/create" component={Link}>
            Create Room
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
    )
  }

  render() {
    return (
        <Router>
            
            <Routes>
            
                <Route exact path='/' element={< this.RenderHomePage/>} />
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
                <Route path='/room/:roomcode' element={<Room {...this.props} leaveRoomCallback={this.clearRoomCode} />} />
            
            </Routes>
            
        </Router>

     
    )
  }
}
