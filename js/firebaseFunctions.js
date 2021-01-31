/**
 * @function _guid
 * @description Creates GUID for user based on several different browser variables
 * It will never be RFC4122 compliant but it is robust
 * @returns {Number}
 * @private
 */
function getGUID() {

    var nav = window.navigator;
    var screen = window.screen;
    var guid = nav.mimeTypes.length;
    guid += nav.userAgent.replace(/\D+/g, '');
    guid += nav.plugins.length;
    guid += screen.height || '';
    guid += screen.width || '';
    guid += screen.pixelDepth || '';

    return guid;
};

var firebaseConfig = {
  apiKey: "AIzaSyDF-bCz0fuvpWEBFYN9l6uqtunG-gN_lRI",
  authDomain: "spacexboard.firebaseapp.com",
  projectId: "spacexboard",
  storageBucket: "spacexboard.appspot.com",
  messagingSenderId: "310812025808",
  appId: "1:310812025808:web:f9ad53c435580ce6f0cfd5",
  databaseURL: "https://spacexboard-default-rtdb.firebaseio.com/",
  measurementId: "G-740F453PWR"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var analytics = firebase.analytics();

// Get a reference to the database service
var database = firebase.database();

let counterCleanOldVisitors = 0;

function addView(){
  firebase.database().ref('views/counter').once('value', (snapshot) =>{
      firebase.database().ref('views').set({
        counter: snapshot.val()+1
      });
  });

  var intervalAddVisitor = window.setInterval(function(){
  	counterCleanOldVisitors++;
  	counterCleanOldVisitors%=5;
  	if (counterCleanOldVisitors==0) {
  		console.log("CleanOldVisitors procedure")
  		addVisitor();
  	} else {
  		console.log("updateVisitor procedure")
  		updateVisitor();
  	}
  }, 300000);
  console.log("addVisitor procedure")
  addVisitor();
}

// Add visitor in the current minute
function addVisitor(){
  firebase.database().ref('visitors/'+getGUID()).set({
    value: getCurrentUTCTime()
  });

  //Clean old visitors
  firebase.database().ref('visitors/').once('value', (visitors) =>{
      visitors.forEach((child)=>{
        if(child.val().value < getCurrentUTCTime()-1800000){
          firebase.database().ref('visitors').child(child.key).remove();
        }
      });
  });
}

function updateVisitor(){
  firebase.database().ref('visitors/'+getGUID()).set({
    value: getCurrentUTCTime()
  });
}

function getRealtimeNumViews(view){
    firebase.database().ref('views/counter')
    .on('value', (snapshot)=>{
      view.innerHTML = snapshot.val();
    });
}

function getRealTimeVisitors(view){
  firebase.database().ref('visitors/').on('value', (visitorTime) =>{
      view.innerHTML = visitorTime.numChildren();
  });
}

function getRealtimeRss(view){
    firebase.database().ref('rss')
    .on('value', (snapshot)=>{
      snapshot.forEach((child)=>{
      console.log("test: "+child.val().title)
      })
    });
}

function getCurrentUTCTime(){
  let d = new Date();
  let currentTimeZoneOffsetInHours = d.getTimezoneOffset() / 60;
  let utc = new Date();
  utc.setHours( utc.getHours() + currentTimeZoneOffsetInHours );

  return utc.valueOf()
}

// Add one view more
addView();

// Get number of views from database
getRealtimeNumViews(document.getElementById("visitors"));

// Get visitors in the last 20min
getRealTimeVisitors(document.getElementById("visitorsNow"));

// Get RSS from firebase database
//getRealtimeRss(document.getElementById("XXX"));
