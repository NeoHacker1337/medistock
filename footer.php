

     <!-- FOOTER
          ================================================== -->
     <div class="footer  full-width ">
          <div class="background-footer"></div>
          <div class="background">
               <div class="shadow"></div>
               <div class="pattern">
                    <div class="container">
						<div class="advanced-grid  advanced-grid-48686256  " style="margin-top: 0px;margin-left: 0px;margin-right: 0px;margin-bottom: 0px;">


          <div style="">
                <div class="container">
                    <div style="padding-top: 0px;padding-left: 0px;padding-bottom: 0px;padding-right: 0px;">
                         <div class="row">
                                   <div class="col-md-12">
                                                  <div class="market1-footer-brands"></div></div>
                                             </div><div class="row">
 </div><div class="row">
<div class="col-md-12">
<div class="footer-newsletter d-flex" id="newsletter48686256">
	<h5>Join our Newsletter<span>And get $20 for first order!</span></h5>
	<div class="content">
		<input type="text" class="email" placeholder="Your e-mail address" />
					<div class="checkbox">
								<label for="newsletterCheck">
					<input type="checkbox" class="custom-control-input" id="newsletterCheck">
					<span class="custom-control-indicator"></span>
					Accept <a href="index99e4.html?route=information/information&amp;information_id=5">terms and conditions</a> and <a href="index1679.html?route=information/information&amp;information_id=3">privacy policy</a>
				</label>
			</div>
			</div>
	<a class="button subscribe">Subscribe</a>
</div>

<script type="text/javascript">
$(document).ready(function() {
	function Unsubscribe() {
		$.post('indexa47f.html?route=extension/module/newsletter/unsubscribe',
			{
				email: $('#newsletter48686256 .email').val()
			}, function (e) {
				$('#newsletter48686256 .email').val('');
				alert(e.message);
			}
		, 'json');
	}

	function Subscribe() {
					if($("#newsletterCheck").is(":checked")) {
				$.post('index15fb.html?route=extension/module/newsletter/subscribe',
			{
				email: $('#newsletter48686256 .email').val()
			}, function (e) {
				if(e.error === 1) {
					var r = confirm(e.message);
					if (r == true) {
					    $.post('indexa47f.html?route=extension/module/newsletter/unsubscribe', {
					    	email: $('#newsletter48686256 .email').val()
					    }, function (e) {
					    	$('#newsletter48686256 .email').val('');
					    	alert(e.message);
					    }, 'json');
					}
				} else {
					$('#newsletter48686256 .email').val('');
					alert(e.message);
				}
			}
		, 'json');
					} else {
								alert('Please accept terms and conditions!');
			}
			}

	$('#newsletter48686256 .subscribe').click(Subscribe);
	$('#newsletter48686256 .unsubscribe').click(Unsubscribe);
	$('#newsletter48686256 .email').keypress(function (e) {
	    if (e.which == 13) {
	        Subscribe();
	    }
	});
});
</script>


                                   </div>
                                                        </div>
                    </div>
               </div>
          </div>


     </div>






                    </div>
               </div>
          </div>
     </div>

     <!-- COPYRIGHT
          ================================================== -->
     <div class="copyright  full-width ">
          <div class="background-copyright"></div>
          <div class="background">
               <div class="shadow"></div>
               <div class="pattern">
                    <div class="container">



	<div class="market1-copyright">
  <p class="text">Powered By MediStock © 2020</p>
  <div class="payment">
    <a href="#"><img src="image/catalog/zeexo/skrill.png" alt="Skrill"></a>
    <a href="#"><img src="image/catalog/zeexo/american-express.png" alt="American express"></a>
    <a href="#"><img src="image/catalog/zeexo/paypal.png" alt="Papypal"></a>
    <a href="#"><img src="image/catalog/zeexo/master-card.png" alt="Master card"></a>
    <a href="#"><img src="image/catalog/zeexo/maestro.png" alt="Maestro"></a>
  </div>
</div>


                         <!--
                         OpenCart is open source software and you are free to remove the powered by OpenCart if you want, but its generally accepted practise to make a small donation.
                         Please donate via PayPal to donate@opencart.com
                         //-->
                         <p>Powered By <a href="http://www.opencart.com/">OpenCart</a>. Your Store &copy; 2020</p>
                         <!--
                         OpenCart is open source software and you are free to remove the powered by OpenCart if you want, but its generally accepted practise to make a small donation.
                         Please donate via PayPal to donate@opencart.com
                         //-->
                    </div>
               </div>
          </div>
     </div>


     <script type="text/javascript" src="catalog/view/theme/zeexo/js/megamenu.js"></script>
</div>

<!-- modal (AddToCartProduct) -->
<div class="modal  fade"  id="modalAddToCartProduct" tabindex="-1" role="dialog" aria-label="myModalLabel" aria-hidden="true">
     <div class="modal-dialog">
          <div class="modal-content ">
               <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true"><span class="icon icon-clear"></span></button>
               </div>
               <div class="modal-body">
                    <div class="tt-modal-addtocart mobile">
                         <div class="tt-modal-messages">
                              <i class="fas fa-check"></i> Added to cart successfully!                         </div>
                         <a href="#" class="btn-link btn-close-popup">CONTINUE SHOPPING</a>
                       <a href="index630e.html?route=checkout/cart" class="btn-link">VIEW CART</a>
                       <a href="indexf1a8.php?route=checkout/checkout" class="btn-link">PROCEED TO CHECKOUT</a>
                    </div>
                    <div class="tt-modal-addtocart desctope">
                         <div class="d-flex">
                              <div class="left">
                                   <div class="tt-modal-messages">
                                        <i class="fas fa-check"></i> Added to cart successfully!                                   </div>
                                   <div class="tt-modal-product">
                                        <div class="tt-img">
                                             <img src="image/catalog/blank2.gif" alt="">
                                        </div>
                                        <h2 class="tt-title"><a href="product.html">Flared Shift Dress</a></h2>
                                        <div class="tt-qty">
                                             Qty: <span>1</span>
                                        </div>
                                   </div>
                                   <div class="tt-product-total">
                                        <div class="tt-total">
                                             <span class="tt-price">$324</span>
                                        </div>
                                   </div>
                              </div>
                              <div class="right">
                                   <div class="tt-cart-total">
                                        <p class="text-total" style="margin: 0px">There are 1 items in your cart</p>
                                        <div class="tt-total">
                                             Total: <span class="tt-price">$324</span>
                                        </div>
                                   </div>
                                   <a href="#" class="btn btn-border btn-close-popup">CONTINUE SHOPPING</a>
                                   <a href="index630e.html?route=checkout/cart" class="btn btn-border">VIEW CART</a>
                                   <a href="indexf1a8.php?route=checkout/checkout" class="btn">PROCEED TO CHECKOUT</a>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</div>

<a href="#" class="scrollup"><i class="fa fa-chevron-up"></i></a>
</div>
</div>

</body>
</html>