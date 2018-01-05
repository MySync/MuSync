$(document).ready(function(){
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
});

// Initialize Firebase
var config = {
	apiKey: "AIzaSyCfOvCWypQp5Qm-qoUnk-tEYf8ByceOx1U",
	authDomain: "musync-95356.firebaseapp.com",
	databaseURL: "https://musync-95356.firebaseio.com",
	projectId: "musync-95356",
	storageBucket: "musync-95356.appspot.com",
	messagingSenderId: "1066849694244"
};

firebase.initializeApp(config);

// Firebase Components
var auth = firebase.auth();
var db = firebase.database();


// ========= GLOBAL VARIABLES ============

// Currently signed in user
var currentUser;

// YouTube API Keys
var YOUTUBE_API_KEY = "AIzaSyDK8YPIlc9oLkjUl-zvZCQmJR5W-z1VTZY";

// Reference Paths
var usersRefPath = '/users'


// ========= INDEX/SIGNUP PAGE BUTTON LISTENERS ==========


//Login Button Event
$("#form-login").on("submit", function(e){
	
	e.preventDefault();

	//Get email and password
	var loginuser = $("#username").val();
	var loginpass = $("#password").val();

	// if (loginuser == "") {
	// 	console.log('please enter an email');
	// 	return;
	// }
	// else if (loginpass == "") {
	// 	console.log('please enter a password');
	// 	return;
	// }

	$("#form-login").validate({
		rules: {
			user: {
				required: true,
				email: true
			},
			pass: {
				required: true
			}
		},
		messages: {
			user: {
				required: 'Please enter an email to login',
				email: 'Please enter a valid email'
			}
		},
		errorElement : 'div',
	    errorPlacement: function(error, element) {
	      var placement = $(element).data('error');
	      if (placement) {
	        $(placement).append(error)
	      } else {
	        error.insertAfter(element);
	      }
	    }
	});


	console.log(loginuser, loginpass);

	if (validateEmail(loginuser)) {
		//Sign the user in
		auth.signInWithEmailAndPassword(loginuser, loginpass)
		.then(function(){
			
			currentUser = auth.currentUser;

			console.log(currentUser);
			console.log('sign in success!');
			window.location = 'inapp.html';

			var referencePath = usersRefPath + '/' + currentUser.uid + '/online';
			db.ref(referencePath).set(true);

			

		})
		.catch(function(error) {
			
			// Handle errors
			var errorCode = error.code;
			var errorMessage = error.message;

			

			// if (errorMessage === "There is no user record corresponding to this identifier. The user may have been deleted.") {
			// 	$("#username").attr('data-error', 'Invalid username!');
			// }

			console.log("error code: " + errorCode);
			console.log("error msg: " + errorMessage);

		});
	}
	else {
		console.log('please enter a valid email');
	}

	
});

//Signup Button Event
$("#btnSignup").on("click", function(e) {
	
	e.preventDefault();

	var userName = $("#signup-name").val();
	var userEmail = $("#signup-email").val();
	var userPass = $("#signup-password").val();
	var userPassConfirm = $("#signup-confirm-password").val();

	// Form Validation
	// if (userName == "" || userEmail == "" || userPass == "" || userPassConfirm == "") {
	// 	console.log("all fields are required!");
	// 	return false;
	// }

	if (userPass !== userPassConfirm) {
		console.log('passwords do not match!');
		
		$("#signup-password").val("");
		$("#signup-confirm-password").val("");

		return false;
	}

	// $("#signup-form").validate({
	// 	rules: {
	// 		signup-confirm-password: {
	// 			required: true,
	// 			minlength: 5,
	// 			equalTo: "#signup-password"
	// 		}
	// 	},
	// 	messages {
	// 		signup-confirm-password: {
	// 			equalTo: "Passwords do not match!"
	// 		}
	// 	}
	// });

	//TODO: check if email already exists - complete
	//Check performed in emailExistsInDB();

	if(validateEmail(userEmail)) {

		// Sign up new user and log them in
		auth.createUserWithEmailAndPassword(userEmail, userPass)
		.then(function() {
			
			var userCreated = auth.currentUser;
			
			console.log(userCreated);
			console.log('sign up success!');

			window.location = 'inapp.html';
		})
		.catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;

			console.log('sign up error!');
		});
	}
	else {
		console.log('please enter a valid email');
	}

});

$("#logout").on("click", function(){

	// Set the online status of the current user to false
	var referencePath = usersRefPath + '/' + currentUser.uid + '/online';
	db.ref(referencePath).set(false);

	auth.signOut().then(function() {
		console.log('signed out user: ' + currentUser.email);
	});


});


