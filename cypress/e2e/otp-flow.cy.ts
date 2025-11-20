describe('OTP verification flow', () => {
  const verificationUrl =
    '/verify-otp?email=test@example.com&type=verification';

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('submits a 10-digit OTP successfully', () => {
    cy.intercept('POST', '**/auth/verify-otp', {
      statusCode: 200,
      body: { message: 'Código verificado', requiresProfile: true },
    }).as('verifyOtp');

    cy.visit(verificationUrl);

    cy.get('input[aria-label^="Dígito"]').first().type('1234567890');
    cy.contains('Verificar código').click();

    cy.wait('@verifyOtp').its('request.body').should('deep.equal', {
      email: 'test@example.com',
      otp: '1234567890',
    });
  });

  it('muestra mensaje de error cuando el OTP es incorrecto', () => {
    cy.intercept('POST', '**/auth/verify-otp', {
      statusCode: 400,
      body: { message: 'Código incorrecto. Te quedan 2 intentos.' },
    }).as('verifyOtpError');

    cy.visit(verificationUrl);

    cy.get('input[aria-label^="Dígito"]').first().type('0000000000');
    cy.contains('Verificar código').click();

    cy.wait('@verifyOtpError');
    cy.contains('Código incorrecto').should('be.visible');
    cy.contains('2 intentos').should('be.visible');
  });
});


