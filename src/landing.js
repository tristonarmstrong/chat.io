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
            <>
                <div className='modal'>
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
                                <button className='submit-button' onClick={(e) => this.go(e)}>GO!</button>
                                <button className='submit-button' onClick={(e) => this.rando(e)}>Random</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* form down below */}
                <div className='modal'>
                    <div className='landing-instructions'>
                        <h1><span>FEEDBACK</span></h1>
                        <p>Please tell me what I can do to improve the app!</p>
                    </div>
                    <form name='Feedback' method='POST' data-netlify='true' action="">
                        <div className="form-group">
                            <input name='name' type="text" className="form-control" placeholder="Name" />
                        </div>
                        <div className="form-group">
                            <input name='email' type="email" className="form-control" placeholder="Email" />
                        </div>
                        <div className="form-group">
                            <input name='subject' type="text" className="form-control" placeholder="Subject" />
                        </div>
                        <div className="form-group">
                            <textarea name="message" id="message" cols="30" rows="7" className="form-control" placeholder="Message"></textarea>
                        </div>
                        <div className="form-group">
                            <button type="submit" className="submit-button">Send Message</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }
}

export default Landing