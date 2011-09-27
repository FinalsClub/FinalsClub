<div class="postContainer" id="post-${_id}">
	<div class="postVoteContainer" data-postid="${_id}">
		<div class="vote-tally-rect vote-up">${votes}</div>
	</div>

	<div class="postDisplayContainer">
		<div class="postBody">${body}</div>
		<div class="postFooter">
			<span class="userName">${userName}</span>
				&mdash;
			<span class="userAffil">${userAffil}</span>

			Comments: <span class="commentAmt">${comments.length}</span>
		</div>
	</div>

	<div class="commentContainer hidden">
	</div>

	<form class="commentForm hidden">
		<input type="hidden" name="postid" value="${_id}" />
		<textarea id="commentText" name="commentText" disabled="disabled"></textarea>
		<input type="submit" value="Post Comment" disabled="disabled">
		<input type='checkbox' name='anonymous' /> Post anonymously
	</form>
</div>
