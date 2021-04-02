import './App.css';
import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import constants from './constants.json';
import { HmacSHA256 } from 'crypto-js';
import AdminComponent from './components/AdminComponent';
import VoterComponent from './components/VoterComponent';

class App extends React.Component {
  // sha256(nonce + message);

  // delete_cookie(cookie_key);
  // read_cookie(cookie_key)
  // bake_cookie(cookie_key, 'test');
  constructor(props) {
    super(props);
    this.state = {
      statusMessage:"",
      token:"",
      voterEmail:""
    };
  }

  
  componentDidMount(){
    this.updateState();
  }
  updateState = async () =>{
      await this.setState({
          token : read_cookie("token"),
          voterEmail : read_cookie("voterEmail")
      });
  }

  adminLoginOnClick = async (paramater) => {
    var adminName = document.getElementById("adminName").value;
    var adminPassword = document.getElementById("adminPassword").value;
    var hashedAdminPassword = sha256(adminPassword).toString();
    adminPassword = "";
    var LoginObject = {
      name:adminName,
      hashedPw:hashedAdminPassword
    }
    console.log(LoginObject);
    await axios.post(`https://${constants.url}/api/admin/login`, LoginObject)
      .then(res => {
        console.log(res.status);
        if(res.status == 200){
          bake_cookie('token', res.data.token);
          bake_cookie('adminName',adminName);
          this.setState({
            statusMessage:"",
            token:res.data.token
          });
        }
      }).catch(err => {
        console.log(err);
        this.setState({
          statusMessage:"login failed"
        })
      });
  }
  continueOnClick = async () =>{
    var email = document.getElementById("voterEmail").value;
    bake_cookie("voterEmail",email);
    this.setState({
      voterEmail : email
    });
  }

  render() {
    if(this.state.token != ""){
      return(<AdminComponent />);
    }
    if(this.state.voterEmail != ""){
      return(<VoterComponent/>);
    }
    return (
      <div style={{marginTop:"5%", marginLeft:"30%", marginRight:"30%", width:"40%", textAlign:"center"}}>
        <h4 style={{color:"red"}}>{this.state.statusMessage}</h4>
        <hr/>
         <div className="form-group">
            <label>Admin Name</label>
            <input type="text" className="form-control" placeholder="name" id="adminName" autoComplete="off" /> <br/>
            <label>Admin Password</label>
            <input type="password" className="form-control" placeholder="password" id="adminPassword" autoComplete="off" /> <br/>
            <small className="form-text text-muted">your security is important to us !</small>
          </div>
          <button type="button" className="btn btn-sm btn-primary" onClick={this.adminLoginOnClick}>Admin Login</button>
          <div style={{marginTop:"50px",marginBottom:"50px"}}>
            <hr/>
          </div>
          <h5 style={{color:"green"}}>or continue as voter</h5>
          <div className="form-group">
            <label>Your Email Adress</label>
            <input type="text" className="form-control" placeholder="something@provider.com" id="voterEmail" autoComplete="off" /> <br/>
            <button type="button" className="btn btn-sm btn-success" onClick={this.continueOnClick}>Continue</button>
          </div>
      </div>
    );
  }
}

export default App;