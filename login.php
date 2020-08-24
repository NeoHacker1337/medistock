<?php
include("header.php");
?>

	<!-- MAIN CONTENT
		================================================== -->
	<div class="main-content  full-width  inner-page">
		<div class="background-content"></div>
		<div class="background">
			<div class="shadow"></div>
			<div class="pattern">
				<div class="container">







					<div class="row sticky-stop">




						<div class="col-md-12">






							<div class="row">





								<div class="col-md-9 center-column" id="content">








<div class="row">
  <div class="col-md-6">
    <div class="well">
      <h2>New Customer</h2>
      <p><strong>Register Account</strong></p>
      <p style="padding-bottom: 10px">By creating an account you will be able to shop faster, be up to date on an order's status, and keep track of the orders you have previously made.</p>
      <a href="register.php" class="btn btn-primary">Continue</a></div>
  </div>
  <div class="col-md-6">
    <div class="well">
      <h2>Returning Customer</h2>
      <p><strong>I am a returning customer</strong></p>
      <form action="http://demo2.ninethemes.net/zeexo/opencart/49/index.php?route=account/login" method="post" enctype="multipart/form-data">
        <div class="form-group">
          <label class="control-label" for="input-email">E-Mail Address</label>
          <input type="text" name="email" value="" placeholder="E-Mail Address" id="input-email" class="form-control" />
        </div>
        <div class="form-group" style="padding-bottom: 10px">
          <label class="control-label" for="input-password">Password</label>
          <input type="password" name="password" value="" placeholder="Password" id="input-password" class="form-control" />
          <a href="forgotten.php">Forgotten Password</a></div>
        <input type="submit" value="Login" class="btn btn-primary" />

        <input type="hidden" name="redirect" value="indexe223.html?route=account/account" />

      </form>
    </div>
  </div>
</div>


									</div>

						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-12">

					</div>
				</div>
			</div>
		</div>
	</div>
</div>






<?php
include("footer.php");
?>