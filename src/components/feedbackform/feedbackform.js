import React from 'react'
import ClientMessage from '../clientMessage/clientMessage.js'

class FeedbackForm extends React.Component{
    state = {name: '',email: '',message: '',subject: ''}

    encode = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");
      }
    
        /* Here’s the juicy bit for posting the form submission */
    
    handleSubmit = e => {
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: this.encode({ "form-name": "feedback", ...this.state })
        })
            .then(() => {
                this.setState({name:'',email:'',message:'',subject:'', response: true, response_msg: 'Your feedback is appreciated!'}, () =>{
                    setTimeout(() => {
                        this.setState({response: false})
                    }, 5000);
                })
            })
            .catch(error => this.setState({response: true, response_msg: error}), ()=>{
                setTimeout(() => {
                    this.setState({response: false})
                }, 5000);
            });

        e.preventDefault();
    };
    
    handleChange = e => this.setState({ [e.target.name]: e.target.value });

    render(){
        const {name, email, message, subject} = this.state
        ++this.childKey
        return (
            <div className='modal'>
                {this.state.response && <ClientMessage key={this.childKeyÍ} msg={this.state.response_msg}/>}
                <div className='landing-instructions'>
                    <h1><span>FEEDBACK</span></h1>
                    <p>Please tell me what I can do to improve the app!</p>
                </div>
                <form onSubmit={this.handleSubmit} data-netlify={true}>
                    <input type="hidden" name="form-name" value="feedback" />
                    <div className="form-group">
                        <input name='name' type="text" className="form-control" placeholder="Name" value={name} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <input name='email' type="email" className="form-control" placeholder="Email" value={email} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <input name='subject' type="text" className="form-control" placeholder="Subject" value={subject} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <textarea name="message" id="message" rows="7"  className="form-control" placeholder="Message" value={message} onChange={this.handleChange} ></textarea>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="submit-button">Send Message</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default FeedbackForm