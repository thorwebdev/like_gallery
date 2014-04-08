var response_data;
//dropbox
localStorage.setItem('upload_counter', 0);
var dropbox_options = {
    files: [],
    success: function() {dropbox_options.files = [];},
    progress: function(progress) {console.log('dropbox_progress: '+progress)},
    cancel: function() {},
    error: function(errmsg) {}
}
//end dropbox
		//authorization
		var client_id = "...";
		var redirect_url = "http://tschaeff.bplaced.net/likegallery"
		var url = "https://instagram.com/oauth/authorize/?client_id="+client_id+"&redirect_uri="+redirect_url+"&response_type=token"
		var access_token = window.location.hash;
		access_token = access_token.substring(14);
		//accesing user information
		var liked_media_url = "https://api.instagram.com/v1/users/self/media/liked"
		var liked_media_count = 16;
		var liked_media_max_like_id;
		
		function getImages(request_data){
			//show loading image
			var loading_img = $('<center></center>').attr('id','loading_img');
			$('body').append(loading_img);
			//make ajax request
			$.ajax({
				  dataType: "jsonp",
				  url: liked_media_url,
				  data: request_data,
				  success: function( data, textStatus, jqXHR ){
						console.log('success');
						response_data = data;
						response_data.data.forEach(
							function(images){
								//remove loading image
								$('#loading_img').remove();
								liked_media_max_like_id = images.id;
								var img_container = $('<div></div>').addClass('img_container');
								var img = $('<img />').addClass('img_content').attr('src', images.images.low_resolution.url).attr('selected', false);
								$(img_container).append(img);
								$('#content').append(img_container);
							}
						);
					}
				});
		}
		
		$(function () {
			if(!!access_token || localStorage.getItem('access_token') != null){
				if(!!access_token){
					localStorage.setItem('access_token', access_token);
				}
				//get liked media
				var request_data = {"access_token": localStorage.getItem('access_token'), "count": liked_media_count, "max_like_id": liked_media_max_like_id};
				getImages(request_data);
				//load more when button clicked
				$('#more').bind('click', 
					function(){
						request_data = {"access_token": localStorage.getItem('access_token'), "count": liked_media_count, "max_like_id": liked_media_max_like_id};
						getImages(request_data);
					}
				);
				//load more when scrolled to end of page
				$(window).scroll(
					function(){
						if(document.body.scrollHeight - $(this).scrollTop()  <= $(this).height()){
							request_data = {"access_token": localStorage.getItem('access_token'), "count": liked_media_count, "max_like_id": liked_media_max_like_id};
							getImages(request_data);
						}
					}
				);
				//add to dropbox options when clicked
				$(document).on('click', '.img_content', 
					function(){
						var selected = $(this).attr('selected');
						//only add to array if not yet selected
						if(!selected){
							$(this).attr('selected', true);
							var counter = parseInt(localStorage.getItem('upload_counter'));
							localStorage.setItem('upload_counter', counter+1);
							var file_spez = {"url": $(this).attr('src'), "filename": "likegallery_"+counter+".jpg"};
							dropbox_options.files.push(file_spez);
							var dropbox_button = Dropbox.createSaveButton(dropbox_options);
							var file_counter = $('<span></span>').append("("+(counter+1)+" files)");
							$('#dropbox_save_button').remove();
							var save_button = $('<div></div>').attr('id', 'dropbox_save_button');
							$(save_button).append(dropbox_button).append(file_counter);
							$('#header').append(save_button);
							$(this).addClass('dropbox_upload shadow');
						}
						else{
							//todo: delete from dropbox_options array
						}
					}
				);
			}
			else{
				var login_link = $('<a></a>').addClass('login_link').attr('href', url);
				$(login_link).append('Login with Instagram');
				$('#main_container').append(login_link);
			}			
		});