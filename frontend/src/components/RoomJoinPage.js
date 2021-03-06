import React, { useEffect, useState, } from 'react'

import {Button, Grid, Typography, TextField } from '@material-ui/core'
import {Link, useNavigate} from 'react-router-dom'



export default function RoomJoinPage(props) {
    const [roomcode,setRoomcode] = useState('')
    const [error, setError] = useState('')

    const navigate = useNavigate();
    function handleEnterRoomButtonPressed(){

      console.log('this.state.roomcode', roomcode)
      const requestOptions = {
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          code:roomcode,
        }),
      };

      fetch("/api/join-room" , requestOptions)
      .then((response) => {
        console.log('response.ok', response.ok)
        if (response.ok) {
          navigate(`/room/${roomcode}`);
          console.log('Go to room ', roomcode ) 
        } else {
            setError('Room Not Found 404')         
        }
      })
      .catch((error)=> console.log('error', error))
      
    }

    return (
      <Grid container spacing={1} >
          <Grid item xs={12} align='center'>
            <Typography componment='h4' variant='h4' className='title'>
              Join a Room
              </Typography>
            </Grid>

            <Grid item xs={12} align='center'>
            <TextField
              error={!!error}
              label='Code'
              placeholder='Enter Your Room Code'
              value={roomcode}
              helperText={error}
              variant='outlined'
              onChange={(e) => setRoomcode(e.target.value)}
            />
            </Grid>

            <Grid item xs={12} align='center'>
            <Button
              color='primary'
              variant='contained'
              onClick={()=> handleEnterRoomButtonPressed()}
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
