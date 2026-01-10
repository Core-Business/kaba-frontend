const buildFakeToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'user-google',
      email: 'designmarr@gmail.com',
      org: 'org-google',
      ws: 'ws-default',
      role: 'WORKSPACE_ADMIN',
    }),
  );
  return `${header}.${payload}.signature`;
};

describe('Google OAuth Callback', () => {
  it('guarda el token y redirige al dashboard', () => {
    const fakeToken = buildFakeToken();

    cy.intercept('GET', '**/auth/contexts', {
      statusCode: 200,
      body: { availableContexts: [], organizations: [] },
    }).as('contexts');

    cy.visit(
      `/google/callback#accessToken=${fakeToken}&refreshToken=fake-refresh&expiresIn=3600`,
    );

    cy.wait('@contexts');

    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('kaba.token')).to.eq(fakeToken);
      const workspace = JSON.parse(
        win.localStorage.getItem('kaba.lastWorkspace') || '{}',
      );
      expect(workspace).to.have.property('orgId', 'org-google');
      expect(workspace).to.have.property('wsId', 'ws-default');
    });
  });
});

