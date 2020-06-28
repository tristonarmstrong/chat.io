import React from 'react'
import './index.css'

class ClientMessage extends React.Component {

    render(){
        return(
            <div className="msg_cont">
                <h1>Message:</h1>
                <h2>{this.props.msg}</h2>
            </div>
        )
    }
}

export default ClientMessage