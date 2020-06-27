import React from 'react'
import './landing.css'

class Landing extends React.Component{

    state={
        name: ''
    }

    handleChange=(e)=>{
        this.setState({name: e.target.value})
    }

    go=(e)=>{
        e.preventDefault()
        if(!this.state.name.length > 0){
            throw new Error('Please fill out the form or select Random')
        }else{
            this.props.goClick(this.state.name)
        }
    }
    rando=(e)=>{
        e.preventDefault()
        this.props.randomClick()
    }
    render(){
        return(
            <div id='modal'>
                <div className="landing-instructions">
                    <h1>
                        <span>JOIN </span> 
                        or 
                        <span> CREATE </span> 
                        a room?
                    </h1>
                    <p>Type the name of the room that you would like to join or create, and select "GO!"</p>
                    <p>OR</p>
                    <p>Select "Random" to randomly generate a room name!</p>
                </div>
                <div className="form-container">
                    <form>
                        <input 
                            id='room' 
                            name='room' 
                            placeholder="Name of room" 
                            value={this.state.name} 
                            onChange={this.handleChange}
                        />

                        <div className="buttons-list">
                            <button onClick={(e) => this.go(e)}>GO!</button>
                            <button onClick={(e) => this.rando(e)}>Random</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Landing