// A realtime listener to check user state
auth.onAuthStateChanged(function(firebaseUser) {

	// if a user exists
	if(firebaseUser) {
		
		currentUser = firebaseUser;
		console.log(currentUser);

		// check to see if email already exists
		emailExistsInDB(currentUser.email);
		updateUserPlaylistOptions();
		
		// Set the logged in user's email
		$("#my-account").text(currentUser.email);
		$("#profile-page-my-account").text(currentUser.email);

		$("#logged-user-name").text(currentUser.displayName);
		$("#logged-user-email").text(currentUser.email);
		$("#logged-user-phone").text(currentUser.phoneNumber);

		// if(window.location == 'index.html') {
		// 	window.location.replace('inapp.html');
		// }

	}
	else {
		console.log('no user logged in');

		currentUser = null;
	}
});




// ============= FUNCTIONS ============

// Validate Login Email
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function init() {
	gapi.client.setApiKey(YOUTUBE_API_KEY);

	//load YouTube library
	gapi.client.load("youtube", "v3", function() {
		// YouTube API is ready!
	});
}

function addUserToDB(uid) {
	var referencePath = usersRefPath + '/' + uid;
	db.ref(referencePath).set({
		email: currentUser.email,
		name: currentUser.displayName,
		online: true,
		created: currentUser.metadata.creationTime,
		lastSignInTime: currentUser.metadata.lastSignInTime
	});

	console.log(currentUser.email + ' was added to DB');

}

function emailExistsInDB(email) {
	db.ref(usersRefPath).once('value', function(snapshot) {
		console.log(snapshot.val());

		var existingUsers = [];

		 snapshot.forEach(function(childSnapshot) {
		    var childData = childSnapshot.val();
		    var childEmail = childData.email;

		    existingUsers.push(childEmail);

		    //console.log(childEmail);
		 });
		 console.log(existingUsers);

		 if (existingUsers.includes(email)) {
		 	console.log('user already exists');
		 }
		 else {
		 	console.log('new user!');
		 	addUserToDB(currentUser.uid);
		 }
		 
	});	
}

// Function to add playlist in the '+' modal
function updateUserPlaylistOptions() {
	//var myUID = currentUser.uid;

	db.ref('/users/' + currentUser.uid + '/playlist/').on('value', function(snapshot) {

		
		$(".playlist-list").empty();
		$("#dropdown2").empty();

		snapshot.forEach(function(childSnapshot) {
			//console.log(childSnapshot.key);

			var myPlaylist = $("<p><input class='playlist-checkbox' type='checkbox' id='" + childSnapshot.key + "'/>"
				+ "<label for='" + childSnapshot.key + "'>" + childSnapshot.key + "</label></p>");


			var myPlaylistOptions = $("<li><a class='playlist-option' id='playlist-" + childSnapshot.key + "' class='white-text thin' href='#!'>" + childSnapshot.key + "</a></li>")

			$(".playlist-list").append(myPlaylist);
			$("#dropdown2").append(myPlaylistOptions);
		});

	});
}

// Function to add songs onto the playlist at bottom of page
function showUserPlaylist(playlist) {

	db.ref('/users/' + currentUser.uid + '/playlist/' + playlist).on('value', function(snapshot) {

		// delete dateCreated field from playlist
		// Hack?!
		db.ref('/users/' + currentUser.uid + '/playlist/' + playlist + '/dateCreated').set(null);

		$(".playlist-block-container").empty();

		snapshot.forEach(function(childSnapshot) {

			var songInPlaylist = childSnapshot.val();
			var songURL = childSnapshot.key;

			// Create and prepend playlist song for appropriate playlist
			var songToAdd = $("<div class='playlist-cover-block card-panel hoverable'>" 
				+ "<i id='delete-song-" + songURL + "' class='material-icons grey-text close-button right'>close</i>"
				+ "<img class='playlist-song-img' id='" + songURL + "' src='" + songInPlaylist.thumbnail + "'>"
				+ "<p class='playlist-song-title text-center'>" + songInPlaylist.name + "</div>");


			$(".playlist-block-container").prepend(songToAdd);

		});

		$(".playlist-block-container").on("click", ".playlist-song-img", function() {

			var myVideoID = $(this).attr('id');

			$("#video-player").attr({
				src: 'https://www.youtube.com/embed/' + myVideoID
			});
		});

		// Delete selected song from playlist
		$(".playlist-cover-block").on("click", ".close-button", function() {
			//console.log($(this).parent().attr('class'));

			var songIDToDelete = $(this).next().attr('id');

			if(confirm('Are you sure you want to delete?')) {

				db.ref('/users/' + currentUser.uid + '/playlist/' + playlist).child(songIDToDelete).remove();

				$(this).parent().remove();
			}

		});

	});
}



// ============ INAPP BTN LISTENER =============

$("#btnCreatePlaylist").on("click", function(e){

	e.preventDefault();

	var playlistName = $("#playlistName").val();

	var myUID = currentUser.uid;

	// Create a Ref Path
	var playlistRefPath = '/users/' + myUID + '/playlist/' + playlistName;

	var today = Date();

	db.ref(playlistRefPath).set({dateCreated: today});

	console.log(playlistRefPath);

});


