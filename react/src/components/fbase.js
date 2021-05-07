import firebase from  '../firebaseConfig';
import 'firebase/storage';

export const forgotPassword = (emailAddress) => firebase.auth().sendPasswordResetEmail(emailAddress);

export const changePassword = (email, oldPassword, newPassword, success, failure) => {

   return firebase.auth()
        .signInWithEmailAndPassword(email, oldPassword)
        .then((user) => {

            firebase.auth().currentUser.updatePassword(newPassword).then(() =>{

                success(user)

            }).catch(function(err){
                failure(err)
            });

        }).catch(function(err){
            failure(err)
        });
}

export const signOut = () => firebase.auth().signOut()

export const emailSignUp = (email, password) => firebase.auth().createUserWithEmailAndPassword(email, password)



export const emailSignIn = (email, password) => firebase.auth().signInWithEmailAndPassword(email, password)


export const googleAuth = () => {
    var provider = new firebase.auth.GoogleAuthProvider();

    if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider)
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)

    }


    // 
    // firebase.auth().signInWithPopup(provider)
    // .then(function(result) {
    //   // This gives you a Google Access Token. You can use it to access the Google API.
    //   var token = result.credential.accessToken;
    //   // The signed-in user info.
    //   var user = result.user;
    //   // ...
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });
}


export const facebookAuth = () =>{
   // https://vb-prepvent.firebaseapp.com/__/auth/handler
   var provider = new firebase.auth.FacebookAuthProvider();

   if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider);
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)
    }
   //return firebase.auth().signInWithPopup(provider)
  //  firebase.auth().signInWithPopup(provider).then(function(result) {
  //   // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  //   var token = result.credential.accessToken;
  //   // The signed-in user info.
  //   var user = result.user;
  //   // ...
  // }).catch(function(error) {
  //   // Handle Errors here.
  //   var errorCode = error.code;
  //   var errorMessage = error.message;
  //   // The email of the user's account used.
  //   var email = error.email;
  //   // The firebase.auth.AuthCredential type that was used.
  //   var credential = error.credential;
  //   // ...
  // });
}


export const twitterAuth = () => {
    var provider = new firebase.auth.TwitterAuthProvider();

    if (typeof window.orientation !== 'undefined') { 
        // mobile

        firebase.auth().signInWithRedirect(provider);
        return firebase.auth().getRedirectResult()
    } else {
        // web
        return firebase.auth().signInWithPopup(provider)
    }
    // return firebase.auth().signInWithPopup(provider)
    // firebase.auth().signInWithPopup(provider).then(function(result) {
    //   // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
    //   // You can use these server side with your app's credentials to access the Twitter API.
    //   var token = result.credential.accessToken;
    //   var secret = result.credential.secret;
    //   // The signed-in user info.
    //   var user = result.user;
    //   // ...
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });
}

export const uploadImage = (ref, name, file) => firebase.storage().ref().child(`${ref}/${name}`).put(file);