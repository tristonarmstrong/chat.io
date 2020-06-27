import React from 'react';
import './App.css';
import {withRouter} from 'react-router-dom'
import {Route} from 'react-router-dom'
import Landing from './landing.js'
import Room from './room';
import cryptoRandomString from 'crypto-random-string'




class App extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      path: window.location.pathname.length === 1 ? '' : window.location.pathname
    }
  }

  goClick=(name)=>{
    this.props.history.push(`/${name}`)
    this.setState({path: `/${name}`})
  }
  randomClick=()=>{
    let path = cryptoRandomString({length: 10, type: 'url-safe'})
    this.props.history.push(`/${path}`)
    this.setState({path: `/${path}`})
  }

  render() {
    return (
      <div className="App">
        <h1 id="title">Triston's Chat App</h1>
        <Route exact path='/' render={(props) => <Landing {...props} goClick={this.goClick} randomClick={this.randomClick}/>}/>
        {Boolean(this.state.path.length) && <Route path={`${this.state.path}`} component={Room}/> }
      </div>
    );
  }
}

export default withRouter(App);