$("#btnSearch").on("click", function(e) {

	e.preventDefault();

	var searchStr = $("#search").val();

	// Prepare the request
	$.ajax({
		url: 'https://www.googleapis.com/youtube/v3/search',
		type: 'GET',
		dataType: 'json',
		data: {
			part: 'snippet',
			q: searchStr,
			maxResults: 15,
			order: 'viewCount',
			type: 'video',
			key: YOUTUBE_API_KEY
		}
	})
	.done(function(response) {
		console.log("success");
		console.log(response);

		// VideoId for 1st item in the list from response
		var firstVideo = response.items[0].id.videoId;

		// Display the 1st item in the youtube player
		$("#video-player").attr({
			src: 'https://www.youtube.com/embed/' + firstVideo
		});

		// Clear the results list div
		$(".song-block-container").empty();

		// Append Video Details for each item in list of response
		for (var i = 0; i < response.items.length; i++) {
			var resultsDIV = $(
				"<div class='song-block card-panel hoverable'>" +
					"<div class='song-name' data-video='" + response.items[i].id.videoId + "'>" + response.items[i].snippet.title +
					"</div>" +
					"<div data-target='modal1' id='"+ i + "' class='song-add-btn modal-trigger'><i class='material-icons'>add_circle</i></div>");

			$(".song-block-container").append(resultsDIV);
		}

		// If a card is clicked, display that video in the player
		$(".song-name").on("click", function() {
			var videoId = $(this).attr('data-video');
			
			// name of song currently on video player (to be used to pull lyrics)
			// currentSong = $(this).text();
			// console.log(currentSong);

			$("#video-player").attr({
				src: 'https://www.youtube.com/embed/' + videoId
			});
		});

		$(".song-add-btn").on("click", function(){
			var selectedItemID = $(this).attr('id');

			$("#btnAdd").on("click", function() {

			var myUID = currentUser.uid;

			// 	// Get selected item's details
			var myVideoID = response.items[selectedItemID].id.videoId;
			var myVideoTitle = response.items[selectedItemID].snippet.title;
			var myVideoThumb = response.items[selectedItemID].snippet.thumbnails.high.url;
			var myVideoDesc = response.items[selectedItemID].snippet.description;



			$(".playlist-checkbox:checked").each(function() {

				var playlistName = $(this).attr('id');

				var playlistRefPath = '/users/' + myUID + '/playlist/' + playlistName + '/' + myVideoID;
				
			 	// Save playlist & songs for logged in user
				db.ref(playlistRefPath).set({
					name: myVideoTitle,
					thumbnail: myVideoThumb,
					description: myVideoDesc
				});
			});


		});
		});
		


	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
});



$("#dropdown2").on("click", ".playlist-option", function() {
	var playlistTitleToShow = $(this).text();

	$("#playlist-title").text(playlistTitleToShow);

	showUserPlaylist(playlistTitleToShow);

});



// Lyrics Button Event Listener
$("#lyrics-button").on("click", function(){

	var currentSong = $("#song-lyrics").val();

	// Lyrics AJAX call
	$.ajax({
	  url: "http://api.musixmatch.com/ws/1.1/track.search?q=" + currentSong + "&apikey=e5398b313d3765d91c9d09e9fa8a06e5",
	  method: "GET",
	  dataType: "jsonp",
	  data: {
	  "format": "jsonp"
	  }
	}).done(function(result){
	    console.log(result);
	    result = JSON.parse(result.message.body.track_list[0].track.track_id);
	    console.log(result);
	    $.ajax ({
		    url: "http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=" + result + "&apikey=e5398b313d3765d91c9d09e9fa8a06e5",
		    method: "GET",
		    dataType: "jsonp",
		    data: {
		    "format": "jsonp"
		    }
	  	}).done(function(data1){
	    	console.log (data1.message.body.lyrics.lyrics_body);

		  	var p = $("<p>");
		   	p.html(data1.message.body.lyrics.lyrics_body.replace(/\n/g, "<br />"));

		   	$("#lyrics-paragraph").empty();
	  		$("#lyrics-paragraph").append(p);
	 	});

	});
});


// ============= PROFILE BTN LISTENER ===============

$("#saveProfileBtn").on("click", function() {

	
	var user = firebase.auth().currentUser;

	user.updateProfile({
	  displayName: $("#profile-name").val(),
	  phoneNumber: $("#profile-phone").val()
	}).then(function() {
	  // Update successful.
  	$("#logged-user-name").text(currentUser.displayName);
	$("#logged-user-email").text(currentUser.email);
	$("#logged-user-phone").text(currentUser.phoneNumber);
	  console.log('user info update successful');

	}).catch(function(error) {
	  
	  //Error
	  var errorCode = error.code;
	  var errorMessage = error.message;

	  console.log(errorCode);
	  console.log(errorMessage);
	});
});