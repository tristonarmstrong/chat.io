import React from 'react'
import './index.css'

class ClientMessage extends React.Component {

    // componentDidMount(){
    //     setTimeout(() => {
            
    //     }, 5000);
    // }


    render(){
        return(
            <div className="msg_cont">
                <h1>{this.props.msg}</h1>
            </div>
        )
    }
}

export default ClientMessage