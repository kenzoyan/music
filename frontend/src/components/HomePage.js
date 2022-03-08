import React, { Component, useState,useEffect } from 'react'

import CreateRoomPage from './CreateRoomPage'
import RoomJoinPage from './RoomJoinPage'
import Room from './Room';
import {Button, Grid, Typography, ButtonGroup,Paper } from '@material-ui/core'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
  } from "react-router-dom";




export default function HomePage(props) {

  const [roomcode, setRoomcode] =useState(null)

  useEffect(()=>{
    fetch('api/user-in-room')
    .then((res) => res.json())
      .then((data) => {setRoomcode(data.code)});
    return () => setRoomcode(null)
  },[roomcode])

  function clearRoomCode(){
    useState(null)
  }


  function RenderHomePage(){
    return roomcode ? (<Navigate to= {`/room/${roomcode}`}/>):
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

  
    return (
        <Paper elevation={24} className='title' >
        <Router>
            
            <Routes  >
            
                <Route exact path='/' element={<RenderHomePage/>} />
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
                <Route path='/room/:roomcode' element={<Room {...props} />} />
            
            </Routes>
            
        </Router>
        </Paper>
    )
}
//