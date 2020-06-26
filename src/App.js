import React from 'react';
import './App.css';
import {withRouter} from 'react-router-dom'
import {Route, Link} from 'react-router-dom'
import Landing from './landing.js'
import Room from './room';
let url = 'http://localhost:5000'




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

  render() {
    return (
      <div className="App">
        <h1 id="title">Triston's Chat App</h1>
        <Route exact path='/' render={(props) => <Landing {...props} goClick={this.goClick} />}/>
        {Boolean(this.state.path.length) && <Route path={`${this.state.path}`} component={Room}/> }
      </div>
    );
  }
}

export default withRouter(App);
