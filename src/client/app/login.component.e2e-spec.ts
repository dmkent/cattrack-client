describe('Login', () => {
  let params = browser.params;

  beforeEach( () => {
    browser.get('/login');
  });

  it('should login successfully', function() {
    element( by.css('[name="user-input"]') ).sendKeys( params.login.user );
    element( by.css('[name="pass-input"]') ).sendKeys( params.login.pass );
    element( by.css('div form button') ).click();
  });

});
