<?php
include("header.php");
?>
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - My Profile page in Bootstrap</title>
  	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/js/bootstrap.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.3/angular.js"></script>
		<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.3/ui-bootstrap-tpls.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.3/ui-bootstrap-tpls.min.js"></script>
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.3/ui-bootstrap.js"></script>
	<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.css" rel="stylesheet" type="text/css"/>
	<link href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css" rel="stylesheet" type="text/css"/>
	<link href="/stylesheets/sb-admin-2.css" rel="stylesheet" type="text/css"/>
	<link href="/stylesheets/circle-buttons.css" rel="stylesheet" type="text/css"/>
	<link href="/stylesheets/panel-table.css" rel="stylesheet" type="text/css"/>
	<link href="/stylesheets/main.css" rel="stylesheet" type="text/css"/>

</head>
<body>
<!-- partial:index.partial.html -->
<div class="container">
  <div class=".col-xs-4 .col-md-offset-2">
    <div class="panel panel-default panel-info Profile">
      <div class="panel-heading"> My Profile </div>
      <div class="alert alert-success">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        <strong>Success!</strong> Profile successfully saved
      </div>
      <div class="alert alert-warning">
        <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        <strong>Oops!</strong> Profile not saved. Try later.
      </div>
      <div class="col-md-9"><div class="panel-body">
        <div class="form-horizontal">
					          <form>
						            <div class="form-group">
							              <label class="col-sm-2 control-label">First Name</label>
              							<div class="col-sm-4">
                								<input class="form-control" type="text" name="firstName"
                  									placeholder="First Name" ng-model="me.firstName" required>
              							</div>
            						</div>
						            <div class="form-group">
							              <label class="col-sm-2 control-label">Last Name</label>
              							<div class="col-sm-4">
                								<input class="form-control" type="text" name="lastName"
                  									placeholder="Last Name" ng-model="me.lastName">
              							</div>
            						</div>
						            <div class="form-group">
              							<label class="col-sm-2 control-label">Email</label>
              							<div class="col-sm-4">
                								<input class="form-control" type="text" name="email"
                  									placeholder="Email" ng-model="me.email" required>
              							</div>
            						</div>

            <div class="form-group">
              							<label class="col-sm-2 control-label">Location</label>
              							<div class="col-sm-4">
                								<input class="form-control" type="text" name="location"
                  									placeholder="Location" ng-model="me.email">
              							</div>
            						</div>
            <div class="form-group">
              							<label class="col-sm-2 control-label">Phone</label>
              							<div class="col-sm-4">
                								<input class="form-control" type="text" name="phone"
                  									placeholder="xxx-xxx-xxxx" ng-model="me.email" required>
              							</div>
            						</div>
						            <div class="form-group">
              							<div class="col-sm-offset-2 col-sm-10">
                								<button class="btn btn-primary" ng-click="updateMe()">Update</button>
              							</div>
            						</div>
					          </form>
        				</div>  <!-- end form-horizontal -->
      </div> <!-- end panel-body -->
      </div>

      <div class="col-md-3 " id="column-right"><div class="sticky-top  fixed-on">

									<div class="box">
  <div class="box-heading">Account</div>
  <div class="strip-line"></div>
  <div class="box-content">
    <ul class="list-box">

      <li><a href="account.php">My Profile</a> </li>
      <li><a href="history.php">Order History</a></li>
      <li><a href="pending.php">Pending Status</a></li>
      <li><a href="productlist.php">Product List</a></li>


    </ul>
  </div>


							</div>
							</div></div>
    </div> <!-- end panel -->

  </div> <!-- end size -->
</div> <!-- end container-fluid -->
<!-- partial -->

</body>
</html>




<?php
include("footer.php");
?>