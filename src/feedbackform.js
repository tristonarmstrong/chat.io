import React from 'react'

class FeedbackForm extends React.Component{

    state = {
        name: '', 
        email: '', 
        message: '', 
        subject: ''
    }

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
            body: this.encode({ "form-name": "Feedback", ...this.state })
        })
            .then(() => alert("Success!"))
            .catch(error => alert(error));

        e.preventDefault();
    };
    
    handleChange = e => this.setState({ [e.target.name]: e.target.value });

    render(){
        const {name, email, message, subject} = this.state
        return (
            <div className='modal'>
                <div className='landing-instructions'>
                    <h1><span>FEEDBACK</span></h1>
                    <p>Please tell me what I can do to improve the app!</p>
                </div>
                <form onSubmit={this.handleSubmit} data-netlify={true}>
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