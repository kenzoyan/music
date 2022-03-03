import React, { Component, Fragment } from 'react'

import CreateRoomPage from './CreateRoomPage'
import RoomJoinPage from './RoomJoinPage'

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Redirect,
  } from "react-router-dom";

export default class HomePage extends Component {
    constructor(props){
        super(props);
    }
  render() {
    return (
        <Router>
            
            <Routes>
            
                <Route exact path='/' element={<p>This is home page</p>}></Route>
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
            
            </Routes>
            
        </Router>

     
    )
  }
}
