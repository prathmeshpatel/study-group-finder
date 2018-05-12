import React, { Component } from 'react';
import firebase, { auth, provider } from './firebase.js';// added firebase 
import './App.css';
// import CourseDrop from './subject.js';
// import Collapse from './Collapse.js';
// import Curriculum from './Curriculum.js';
var admin = require('firebase-admin'); //admin roles
var serviceAccount = require('./study-group-finder1-firebase-adminsdk-qrsxy-5ff92e8ba9.json'); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://study-group-finder1.firebaseio.com/'
});
const uid = 'some_uid';
admin.auth().createCustomToken(uid)
.then((customToken) => {
  console.log(customToken);
})
.catch((error) => {
  console.log('Error creating custome token:', error)

});
const itemsRef = firebase.database().ref('items');
const courseAPI = 'https://streamer.oit.duke.edu/curriculum/courses/subject/';
// const defaultQuery = 'COMPSCI%20-%20Computer%20Science';
// const APIKey = RESTRICTED PUBLIC
const subjAPI = 'https://streamer.oit.duke.edu/curriculum/list_of_values/fieldname/SUBJECT?access_token=0cf72668b2d47223aa005f6d18165495';
const proxyURL = 'https://cors-anywhere.herokuapp.com/';

class App extends Component {
  constructor() {
    super(); 
    //manage state here
    this.state = { 
      user: null,
      currentNetId: '',
      currentItem: '',
      username: '',
      items: [],
      isLoading: true,
      courses: [],
      subjects: [],
      location: '',
      time: '',
      subject: '',
      course: '',
      privacy: false,
      urlifiedSubject: '',
      users:[],
      sizeLimit: null,
      size: 1,
      preference: false,
      prefSubjects: [],
      inUserList: false,
    }
    this.isNumber = this.isNumber.bind(this);
    this.handleSubjChange = this.handleSubjChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this); //submit to firebase
    this.login = this.login.bind(this); // <-- add this line
    this.logout = this.logout.bind(this); //
    this.removeItem = this.removeItem.bind(this);// do i need this, idk?
    this.handleNumChange = this.handleNumChange.bind(this);
    this.joinItem = this.joinItem.bind(this);
    this.updateCheckbox = this.updateCheckbox.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user }); //check every time the app loads to see if user was already signed in 
      } 
    });
    let initialSubjects = [];
    fetch(proxyURL + subjAPI)
    .then(results => {
      return results.json();
    }).then(data => {
      initialSubjects = data.scc_lov_resp.lovs.lov.values.value.map((subject) => {
        return subject
      });
      console.log(initialSubjects);
      this.setState({
        subjects: initialSubjects,
      });
    });

    // var invocation = new XMLHttpRequest();
    // var xhr = createCORSRequest('GET', subjAPI);
    // if (!xhr) {
    //   throw new Error('CORS not supported');
    // }
    // .catch(error => console.log('Parsing failed', error))

    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user,
          loc:  items[item].loc,
          subj:  items[item].subj,
          crs:  items[item].crs,
          time:  items[item].time,
          priv:  items[item].priv,
          size: items[item].size,
          sizeLim: items[item].sizeLim,
          users: items[item].users,
        });
      }
      this.setState({
        items: newState
      });
    });
  }
  componentDidUpdate() {
    if(this.state.subject !== ''){

    }
  }
  handleClick() {
    this.setState({
      preference: !this.state.preference
    });
  }
  handleSubjChange(e) {
    this.setState({[e.target.name]: e.target.value, courses: []}, function () {
      console.log(this.state.subject);
      var urlifiedSubject = encodeURIComponent(this.state.subject);
      let initialCourses = [];
      console.log(courseAPI + urlifiedSubject + APIKey);
      fetch(proxyURL + courseAPI + urlifiedSubject + APIKey)
      .then(results => {
        return results.json();
      }).then(data => {
        if(data.ssr_get_courses_resp.course_search_result.subjects.subject.course_summaries !== null && data.ssr_get_courses_resp.course_search_result.ssr_crs_srch_count !== "1")  {
          initialCourses = data.ssr_get_courses_resp.course_search_result.subjects.subject.course_summaries.course_summary.map((course) => 
          {
            return course
      }); }
        console.log(initialCourses);
        const uniqueCourses = Array.from(new Set(initialCourses)); //get rid of repeats because Duke's API catalog is trash
        this.setState({
          courses: uniqueCourses,
        });
      });
    });
    // console.log(this.state.urlifiedSubject);
    
    // var urlifiedSubject = encodeURIComponent(this.state.subject);
    // console.log(urlifiedSubject);
    
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleNumChange(e) {
     const re = /^[0-9\b]+$/;

    // if value is not blank, then test the regex

    if (e.target.value === '' || re.test(e.target.value)) {
       this.setState({[e.target.name]: e.target.value})
    }

  }

  handleSubmit(e) {
    e.preventDefault();
    const re = /^[0-9\b]+$/;
    if(re.test(this.state.sizeLimit) ===false || this.state.sizeLimit < 2 || this.state.currentItem === '' || this.state.location === '' || this.state.time === '' ){
      alert("Errors found in form, please fix before submitting.");
      return;
    }
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email,
      loc: this.state.location,
      subj: this.state.subject,
      crs: this.state.course,
      time: this.state.time,
      priv: this.state.privacy,
      sizeLim: this.state.sizeLimit,
      size: this.state.size,
      users: [...this.state.users, this.state.user.displayName],
    }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: '',
      location: '',
      time: '',
      subject: '',
      course: '',
      privacy: false,
      sizeLimit: '',
      size: 1,
      users:[],
    });
  }
  removeItem(itemId) {
    const remRef = firebase.database().ref(`/items/${itemId}`);
    remRef.remove();
  }
  // editItem(itemId) {
  //   const editRef = firebase.database().ref(`/items/${itemId}`);
  //   return ref
  //   .child(id)
  //   .update(data)
  //   .then(() => ref.once('value'))
  //   .then(snapshot => snapshot.val())
  //   .catch(error => ({
  //     errorCode: error.code,
  //     errorMessage: error.message
  //   }));

  // }
  isNumber(e) {
    e = (e) ? e : window.event;
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }
  joinItem(itemId, user){
    var userIn = true;
    var joinRef = firebase.database().ref(`/items/${itemId}`);
    joinRef.child("users").once('value').then(function(snap) {
      var array = snap.val();
      for (var i in array) {
        var value = array[i]
        if (value === user) {
          alert("You are already in this study group!..but if you want to keep joining the group, knock yourself out.");
          userIn = false;
        }
      }
    });
    console.log(userIn);
    var postsRef = joinRef.child("users");
    postsRef.push(user);
    var databaseRef = joinRef.child("size");
    databaseRef.transaction(function(size) {
      var newValue = (size || 0) + 1;
      if (userIn === false){
        return;
      }
      // if (newValue > 4) {
      //     return; // abort the transaction
      // }
      return newValue;
    });

  }
  updateCheckbox(e){

    this.setState({privacy: e.target.checked});
  }
  login() { //pass in google auth provider with signInWithPopup
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }
  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }
  render() {
    let optionItems = this.state.subjects.map((subject) =>
      <option className="select-items" key={subject.code} value={subject.code + " - "+ subject.desc}>{subject.code + " - " + subject.desc}</option>
    );
    let courseItems = this.state.courses.map((course) => 
      <option className="select-items" key={course.subject+course.catalog_nbr+course.course_title_long+course.effdt} value={course.subject+course.catalog_nbr + ' ' + course.course_title_long}>{course.subject+course.catalog_nbr + ' ' + course.course_title_long}</option>
    );
    return (
      <div className='app'>
        <header>
          <div className="wrapper">
            <h1>Study Group Finder</h1>
            {this.state.user ?
              <div>
              <button onClick={this.logout}>Logout</button>     
              {/*<button onClick={this.handleClick}>Preferences</button> */}
              </div>          
              :
              <button onClick={this.login}>Log In</button>              
            }
          </div>
        </header>
        <div>

        </div>
        {this.state.preference ?
          <div> </div>
          :null}
        
        {this.state.user ?
          <div>
            <div className='user-profile'>
              <img src={this.state.user.photoURL} alt="You" />
            </div>
            <div className='container'>
                
                <section className='add-item'>
                  <form onSubmit={this.handleSubmit}>
                    <input type="text" name="username" placeholder="What's your name?" value={this.state.user.displayName || this.state.user.email} readOnly/>
                    <input type="text" name="currentItem" placeholder="Study group name" onChange={this.handleChange} value={this.state.currentItem} />
                    <input type="text" name="location" placeholder="Input study location" onChange={this.handleChange} value={this.state.location} />
                    <input type="text" name="time" placeholder="Time as 'mm/dd 00:00(AM/PM)'" onChange={this.handleChange} value={this.state.time} />
                    <input type="text" name="sizeLimit" placeholder="Input group size limit >2" defaultValue={this.state.sizeLimit} onChange={this.handleNumChange} />
                    <select name="subject" defaultValue={this.state.subject} onChange={this.handleSubjChange}>
                      {optionItems}
                    </select>
                    
                    {this.state.subject !== '' ?
                      
                      <select name="course" defaultValue={this.state.course} onChange={this.handleChange}>
                        {courseItems}
                      </select>
                      : null}
                    <label> 
                      <input className="checkBox" type="checkbox" name="privacy"  onClick={this.updateCheckbox} defaultValue={this.state.privacy}/>
                      Private?
                    </label>
                    {/*{this.state.privacy === true ?

                    }*/}
                    <button>Add Group</button>
                  </form>
                </section>
              <section className='display-item'>
                <div className="wrapper">
                  <ul>
                    {this.state.items.map((item) => {
                      return (
                        <li key={item.id}>
                          <h3>{item.title}</h3>
                          <h4>Created by: {item.user}</h4>
                          <h4>Time: {item.time}</h4>
                          <h4>Location: {item.loc}</h4>
                          <h4>Course: {item.crs}</h4>
                          <h4>Size: {item.size}/{item.sizeLim}</h4>                          
                             {(item.user === this.state.user.displayName || item.user === this.state.user.email || this.state.user.email === "prath.patel1@gmail.com")  ?
                               <div>
                                 <p><button onClick={() => this.removeItem(item.id)}>Remove Group</button></p>
                                 {/*<button onClick={() => this.editItem(item.id)}>Edit Group</button> */}
                               </div>
                               : 
                              <p>
                                 <button onClick={() => this.joinItem(item.id, this.state.user.displayName)}>Join Group</button></p>
                                }
                                {(this.state.user.email === "prath.patel1@gmail.com" && item.user !== "Prathmesh Patel") ?
                                <p>
                                 <button onClick={() => this.joinItem(item.id, this.state.user.displayName)}>Join Group</button></p>: null
                              }
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            </div>
          </div>
          :
          <div className='wrapper'>
            <div className='container'>
              <section className='display-item'>
                <div className="wrapper">
                  <ul>
                    {this.state.items.map((item) => {
                      if(item.priv === false){
                      return (
                        <li key={item.id}>
                          <h3>{item.title}</h3>
                          <h4>Created by: {item.user}</h4>
                          <h4>Time: {item.time}</h4>
                          <h4>Location: {item.loc}</h4>
                          <h4>Course: {item.crs}</h4>
                          <h4>Size: {item.size}/{item.sizeLim}</h4>
                        </li>
                      )}
                      return(
                        <li key={item.id}>
                          <p>You must be logged in to view details as this group is private </p>
                        </li>
                        )
                    })}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        }
        
        </div>
          
        
    );
  }
}
export default App;